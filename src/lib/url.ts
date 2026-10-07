// リモート (埋め込み先のインスタンスなど) から来た URL を href / src に入れる前に http(s) だけに絞る。
// それ以外 (javascript: など) や空なら undefined を返す。Vue は undefined の属性を出力しないので
// src="#" で同じページを読み直すこともなく、 `httpUrl(a) || fallback` の代替も効く
export function httpUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url, location.href)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? url
      : undefined
  } catch {
    return undefined
  }
}
