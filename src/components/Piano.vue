<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

// DAW のピアノロールと同じく、1半音を1レーンにする（C2〜B5 の4オクターブ）。
// 文字のドットはレーンにそのまま乗るので、落ちてきた音符の真下の鍵盤が光る
const OCTAVES = 4
const LANES = OCTAVES * 12
const BLACK = new Set([1, 3, 6, 8, 10])
const WIDTH = 392
const ROLL_HEIGHT = 175
const KEY_HEIGHT = 70

// 白鍵の左右の端（オクターブの中のレーン位置）。黒鍵の下に半レーンずつ入り込む
const WHITE_KEYS = [
  { lane: 0, start: 0, end: 1.5 }, // C
  { lane: 2, start: 1.5, end: 3.5 }, // D
  { lane: 4, start: 3.5, end: 5 }, // E
  { lane: 5, start: 5, end: 6.5 }, // F
  { lane: 7, start: 6.5, end: 8.5 }, // G
  { lane: 9, start: 8.5, end: 10.5 }, // A
  { lane: 11, start: 10.5, end: 12 }, // B
]

const PIXEL_FONT: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10000", "10001", "01110"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "00001", "11110"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "10001", "01110"],
  ".": ["00", "00", "00", "00", "00", "00", "11", "11"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "00100", "01110"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000", "10000"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "10000", "11111"],
}

// 文字を横に並べて、1文字ごとに1列あける
const ROWS = Array.from({ length: 8 }, (_, row) =>
  [..."C30.LIFE"].map((char) => PIXEL_FONT[char][row]).join("0"),
)
const COLS = ROWS[0].length
const FIRST_LANE = Math.floor((LANES - COLS) / 2)

type Note = { lane: number; row: number; length: number }

// 縦に続くドットは1つの長い音符にする
const NOTES: Note[] = []
for (let col = 0; col < COLS; col++) {
  let row = 0
  while (row < ROWS.length) {
    if (ROWS[row][col] !== "1") {
      row++
      continue
    }
    const start = row
    while (row < ROWS.length && ROWS[row][col] === "1") row++
    NOTES.push({ lane: FIRST_LANE + col, row: start, length: row - start })
  }
}

const COLORS = {
  roll: "#141416",
  blackLane: "#0d0d0f",
  laneLine: "rgb(255 255 255 / 0.04)",
  octaveLine: "rgb(255 255 255 / 0.1)",
  note: "#60a5fa",
  noteEdge: "#93c5fd",
  hitLine: "rgb(96 165 250 / 0.5)",
  keyBed: "#525252",
  white: "#e5e5e5",
  whiteActive: "#93c5fd",
  black: "#171717",
  blackActive: "#3b82f6",
}

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let cleanup: (() => void) | null = null

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[],
) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

onMounted(() => {
  const container = containerRef.value
  const canvas = canvasRef.value
  const ctx = canvas?.getContext("2d")
  if (!container || !canvas || !ctx) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  let width = 0
  let lane = 0
  let rowHeight = 0
  let rollHeight = 0
  let keyHeight = 0
  let visible = true
  let frame: number | null = null
  let start: number | null = null

  const resize = () => {
    // 前と同じ大きさ（白鍵14px×28鍵）。入りきらない幅では縮める
    const scale = Math.min(1, container.clientWidth / WIDTH)
    width = WIDTH * scale
    lane = width / LANES
    rowHeight = lane * 1.3
    rollHeight = Math.round(ROLL_HEIGHT * scale)
    keyHeight = Math.round(KEY_HEIGHT * scale)
    const height = rollHeight + keyHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // offset は文字の下端が進んだ距離
  const draw = (offset: number) => {
    const patternHeight = ROWS.length * rowHeight
    // 上から入ってきて鍵盤に吸い込まれ、少し間をあけて繰り返す
    const cycle = rollHeight + patternHeight * 1.6
    const bottom = offset % cycle

    const active = new Set<number>()

    // ロールの背景：黒鍵のレーンを暗くし、オクターブの境目に線を引く
    ctx.fillStyle = COLORS.roll
    ctx.fillRect(0, 0, width, rollHeight)
    for (let i = 0; i < LANES; i++) {
      const x = i * lane
      if (BLACK.has(i % 12)) {
        ctx.fillStyle = COLORS.blackLane
        ctx.fillRect(x, 0, lane, rollHeight)
      }
      if (i > 0) {
        ctx.fillStyle = i % 12 === 0 ? COLORS.octaveLine : COLORS.laneLine
        ctx.fillRect(Math.round(x), 0, 1, rollHeight)
      }
    }

    // 音符。row 0 が文字の一番上で、下の行ほど先に鍵盤へ届く
    const gap = Math.max(1, lane * 0.12)
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, width, rollHeight)
    ctx.clip()
    for (const note of NOTES) {
      const noteBottom =
        bottom - (ROWS.length - note.row - note.length) * rowHeight
      const noteTop = noteBottom - note.length * rowHeight
      if (noteBottom < 0 || noteTop > rollHeight) continue
      if (noteBottom >= rollHeight) active.add(note.lane)

      const x = note.lane * lane + gap
      const w = lane - gap * 2
      const y = noteTop + gap
      const h = note.length * rowHeight - gap * 2
      const r = Math.min(3, w / 3)
      ctx.fillStyle = COLORS.note
      fillRoundRect(ctx, x, y, w, h, r)
      // 下端（先に鳴る側）を明るくして、向きがわかるようにする
      const edge = Math.max(2, gap)
      ctx.fillStyle = COLORS.noteEdge
      fillRoundRect(ctx, x, y + h - edge, w, edge, [0, 0, r, r])
    }
    ctx.restore()

    ctx.fillStyle = COLORS.hitLine
    ctx.fillRect(0, rollHeight - 2, width, 2)

    // 鍵盤。白鍵の隙間から見える下地の上に、白鍵、黒鍵の順に描く
    const top = rollHeight
    const keyGap = Math.max(1, lane * 0.08)
    ctx.fillStyle = COLORS.keyBed
    ctx.fillRect(0, top, width, keyHeight)
    for (let octave = 0; octave < OCTAVES; octave++) {
      const base = octave * 12
      for (const key of WHITE_KEYS) {
        ctx.fillStyle = active.has(base + key.lane)
          ? COLORS.whiteActive
          : COLORS.white
        const x = (base + key.start) * lane + keyGap / 2
        const w = (key.end - key.start) * lane - keyGap
        fillRoundRect(ctx, x, top, w, keyHeight - 1, [0, 0, 3, 3])
      }
    }
    const blackHeight = keyHeight * 0.62
    for (let i = 0; i < LANES; i++) {
      if (!BLACK.has(i % 12)) continue
      ctx.fillStyle = active.has(i) ? COLORS.blackActive : COLORS.black
      fillRoundRect(ctx, i * lane, top, lane, blackHeight, [0, 0, 2, 2])
    }
  }

  // 1秒に約8行
  const speed = () => rowHeight * 8

  const tick = (timestamp: number) => {
    start ??= timestamp
    draw(((timestamp - start) / 1000) * speed())
    frame = window.requestAnimationFrame(tick)
  }

  const stop = () => {
    if (frame != null) window.cancelAnimationFrame(frame)
    frame = null
  }

  const play = () => {
    stop()
    if (reducedMotion.matches) {
      // 動かさずに、文字がロールの真ん中にある絵を出す
      draw((rollHeight + ROWS.length * rowHeight) / 2)
      return
    }
    if (visible) frame = window.requestAnimationFrame(tick)
  }

  resize()
  // 最初は文字が上から入ってくるところから
  play()

  const resizeObserver = new ResizeObserver(() => {
    resize()
    play()
  })
  resizeObserver.observe(container)

  // 画面外にあるあいだは描かない
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    play()
  })
  intersectionObserver.observe(container)

  reducedMotion.addEventListener("change", play)

  cleanup = () => {
    stop()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    reducedMotion.removeEventListener("change", play)
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <div ref="containerRef" class="flex w-full justify-center">
    <canvas
      ref="canvasRef"
      class="block rounded-lg border border-neutral-700/50 shadow-2xl"
      role="img"
      aria-label="c30.life の文字が流れるピアノロール"
    />
  </div>
</template>
