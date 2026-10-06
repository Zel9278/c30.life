// ブログ表示用の整形ヘルパー。Worker でもブラウザでも同じ結果になるよう
// toLocaleDateString / Intl に頼らず手で組み立てる

const JST_OFFSET_MS = 9 * 60 * 60 * 1000

// "2025-01-05" → "2025年1月5日"
// Blog.vue / BlogPost.vue が ja-JP の toLocaleDateString で出しているのと同じ形式
export function formatDateJa(date: string): string {
  const value = date.trim()
  if (!value) return ""

  const ymd = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?!\d)/)
  const toLabel = (m: RegExpMatchArray) =>
    `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`

  // 日付だけ (時刻なし) なら Date を通さずそのまま使う
  if (ymd && ymd[0].length === value.length) return toLabel(ymd)

  // 時刻付きなどは Date に任せ、日本時間の日付として出す
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return ymd ? toLabel(ymd) : value
  const jst = new Date(time + JST_OFFSET_MS)
  return `${jst.getUTCFullYear()}年${jst.getUTCMonth() + 1}月${jst.getUTCDate()}日`
}

// <time datetime> 用の YYYY-MM-DD。表示 (formatDateJa) と同じく時刻付きなら日本時間の日付にする
export function toDatetimeAttr(date: string): string | undefined {
  const value = date.trim()
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?!\d)/)
  if (!match) return undefined
  if (match[0].length === value.length) return match[0]

  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return match[0]
  const jst = new Date(time + JST_OFFSET_MS)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(jst.getUTCDate())}`
}

// 1234567 → "1,234,567" (toLocaleString("ja-JP") と同じ区切り)
export function formatNumber(value: number): string {
  const n = Number.isFinite(value) ? Math.trunc(value) : 0
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// 本文の文字数 (コードブロック・URL・記法・空白を除く)。BlogPost.vue と同じ数え方
export function countCharacters(content: string): number {
  return content
    .replace(/^---[\s\S]*?---\n?/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[#*_[\]()!>-]/g, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/\s/g, "").length
}

// 読了目安 (500 文字/分、最低 1 分)
export function readingMinutes(characters: number): number {
  return Math.max(1, Math.ceil(characters / 500))
}
