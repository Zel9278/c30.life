import { neutralizeNoscript } from "./html.ts"
import { renderJsRequired, renderLayout } from "./layout.ts"
import { matchRoute } from "./routes.ts"
import type { NoscriptContext, NoscriptEnv, NoscriptResult } from "./types.ts"

export type { NoscriptEnv } from "./types.ts"

export interface RenderedNoscript
  extends Required<Omit<NoscriptResult, "image">> {
  image?: string
  // <noscript> の中身 (レイアウト込み・無害化済み)
  html: string
}

export async function renderNoscript(
  url: URL,
  env: NoscriptEnv,
  waitUntil: (promise: Promise<unknown>) => void,
): Promise<RenderedNoscript> {
  const pathname = decodePath(url.pathname)
  const { route, params } = matchRoute(pathname)
  const ctx: NoscriptContext = { url, params, env, waitUntil }

  let result: NoscriptResult
  try {
    result = await route.render(ctx)
  } catch (e) {
    console.error("noscript render failed:", pathname, e)
    result = {
      body: renderJsRequired(
        route.title,
        "このページの内容を表示できませんでした。JavaScriptを有効にしてもう一度お試しください。",
      ),
    }
  }

  return {
    html: neutralizeNoscript(renderLayout(pathname, result.body)),
    body: result.body,
    status: result.status ?? 200,
    title: result.title ?? route.title,
    description: result.description ?? route.description,
    image: result.image,
    noindex: result.noindex ?? false,
  }
}

function decodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}
