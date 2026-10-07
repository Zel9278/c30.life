#!/usr/bin/env node
// R2 バケット c30-life-files の全オブジェクトを ./r2-files/ にダウンロードする (キーのパスをそのまま再現)
//
//   pnpm r2:sync                     # 一覧を取って、無いファイルとサイズが違うファイルだけ落とす
//   pnpm r2:sync --dry-run           # 何を落とすかだけ表示する (ダウンロードしない)
//   pnpm r2:sync --dry-run --listing list.json
//                                    # cf を呼ばず、JSON の一覧 (cf r2 objects list の出力) を使う
//   pnpm r2:sync --out-dir <dir>     # 保存先を変える (既定: ./r2-files)
//
// 一覧は cf r2 objects list、ダウンロードは wrangler r2 object get --remote を使う。
// どちらも CLOUDFLARE_ACCOUNT_ID が必要 (--listing と --dry-run を両方付けたときだけ不要)。

import { spawn } from "node:child_process"
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const BUCKET = "c30-life-files"
const PER_PAGE = 1000
// cf / wrangler はプロジェクトの依存なので、どこから実行してもプロジェクト直下で pnpm exec する
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
// 既定の保存先はプロジェクト直下 (.gitignore 済み)。--out-dir は実行時のカレントからの相対
const DEFAULT_OUT_DIR = path.join(PROJECT_ROOT, "r2-files")

const USAGE = `Usage: node scripts/r2-sync.mjs [--dry-run] [--listing <file.json>] [--out-dir <dir>]

  --dry-run           ダウンロードせず、落とすファイルと飛ばすファイルを表示する
  --listing <file>    cf を呼ばずに、このファイルの一覧 (JSON) を使う
  --out-dir <dir>     保存先 (既定: プロジェクト直下の r2-files/)
  -h, --help          このヘルプを表示する

Requires CLOUDFLARE_ACCOUNT_ID (unless both --dry-run and --listing are given).`

class UsageError extends Error {}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    listing: undefined,
    outDir: DEFAULT_OUT_DIR,
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const [name, inlineValue] = arg.startsWith("--")
      ? arg.split(/=(.*)/s, 2)
      : [arg, undefined]
    const value = () => {
      const v = inlineValue ?? argv[++i]
      if (v === undefined || v === "") {
        throw new UsageError(`${name} には値が必要です`)
      }
      return v
    }
    switch (name) {
      case "--dry-run":
        options.dryRun = true
        break
      case "--listing":
        options.listing = value()
        break
      case "--out-dir":
        options.outDir = value()
        break
      case "-h":
      case "--help":
        options.help = true
        break
      default:
        throw new UsageError(`不明な引数です: ${arg}`)
    }
  }
  return options
}

// 子プロセスを (シェルを通さずに) 実行する。キーに空白や記号があっても引数がそのまま渡る
function run(command, args, { capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", capture ? "pipe" : "inherit", "inherit"],
      // cf は TTY のときだけ色を付けるが、念のため JSON に色コードが混ざらないようにする
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
    })
    let stdout = ""
    child.stdout?.setEncoding("utf8")
    child.stdout?.on("data", (chunk) => {
      stdout += chunk
    })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) resolve(stdout)
      else
        reject(
          new Error(`${command} ${args.join(" ")} が終了コード ${code} で失敗`),
        )
    })
  })
}

// cf の出力は「オブジェクトの配列」。API のレスポンスそのまま ({ result, result_info }) も受け付ける
function parseListing(text, source) {
  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error(`${source} を JSON として読めません: ${e.message}`)
  }
  const objects = Array.isArray(data) ? data : data?.result
  if (!Array.isArray(objects)) {
    throw new Error(`${source} がオブジェクトの配列ではありません`)
  }
  for (const object of objects) {
    if (typeof object?.key !== "string" || typeof object?.size !== "number") {
      throw new Error(
        `${source} に key (文字列) と size (数値) を持たない要素があります`,
      )
    }
  }
  return objects.map(({ key, size }) => ({ key, size }))
}

// cf r2 objects list は result_info (cursor) を出力に含めないので、
// --start-after に前のページの最後のキーを渡してページをたどる
async function listRemoteObjects() {
  const objects = []
  const seen = new Set()
  let startAfter
  for (;;) {
    const args = [
      "exec",
      "cf",
      "r2",
      "objects",
      "list",
      "--bucket-name",
      BUCKET,
      "--per-page",
      String(PER_PAGE),
    ]
    if (startAfter !== undefined) args.push("--start-after", startAfter)
    const page = parseListing(
      await run("pnpm", args, { capture: true }),
      "cf r2 objects list の出力",
    )
    const fresh = page.filter((object) => !seen.has(object.key))
    // 空のページ、または新しいキーが 1 つも無い (start-after が効いていない) なら終わり
    if (fresh.length === 0) break
    for (const object of fresh) {
      seen.add(object.key)
      objects.push(object)
    }
    startAfter = page[page.length - 1].key
  }
  return objects
}

// キーを保存先のパスにする。保存先の外に出るキーや、ファイルとして置けないキーは null
function localPathFor(outDir, key) {
  const segments = key.split("/")
  if (
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        segment.includes("\0") ||
        segment.includes("\\"),
    )
  ) {
    return null
  }
  const root = path.resolve(outDir)
  const target = path.resolve(root, ...segments)
  if (!target.startsWith(root + path.sep)) return null
  return target
}

async function sizeOf(file) {
  try {
    const info = await stat(file)
    return info.isFile() ? info.size : -1
  } catch (e) {
    if (e.code === "ENOENT") return null
    throw e
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    console.log(USAGE)
    return
  }

  const offline = options.dryRun && options.listing !== undefined
  if (!offline && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error(
      "エラー: CLOUDFLARE_ACCOUNT_ID が設定されていません。\n" +
        "r2:list と同じく、対象アカウントの ID を環境変数で渡してください。\n" +
        "  例: CLOUDFLARE_ACCOUNT_ID=<アカウント ID> pnpm r2:sync",
    )
    process.exitCode = 1
    return
  }

  const objects =
    options.listing !== undefined
      ? parseListing(await readFile(options.listing, "utf8"), options.listing)
      : await listRemoteObjects()

  let downloaded = 0
  let skipped = 0
  let failed = 0
  const outDir = path.resolve(options.outDir)
  const prefix = options.dryRun ? "[dry-run] " : ""

  for (const { key, size } of objects) {
    const target = localPathFor(outDir, key)
    if (!target) {
      console.warn(
        `${prefix}skip (保存先に置けないキー): ${JSON.stringify(key)}`,
      )
      skipped++
      continue
    }
    const display = path.relative(process.cwd(), target)
    const localSize = await sizeOf(target)
    if (localSize === size) {
      console.log(`${prefix}skip (同じサイズ): ${display}`)
      skipped++
      continue
    }
    if (localSize === -1) {
      console.warn(
        `${prefix}skip (同じパスにファイル以外があります): ${display}`,
      )
      skipped++
      continue
    }

    console.log(
      `${prefix}get ${JSON.stringify(key)} -> ${display}${localSize === null ? "" : ` (ローカル ${localSize} B / R2 ${size} B)`}`,
    )
    if (options.dryRun) {
      downloaded++
      continue
    }

    // 途中で失敗しても壊れたファイルが残らないよう、一時ファイルに落としてから置き換える
    const temp = `${target}.r2-sync-tmp`
    try {
      await mkdir(path.dirname(target), { recursive: true })
      await run("pnpm", [
        "exec",
        "wrangler",
        "r2",
        "object",
        "get",
        `${BUCKET}/${key}`,
        "--file",
        temp,
        "--remote",
      ])
      await rename(temp, target)
      downloaded++
    } catch (e) {
      await rm(temp, { force: true })
      console.error(`失敗: ${JSON.stringify(key)}: ${e.message}`)
      failed++
    }
  }

  console.log(
    `${prefix}${objects.length} objects: ${options.dryRun ? "would download" : "downloaded"} ${downloaded}, skipped ${skipped}, failed ${failed}`,
  )
  if (failed > 0) process.exitCode = 1
}

main().catch((e) => {
  if (e instanceof UsageError) {
    console.error(`エラー: ${e.message}\n\n${USAGE}`)
    process.exitCode = 2
    return
  }
  console.error(`エラー: ${e.message}`)
  process.exitCode = 1
})
