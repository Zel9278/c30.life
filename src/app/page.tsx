'use client';

import { useEffect, useRef } from "react";

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
  C: [
    "01110",
    "10001",
    "10000",
    "10000",
    "10000",
    "10000",
    "10001",
    "01110",
  ],
  "3": [
    "11110",
    "00001",
    "00001",
    "01110",
    "00001",
    "00001",
    "00001",
    "11110",
  ],
  "0": [
    "01110",
    "10001",
    "10011",
    "10101",
    "11001",
    "10001",
    "10001",
    "01110",
  ],
  ".": [
    "00",
    "00",
    "00",
    "00",
    "00",
    "00",
    "11",
    "11",
  ],
  L: [
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "11111",
  ],
  I: [
    "01110",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "01110",
  ],
  F: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "10000",
    "10000",
  ],
  E: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "10000",
    "11111",
  ],
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
  row.split("").flatMap((cell, colIdx) =>
    cell === "1" ? [{ row: rowIdx, col: colIdx }] : [],
  ),
);

function buildKeyboardLayout() {
  const whiteKeys: LayoutKey[] = [];
  const blackKeys: LayoutKey[] = [];

  for (let i = 0, whiteCount = 0; i < TOTAL_KEYS; i++) {
    const patternKey = KEY_PATTERN[i % KEY_PATTERN.length];
    const octave = Math.floor(i / KEY_PATTERN.length);

    if (patternKey.isBlack) {
      const x = whiteCount * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
      blackKeys.push({ name: patternKey.name, x, octave });
    } else {
      const x = whiteCount * WHITE_KEY_WIDTH;
      whiteKeys.push({ name: patternKey.name, x, octave });
      whiteCount += 1;
    }
  }

  return {
    whiteKeys,
    blackKeys,
    width: whiteKeys.length * WHITE_KEY_WIDTH,
  };
}

export default function Home() {
  return (
    <div className="font-sans grid">
      <main className="flex flex-col items-center sm:items-center p-1">
        <h1>c30.life</h1>
        <p>I don't have the energy to make a website.</p>
        <p>ced</p>
        <CanvasPianoScene />
      </main>
    </div>
  );
}
function CanvasPianoScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
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

    const { whiteKeys, blackKeys, width: displayWidth } = layout;
    const patternRows = DOT_PATTERN.length;
    const cellWidth = displayWidth / PATTERN_COLS;
    const cellHeight = cellWidth;
    const rollHeight = Math.max(Math.round(patternRows * cellHeight), WHITE_KEY_HEIGHT * 2);
    const rollGap = 12;
    const keyboardOffsetY = rollHeight + rollGap;
    const totalHeight = keyboardOffsetY + WHITE_KEY_HEIGHT;
    const dotSize = Math.min(cellWidth, cellHeight) * 0.7;
    const dotInset = (Math.min(cellWidth, cellHeight) - dotSize) / 2;
    const patternHeight = patternRows * cellHeight;
    const speed = 60; // pixels per second

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
      if (startTimeRef.current == null) {
        startTimeRef.current = timestamp;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, totalHeight);

      const gradient = ctx.createLinearGradient(0, 0, 0, rollHeight);
      gradient.addColorStop(0, "#111827");
      gradient.addColorStop(1, "#0f172a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, displayWidth, rollHeight);

      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
      const offset = (elapsedSeconds * speed) % (patternHeight + rollHeight);
      const startY = offset - patternHeight;

      ctx.fillStyle = "#bbf7d0";
      ctx.shadowColor = "rgba(134, 239, 172, 0.4)";
      ctx.shadowBlur = 14;

      DOT_COORDS.forEach((dot) => {
        const y = startY + dot.row * cellHeight + dotInset;
        if (y + dotSize < 0 || y > rollHeight) {
          return;
        }

        const x = dot.col * cellWidth + dotInset;
        ctx.fillRect(x, y, dotSize, dotSize);
      });

      ctx.shadowBlur = 0;

      const keyboardTop = keyboardOffsetY;
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, keyboardTop, displayWidth, WHITE_KEY_HEIGHT);

      ctx.lineWidth = 1 / dpr;
      ctx.strokeStyle = "#1f2937";
      ctx.fillStyle = "#f8fafc";

      whiteKeys.forEach((key) => {
        const x = key.x;
        ctx.fillRect(x, keyboardTop, WHITE_KEY_WIDTH, WHITE_KEY_HEIGHT);
        ctx.strokeRect(x, keyboardTop, WHITE_KEY_WIDTH, WHITE_KEY_HEIGHT);
      });

      ctx.fillStyle = "#111827";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.5 / dpr;

      blackKeys.forEach((key) => {
        const x = key.x;
        ctx.fillRect(x, keyboardTop, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
        ctx.strokeRect(x, keyboardTop, BLACK_KEY_WIDTH, BLACK_KEY_HEIGHT);
      });

      animationRef.current = window.requestAnimationFrame(drawFrame);
    };

    animationRef.current = window.requestAnimationFrame(drawFrame);

    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="mt-10 w-full max-w-5xl border border-slate-800 bg-slate-900 shadow-[0_0_32px_rgba(16,185,129,0.18)]"
    />
  );
}
