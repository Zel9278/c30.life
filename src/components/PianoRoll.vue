<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import {
  loadMidiFromUrl,
  type MidiData,
  type MidiNote,
} from "../utils/midiParser"

const props = withDefaults(
  defineProps<{
    midiUrl?: string
    noteColor?: string
    backgroundColor?: string
    pixelsPerBeat?: number // pixels per beat (quarter note)
    opacity?: number
    colorByChannel?: boolean
  }>(),
  {
    midiUrl: "/My bad song(piano arrange).mid",
    noteColor: "#34d399",
    backgroundColor: "transparent",
    pixelsPerBeat: 50, // pixels per beat
    opacity: 0.3,
    colorByChannel: true,
  },
)

// Channel colors (16 channels)
const CHANNEL_COLORS = [
  "#ef4444", // 0: red
  "#f97316", // 1: orange
  "#eab308", // 2: yellow
  "#84cc16", // 3: lime
  "#22c55e", // 4: green
  "#14b8a6", // 5: teal
  "#06b6d4", // 6: cyan
  "#0ea5e9", // 7: sky
  "#3b82f6", // 8: blue
  "#6366f1", // 9: indigo (often drums)
  "#8b5cf6", // 10: violet
  "#a855f7", // 11: purple
  "#d946ef", // 12: fuchsia
  "#ec4899", // 13: pink
  "#f43f5e", // 14: rose
  "#78716c", // 15: stone
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const animationFrameId = ref<number | null>(null)
const midiData = ref<MidiData | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Piano roll constants
const MIN_NOTE = 0 // C-1
const MAX_NOTE = 127 // G9
const NOTE_RANGE = MAX_NOTE - MIN_NOTE + 1 // 128 notes

function isBlackKey(note: number): boolean {
  const n = note % 12
  return [1, 3, 6, 8, 10].includes(n)
}

// Helper function to draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

onMounted(async () => {
  try {
    midiData.value = await loadMidiFromUrl(props.midiUrl)
    isLoading.value = false
    startAnimation()
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load MIDI"
    isLoading.value = false
  }
})

function startAnimation() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container || !midiData.value) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const midi = midiData.value
  const { ticksPerBeat } = midi.header
  const { totalTicks, tempos } = midi

  // Get BPM from MIDI (default 120 BPM if not specified)
  const defaultTempo = 500000 // 120 BPM in microseconds per beat
  const tempo = tempos.length > 0 ? tempos[0].tempo : defaultTempo
  const bpm = 60000000 / tempo

  // Pixels per tick: pixelsPerBeat / ticksPerBeat
  const pixelsPerTick = props.pixelsPerBeat / ticksPerBeat

  // Speed in pixels per second based on BPM
  // BPM beats per minute = BPM/60 beats per second
  // Each beat = pixelsPerBeat pixels
  // So speed = (BPM / 60) * pixelsPerBeat pixels per second
  const pixelsPerSecond = (bpm / 60) * props.pixelsPerBeat

  // Total height of the piano roll in pixels
  const totalRollHeight = totalTicks * pixelsPerTick

  let startTime: number | null = null
  const TARGET_FPS = 30
  const FRAME_INTERVAL = 1000 / TARGET_FPS
  let lastFrameTime = 0

  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio ?? 1
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    if (
      canvas.width !== Math.ceil(width * dpr) ||
      canvas.height !== Math.ceil(height * dpr)
    ) {
      canvas.width = Math.ceil(width * dpr)
      canvas.height = Math.ceil(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    return { width, height, dpr }
  }

  const drawFrame = (timestamp: number) => {
    // Frame rate limiting
    if (timestamp - lastFrameTime < FRAME_INTERVAL) {
      animationFrameId.value = window.requestAnimationFrame(drawFrame)
      return
    }
    lastFrameTime = timestamp

    if (startTime === null) {
      startTime = timestamp
    }

    const { width, height, dpr } = resizeCanvas()

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    // Background
    if (props.backgroundColor !== "transparent") {
      ctx.fillStyle = props.backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // Apply rotation for diagonal flow
    const angle = -15 * (Math.PI / 180) // -15 degrees
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate(angle)
    // Scale up to cover corners after rotation
    const scale = 1.5
    ctx.scale(scale, scale)
    ctx.translate(-width / 2, -height / 2)

    const elapsedMs = timestamp - startTime
    const elapsedPixels = (elapsedMs / 1000) * pixelsPerSecond

    // Loop the animation
    const loopLength = totalRollHeight + height
    const scrollOffset = elapsedPixels % loopLength

    // Calculate note dimensions
    const noteWidth = width / NOTE_RANGE
    const noteGap = 1

    // Draw notes
    ctx.globalAlpha = props.opacity

    for (const note of midi.notes) {
      // Skip notes outside piano range
      if (note.note < MIN_NOTE || note.note > MAX_NOTE) continue

      // Calculate note position in pixels from start
      const noteStartPixel = note.startTick * pixelsPerTick
      const noteEndPixel = note.endTick * pixelsPerTick
      const noteHeight = Math.max(noteEndPixel - noteStartPixel, 2)

      // Y position: notes scroll from bottom to top
      // As scrollOffset increases, notes move up (y decreases)
      // Notes start below the screen and move up
      const baseY = height - noteStartPixel + scrollOffset - noteHeight

      // Draw the note at its position, and also wrapped around for looping
      for (const wrapOffset of [0, -loopLength]) {
        const y = baseY + wrapOffset

        // Skip if not visible
        if (y + noteHeight < 0 || y > height) continue

        // X position based on note number
        const noteIndex = note.note - MIN_NOTE
        const x = noteIndex * noteWidth + noteGap / 2

        // Get color based on channel or use default
        const noteColor = props.colorByChannel
          ? CHANNEL_COLORS[note.channel % CHANNEL_COLORS.length]
          : props.noteColor

        // Add subtle glow effect
        ctx.shadowColor = noteColor
        ctx.shadowBlur = 8

        // Draw note
        ctx.fillStyle = noteColor

        roundRect(
          ctx,
          x,
          y,
          noteWidth - noteGap,
          noteHeight,
          Math.min(3, noteWidth / 4),
        )
        ctx.fill()
      }
    }

    // Restore canvas state (undo rotation)
    ctx.restore()

    // Reset shadow
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1

    animationFrameId.value = window.requestAnimationFrame(drawFrame)
  }

  animationFrameId.value = window.requestAnimationFrame(drawFrame)
}

onUnmounted(() => {
  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<template>
  <div ref="containerRef" class="piano-roll-container">
    <canvas ref="canvasRef" class="piano-roll-canvas" />
    <div v-if="isLoading" class="loading-overlay">
      <span class="loading loading-spinner loading-md" />
    </div>
    <div v-if="error" class="error-overlay">
      <p class="text-red-400 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.piano-roll-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.piano-roll-canvas {
  width: 100%;
  height: 100%;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
