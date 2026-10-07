// ブログ記事の HTML を v-html に渡す前のサニタイズ (ブラウザ専用)。
// markdown.ts からは import しない (Worker のバンドルに DOMPurify を入れないため)。
import DOMPurify, { type Config } from "dompurify"

// 埋め込みを許可する iframe (エディターの YouTube スニペット用)
const IFRAME_SRC_RE =
  /^https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\//i

const PURIFY_CONFIG: Config = {
  // 見出しの id ("title" / "links" など) が document のプロパティ名と同じでも消さない。
  // DOM clobbering は name 属性を禁止し、form を通さないことで防ぐ
  SANITIZE_DOM: false,
  FORBID_ATTR: ["name"],
  // ページ全体に効く <style>、フォーム、中身が描画されない <template> は本文では使わせない
  FORBID_TAGS: ["form", "style", "template"],
  ADD_TAGS: ["iframe"],
  // 外部リンクの target / rel と YouTube の iframe 用
  ADD_ATTR: [
    "target",
    "allow",
    "allowfullscreen",
    "frameborder",
    "referrerpolicy",
  ],
}

// 別ウィンドウで開くリンク (_blank や名前付きの target) は opener / referrer を渡さない
function protectOpener(node: Element) {
  if (node.tagName !== "A") return
  const target = node.getAttribute("target")?.trim().toLowerCase()
  if (
    !target ||
    target === "_self" ||
    target === "_parent" ||
    target === "_top"
  ) {
    return
  }
  const rel = new Set(
    (node.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean),
  )
  if (!rel.has("noopener") || !rel.has("noreferrer")) {
    rel.add("noopener")
    rel.add("noreferrer")
    node.setAttribute("rel", Array.from(rel).join(" "))
  }
}

let purifier: ReturnType<typeof DOMPurify> | null = null

function getPurifier() {
  if (purifier) return purifier
  // 既定のインスタンスに hook を足すと他の利用箇所に影響するので専用のものを作る
  const instance = DOMPurify(window)

  instance.addHook("uponSanitizeElement", (node, data) => {
    if (!(node instanceof Element)) return
    // iframe は YouTube の埋め込みだけ、input はタスクリストのチェックボックスだけ残す
    const keep =
      data.tagName === "iframe"
        ? IFRAME_SRC_RE.test(node.getAttribute("src")?.trim() ?? "")
        : data.tagName === "input"
          ? node.getAttribute("type")?.trim().toLowerCase() === "checkbox"
          : true
    if (!keep) node.remove()
  })

  instance.addHook("afterSanitizeAttributes", protectOpener)

  purifier = instance
  return instance
}

// renderBlogMarkdown(..., { mode: "spa" }).html を v-html に渡す前に必ず通す。
// 記事が使うマークアップ (見出しの id とアンカー、data-social-embed / data-viewer /
// data-tab / data-panel、hljs の span、行ハイライト、details/summary、コンテナや
// 脚注・バッジのクラス、リンクの target/rel、タスクリストのチェックボックス、
// YouTube の iframe) は残し、スクリプトやイベント属性、危険な URL は取り除く
export function sanitizeBlogHtml(html: string): string {
  if (!html) return ""
  return getPurifier().sanitize(html, PURIFY_CONFIG)
}

// ---------------------------------------------------------------------------
// 埋め込み (Mastodon の投稿本文・プロフィールなど) でリモートから受け取った HTML 用。
// 相手のインスタンスが悪意を持っていても実行されないよう、記事用より厳しく絞る
// ---------------------------------------------------------------------------

const REMOTE_PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "a",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "code",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "li",
    "ruby",
    "rt",
    "rp",
    "sub",
    "sup",
    "hr",
    // Pleroma などのカスタム絵文字 (https の画像だけ。下の hook で確認する)
    "img",
  ],
  ALLOWED_ATTR: [
    "href",
    "class",
    "rel",
    "target",
    "title",
    "lang",
    "start",
    "reversed",
    "value",
    "src",
    "alt",
    "width",
    "height",
  ],
  // http(s) と mailto のリンクだけ通す
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  // URL ではない属性まで上の正規表現で消されないようにする
  ADD_URI_SAFE_ATTR: [
    "rel",
    "target",
    "lang",
    "start",
    "value",
    "width",
    "height",
  ],
}

let remotePurifier: ReturnType<typeof DOMPurify> | null = null

function getRemotePurifier() {
  if (remotePurifier) return remotePurifier
  const instance = DOMPurify(window)
  instance.addHook("afterSanitizeAttributes", (node) => {
    // 画像は https だけ (DOMPurify は img の data: を URI の正規表現に関係なく通すため)
    if (node.tagName === "IMG") {
      if (!/^https:\/\//i.test(node.getAttribute("src") ?? "")) {
        node.remove()
        return
      }
      node.setAttribute("loading", "lazy")
      node.setAttribute("referrerpolicy", "no-referrer")
    }
    // リモートのリンクは常に新しいタブで、opener / referrer を渡さずに開く
    if (node.tagName === "A") node.setAttribute("target", "_blank")
    protectOpener(node)
  })
  remotePurifier = instance
  return instance
}

export function sanitizeRemoteHtml(html: string | null | undefined): string {
  if (!html) return ""
  return getRemotePurifier().sanitize(html, REMOTE_PURIFY_CONFIG)
}
