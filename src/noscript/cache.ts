import type { NoscriptContext } from "./types.ts"

// R2 の list など重めの処理の結果を Cache API に短時間キャッシュする
export async function cached<T>(
  ctx: NoscriptContext,
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default
  // Cache API は自ゾーンのホスト名で使う
  const cacheKey = new Request(`${ctx.url.origin}/__noscript-cache/${key}`)

  if (cache) {
    const hit = await cache.match(cacheKey)
    if (hit) return (await hit.json()) as T
  }

  const value = await load()

  if (cache) {
    ctx.waitUntil(
      cache.put(
        cacheKey,
        new Response(JSON.stringify(value), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `max-age=${ttlSeconds}`,
          },
        }),
      ),
    )
  }

  return value
}
