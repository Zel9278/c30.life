#!/usr/bin/env node
// /services に出す各サービスのアイコン (favicon) を取ってきて、小さい PNG にして置く
//
//   pnpm service-icons      # 全サービス分を取り直す
//
// 各サービスのトップページの <link rel="icon"> / <link rel="apple-touch-icon"> を見て、
// 無ければ /favicon.ico を使う。ImageMagick (magick) で 96x96 の PNG にして
// public/service-icons/<ホスト名>.png に置き、取れたものの一覧を src/data/serviceIcons.json に書く
// （暗い絵柄で透明な部分があるものは light: true。ページでは明るい下地に置く）。
// 取れなかったサービスは、ページでは頭文字のアイコンのまま。
// ページを開くたびに各サービスへ取りに行かないよう、できたファイルはコミットする。

import { execFile } from "node:child_process"
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { serviceCategories, serviceHost } from "../src/data/services.ts"

const run = promisify(execFile)
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const OUT_DIR = path.join(PROJECT_ROOT, "public", "service-icons")
const MANIFEST = path.join(PROJECT_ROOT, "src", "data", "serviceIcons.json")
const SIZE = 96
const TIMEOUT_MS = 10_000
const MAX_BYTES = 2 * 1024 * 1024
const USER_AGENT = "c30.life service-icons (https://c30.life/services)"

async function get(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": USER_AGENT },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response
}

/** <link rel="...icon..."> を、大きくて使いやすい順に */
function iconLinks(html, base) {
  const links = []
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attr = (name) =>
      tag
        .match(
          new RegExp(
            `\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
            "i",
          ),
        )
        ?.slice(2)
        .find(Boolean)
    const rel = (attr("rel") ?? "").toLowerCase().split(/\s+/)
    const href = attr("href")
    if (
      !href ||
      rel.includes("mask-icon") ||
      !(rel.includes("icon") || rel.includes("apple-touch-icon"))
    )
      continue
    const sizes = (attr("sizes") ?? "").match(/(\d+)x\d+/)
    // apple-touch-icon は 180px 前後の PNG が多い。svg は大きさを問わず綺麗に縮められる
    const score = (attr("type") ?? href).includes("svg")
      ? 1000
      : sizes
        ? Number(sizes[1])
        : rel.includes("apple-touch-icon")
          ? 180
          : 32
    try {
      links.push({ url: new URL(href, base).href, score })
    } catch {
      // 変な href は飛ばす
    }
  }
  return links.sort((a, b) => b.score - a.score)
}

/** 画像として読めて、ImageMagick で縮められたら true */
async function convert(bytes, url, out, work) {
  const ext = (
    new URL(url).pathname.match(/\.(ico|png|svg|jpe?g|gif|webp)$/i)?.[1] ??
    "img"
  ).toLowerCase()
  const input = path.join(work, `in.${ext}`)
  await writeFile(input, bytes)
  // .ico などはいくつかの大きさが入っているので、いちばん大きいものを使う
  const { stdout } = await run("magick", [
    "identify",
    "-format",
    "%w %h\n",
    input,
  ])
  const frames = stdout
    .trim()
    .split("\n")
    .map((line, i) => ({ i, w: Number(line.split(" ")[0]) }))
  if (!frames.length || !frames[0].w) return false
  const best = frames.reduce((a, b) => (b.w > a.w ? b : a))
  await run("magick", [
    "-background",
    "none",
    "-density",
    "384",
    `${input}[${best.i}]`,
    "-resize",
    `${SIZE}x${SIZE}`,
    "-gravity",
    "center",
    "-extent",
    `${SIZE}x${SIZE}`,
    "-strip",
    `PNG32:${out}`,
  ])
  return true
}

/**
 * 透明な部分があって、見える部分が暗い（黒い線だけなど）アイコンは、暗いカードの上では見えない。
 * そういうものは明るい下地に置く（manifest の light）
 */
async function needsLightBackdrop(file) {
  const value = async (args) => Number((await run("magick", args)).stdout)
  const alpha = await value([
    file,
    "-alpha",
    "extract",
    "-format",
    "%[fx:mean]",
    "info:",
  ])
  // 見えている部分の明るさの平均（透明な部分は数えない）
  const lit = await value([
    file,
    "-alpha",
    "off",
    "-colorspace",
    "Gray",
    "(",
    file,
    "-alpha",
    "extract",
    ")",
    "-compose",
    "Multiply",
    "-composite",
    "-format",
    "%[fx:mean]",
    "info:",
  ])
  return alpha > 0 && alpha < 0.85 && lit / alpha < 0.3
}

async function iconFor(service, work) {
  const origin = new URL(service.url).origin
  const candidates = []
  try {
    const html = await (await get(service.url)).text()
    candidates.push(...iconLinks(html, service.url))
  } catch (error) {
    console.warn(`  ${serviceHost(service.url)}: top page: ${error.message}`)
  }
  candidates.push({ url: `${origin}/favicon.ico`, score: 0 })

  const out = path.join(OUT_DIR, `${serviceHost(service.url)}.png`)
  for (const candidate of candidates) {
    try {
      const response = await get(candidate.url)
      const type = response.headers.get("content-type") ?? ""
      if (type.includes("text/html")) throw new Error("HTML, not an image")
      const bytes = Buffer.from(await response.arrayBuffer())
      if (!bytes.length || bytes.length > MAX_BYTES)
        throw new Error(`${bytes.length} bytes`)
      if (await convert(bytes, candidate.url, out, work)) {
        return {
          from: candidate.url,
          out,
          light: await needsLightBackdrop(out),
        }
      }
    } catch (error) {
      console.warn(
        `  ${serviceHost(service.url)}: ${candidate.url}: ${error.message}`,
      )
    }
  }
  return null
}

await rm(OUT_DIR, { recursive: true, force: true })
await mkdir(OUT_DIR, { recursive: true })
const manifest = {}
for (const service of serviceCategories.flatMap((c) => c.services)) {
  const work = await mkdtemp(path.join(tmpdir(), "service-icon-"))
  try {
    const icon = await iconFor(service, work)
    const host = serviceHost(service.url)
    if (icon) {
      manifest[host] = { src: `/service-icons/${host}.png`, light: icon.light }
      console.log(
        `✓ ${host} ← ${icon.from}${icon.light ? " (light backdrop)" : ""}`,
      )
    } else {
      console.log(`– ${host}: no icon`)
    }
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `${Object.keys(manifest).length} icons, ${(await readdir(OUT_DIR)).length} files → ${path.relative(PROJECT_ROOT, OUT_DIR)}`,
)
