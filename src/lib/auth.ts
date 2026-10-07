// 編集キーなどの秘密値の比較ヘルパー。Workers / Node / ブラウザのどこでも動く素の TS だけで書く

// タイミング攻撃対策の定数時間比較。
// 長さが違っても長い方の末尾まで XOR を取り、一致した文字数で処理時間が変わらないようにする
export function timingSafeEqualString(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

// X-Edit-Key ヘッダーが設定済みの編集キーと一致するか。どちらかが空なら常に false
export function isValidEditKey(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!provided || !expected) return false
  return timingSafeEqualString(provided, expected)
}
