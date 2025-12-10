<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const TOTAL_KEYS = 48;
const KEY_PATTERN = [
  { name: "C", isBlack: false },
  { name: "C#", isBlack: true },
  { name: "D", isBlack: false },
  { name: "D#", isBlack: true },
  { name: "E", isBlack: false },
  { name: "F", isBlack: false },
  { name: "F#", isBlack: true },
  { name: "G", isBlack: false },
  { name: "G#", isBlack: true },
  { name: "A", isBlack: false },
  { name: "A#", isBlack: true },
  { name: "B", isBlack: false },
];
const WHITE_KEY_WIDTH = 18;
const WHITE_KEY_HEIGHT = 90;
const BLACK_KEY_WIDTH = Math.round(WHITE_KEY_WIDTH * 0.6);
const BLACK_KEY_HEIGHT = Math.round(WHITE_KEY_HEIGHT * 0.65);

type LayoutKey = {
  name: string;
  x: number;
  octave: number;
};

const PIXEL_FONT: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10000", "10001", "01110"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "00001", "11110"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "10001", "01110"],
  ".": ["00", "00", "00", "00", "00", "00", "11", "11"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "00100", "01110"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000", "10000"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "10000", "11111"],
};

const TEXT_SEQUENCE = ["C", "3", "0", ".", "L", "I", "F", "E"];

function buildPixelPattern(text: string[]) {
  if (text.length === 0) {
    return [] as string[];
  }

  const rows = PIXEL_FONT[text[0]]?.length ?? 0;
  const pattern = Array.from({ length: rows }, () => "");

  text.forEach((char, index) => {
    const glyph = PIXEL_FONT[char];
    if (!glyph) {
      return;
    }

    glyph.forEach((rowPattern, rowIdx) => {
      pattern[rowIdx] += rowPattern;
    });

    if (index !== text.length - 1) {
      pattern.forEach((rowPattern, rowIdx) => {
        pattern[rowIdx] = rowPattern + "0";
      });
    }
  });

  return pattern;
}

const DOT_PATTERN = buildPixelPattern(TEXT_SEQUENCE);
const PATTERN_COLS = DOT_PATTERN[0]?.length ?? 0;

const DOT_COORDS = DOT_PATTERN.flatMap((row, rowIdx) =>
  row
    .split("")
    .flatMap((cell, colIdx) =>
      cell === "1" ? [{ row: rowIdx, col: colIdx }] : []
    )
);

function buildKeyboardLayout() {
  const whiteKeys: LayoutKey[] = [];
  const blackKeys: LayoutKey[] = [];
  const allKeys: (LayoutKey & { isBlack: boolean; keyIndex: number })[] = [];

  let whiteCount = 0;
  for (let i = 0; i < TOTAL_KEYS; i++) {
    const patternKey = KEY_PATTERN[i % KEY_PATTERN.length];
    const octave = Math.floor(i / KEY_PATTERN.length);

    if (patternKey.isBlack) {
      // 黒鍵は直前の白鍵の右側に配置(2つの白鍵の間)
      const x = whiteCount * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
      blackKeys.push({ name: patternKey.name, x, octave });
      allKeys.push({
        name: patternKey.name,
        x,
        octave,
        isBlack: true,
        keyIndex: i,
      });
    } else {
      const x = whiteCount * WHITE_KEY_WIDTH;
      whiteKeys.push({ name: patternKey.name, x, octave });
      allKeys.push({
        name: patternKey.name,
        x,
        octave,
        isBlack: false,
        keyIndex: i,
      });
      whiteCount += 1;
    }
  }

  return {
    whiteKeys,
    blackKeys,
    allKeys,
    width: whiteKeys.length * WHITE_KEY_WIDTH,
  };
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationFrameId = ref<number | null>(null);
const startTimeRef = ref<number | null>(null);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const layout = buildKeyboardLayout();
  if (PATTERN_COLS === 0 || DOT_PATTERN.length === 0) {
    return;
  }

  const { whiteKeys, blackKeys, allKeys, width: displayWidth } = layout;
  const patternRows = DOT_PATTERN.length;

  const getKeyIndexForCol = (col: number): number => {
    return Math.floor((col / PATTERN_COLS) * TOTAL_KEYS);
  };

  const cellWidth = displayWidth / PATTERN_COLS;
  const cellHeight = cellWidth;
  const rollHeight = Math.max(
    Math.round(patternRows * cellHeight),
    WHITE_KEY_HEIGHT * 2
  );
  const rollGap = 12;
  const keyboardOffsetY = rollHeight + rollGap;
  const totalHeight = keyboardOffsetY + WHITE_KEY_HEIGHT;
  const dotSize = Math.min(cellWidth, cellHeight) * 0.7;
  const dotInset = (Math.min(cellWidth, cellHeight) - dotSize) / 2;
  const patternHeight = patternRows * cellHeight;
  const speed = 60; // pixels per second

  const activeWhiteKeys = new Set<number>();
  const activeBlackKeys = new Set<number>();

  const dpr = window.devicePixelRatio ?? 1;
  const scaledWidth = Math.ceil(displayWidth * dpr);
  const scaledHeight = Math.ceil(totalHeight * dpr);

  if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
  }

  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${totalHeight}px`;

  const drawFrame = (timestamp: number) => {
    if (startTimeRef.value == null) {
      startTimeRef.value = timestamp;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, totalHeight);

    const gradient = ctx.createLinearGradient(0, 0, 0, rollHeight);
    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, displayWidth, rollHeight);

    const elapsedSeconds = (timestamp - startTimeRef.value) / 1000;
    const offset = (elapsedSeconds * speed) % (patternHeight + rollHeight);
    const startY = offset - patternHeight;

    activeWhiteKeys.clear();
    activeBlackKeys.clear();

    ctx.fillStyle = "#bbf7d0";
    ctx.shadowColor = "rgba(134, 239, 172, 0.4)";
    ctx.shadowBlur = 14;

    DOT_COORDS.forEach((dot) => {
      const y = startY + dot.row * cellHeight + dotInset;
      const x = dot.col * cellWidth + dotInset;
      const dotBottom = y + dotSize;

      if (!(y + dotSize < 0 || y > rollHeight)) {
        ctx.fillRect(x, y, dotSize, dotSize);
      }

      const collisionMargin = 15;

      if (
        dotBottom >= rollHeight - collisionMargin &&
        dotBottom <= rollHeight + collisionMargin
      ) {
        const keyIndex = getKeyIndexForCol(dot.col);
        const targetKey = allKeys[keyIndex];

        if (targetKey) {
          if (targetKey.isBlack) {
            const blackKeyIndex = blackKeys.findIndex(
              (k) =>
                k.name === targetKey.name &&
                k.x === targetKey.x &&
                k.octave === targetKey.octave
            );
            if (blackKeyIndex !== -1) {
              activeBlackKeys.add(blackKeyIndex);
            }
          } else {
            const whiteKeyIndex = whiteKeys.findIndex(
              (k) =>
                k.name === targetKey.name &&
                k.x === targetKey.x &&
                k.octave === targetKey.octave
            );
            if (whiteKeyIndex !== -1) {
              activeWhiteKeys.add(whiteKeyIndex);
            }
          }
        }
      }
    });

    ctx.shadowBlur = 0;

    const keyboardTop = keyboardOffsetY;
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, keyboardTop, displayWidth, WHITE_KEY_HEIGHT);

    ctx.lineWidth = 1 / dpr;
    ctx.strokeStyle = "#1f2937";

    whiteKeys.forEach((key, index) => {
      const x = key.x;

      if (activeWhiteKeys.has(index)) {
        ctx.fillStyle = "#86efac";
        ctx.shadowColor = "rgba(134, 239, 172, 0.8)";
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = "#f8fafc";
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, keyboardTop, WHITE_KEY_WIDTH, WHITE_KEY_HEIGHT);
      ctx.strokeRect(x, keyboardTop, WHITE_KEY_WIDTH, WHITE_KEY_HEIGHT);
    });

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.5 / dpr;

    blackKeys.forEach((key, index) => {
      const x = key.x;

      if (activeBlackKeys.has(index)) {
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "rgba(134, 239, 172, 0.8)";
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = "#111827";
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, keyboardTop, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
      ctx.strokeRect(x, keyboardTop, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
    });

    ctx.shadowBlur = 0;

    animationFrameId.value = window.requestAnimationFrame(drawFrame);
  };

  animationFrameId.value = window.requestAnimationFrame(drawFrame);
});

onUnmounted(() => {
  if (animationFrameId.value != null) {
    cancelAnimationFrame(animationFrameId.value);
  }
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="w-full h-auto max-w-5xl border border-slate-800 bg-slate-900"
  />
</template>
