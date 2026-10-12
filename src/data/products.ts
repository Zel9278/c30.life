// /products ページのデータ (SPA と noscript で共有する)。
// 元は status.c30.life の servers.json (Social / Tools)。監視用の API エンドポイントとこのサイト自身は載せない

export type Product = {
  title: string
  url: string
  description: string
}

export type ProductCategory = {
  name: string
  products: Product[]
}

export const productsPage = {
  title: "Products",
  subtitle: "c30が運営しているサービスの一覧",
  statusUrl: "https://status.c30.life",
}

export const productCategories: ProductCategory[] = [
  {
    name: "Social",
    products: [
      {
        title: "Misskey (炒めて切った野菜ジュース)",
        url: "https://mk.c30.life",
        description:
          "c30の個人Misskeyサーバー。いまはアーカイブのような扱いで、メンテナンスだけしている。",
      },
      {
        title: "Misskey (Misskey.art)",
        url: "https://misskey.art",
        description:
          "創作活動をする人や見る人を歓迎するMisskeyサーバー。投稿のルール・ガイドラインがあり、登録にはメールアドレスが必要。",
      },
      {
        title: "Misskey (腋すきー)",
        url: "https://soukun.io",
        description:
          "Misskeyサーバー「シン・真・新元祖本家ネオ腋すきー2」。サーバーはc30が持っている。",
      },
      {
        title: "Pleroma (炒めて切った希望ジュース)",
        url: "https://pr.c30.life",
        description: "c30のPleromaサーバー。",
      },
      {
        title: "Activity Relay Service",
        url: "https://relay.tools.c30.life",
        description:
          "ActivityPub対応サーバー向けのリレーサービス。参加したサーバー同士で公開投稿を中継する。",
      },
      {
        title: "Mitra (炒めて切った契約ジュース)",
        url: "https://mitra.c30.life",
        description: "c30のMitraサーバー（Fediverseに対応したSNS）。",
      },
      {
        title: "Misskey Juice (Juice Server)",
        url: "https://mk-juice.dev",
        description:
          "Misskeyのフォーク「Misskey Juice」の juice/main ブランチを追従しているサーバー。新規登録を受け付けていて、創作やゆるい交流向けの汎用サーバーとしても運用している。",
      },
      {
        title: "Fedidraw (絵チャ)",
        url: "https://draw.mk-juice.dev",
        description:
          "Fediverseのアカウントでログインして、みんなと同じキャンバスにリアルタイムで絵を描ける絵チャ。部屋を作って遊べる。",
      },
      {
        title: "Matrix (Element)",
        url: "https://matrix.c30.jp",
        description:
          "c30のMatrixサーバー（matrix.c30.jp）で使えるWebクライアント、Element。",
      },
      {
        title: "Matrix (Cinny)",
        url: "https://cinny.c30.jp",
        description:
          "同じMatrixサーバーで使える、シンプルなWebクライアントのCinny。",
      },
      {
        title: "Multi Player Piano",
        url: "https://mpp.c30.life",
        description:
          "1人でも、ほかの人とリアルタイムでも弾けるオンラインピアノ。MIDIに対応していて、チャットもできる。",
      },
      {
        title: "bbsan(bb3)",
        url: "https://bbsan.club",
        description:
          "スレッド形式の掲示板（BB3）。ニュース速報や実況などの板がある。",
      },
    ],
  },
  {
    name: "Tools",
    products: [
      {
        title: "PC Status",
        url: "https://pc-stats.eov2.com",
        description:
          "専用クライアント pcsc-rs をつないだPCのCPU・メモリ・GPUなどの状態を、リアルタイムに一覧するサイト。データは保存しない。",
      },
      {
        title: "Progress Bar for Days Web",
        url: "https://pdays.eov2.com",
        description:
          "今年が何日・何%進んだかを日本時間で表示するプログレスバー。",
      },
      {
        title: "Emoji Ranking V2",
        url: "https://er.c30.life",
        description:
          "Fediverseの各サーバーのカスタム絵文字の数を集計して、ランキングとグラフで見られるサイト。",
      },
      {
        title: "至り来たり宿 モニタリング",
        url: "https://itari-kitari.c30.life",
        description:
          "サーバー「至り来たり宿」の状態を表示するモニタリングページ。",
      },
      {
        title: "c30のふぁいるさあばあ",
        url: "https://f.c30.life",
        description: "c30のファイルサーバー。ファイル一覧とAPIがある。",
      },
      {
        title: "Misskey Login Bonus Calendar",
        url: "https://lbc.tools.c30.life",
        description:
          "ログボBotのリアクションをもとに、Misskeyのログインボーナスの取得状況をカレンダーで確認できるWebアプリ。",
      },
      {
        title: "Forgejo Server (炒めて切った鍛冶ジュース)",
        url: "https://git.c30.life",
        description:
          "Forgejoで動いているc30のGitサーバー「炒めて切った鍛冶ジュース」。",
      },
      {
        title: "SkullOS Mirror",
        url: "https://mirror.skullos.c30.life",
        description: "SkullOS用のpacmanリポジトリのミラー。",
      },
      {
        title: "Whoami (apub test info)",
        url: "https://whoami.tools.c30.life",
        description:
          "ActivityPubの動作確認用サーバー。自分のアカウントがリモートからどう見えるかを確認するのに使う。",
      },
    ],
  },
]

// 表示用のホスト名 (https:// と末尾の / を除く)
export function productHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

// --- 稼働状況（status.c30.life の API）。SPA と noscript で共有する ---

export const STATUS_API = "https://api.status.c30.life"

export type ProductState = "up" | "down" | "maintenance"

export type ProductStatus = {
  state: ProductState
  // 直近の応答時間 (ms)
  latency: number | null
  // 30日の稼働率 (%)
  uptime30d: number | null
}

export type ProductStatuses = {
  // キーは product.url（末尾の / を除いたもの）
  byUrl: Record<string, ProductStatus>
  checkedAt: string | null
}

type StatusReport = {
  url: string
  status: string
  latency?: number | null
  checked_at?: string
}
type UptimeRow = { url: string; uptime_percent_30d?: number | null }
type MaintenanceEntry = { service: string; maintenance?: boolean }

const normalizeUrl = (url: string) => url.replace(/\/+$/, "")

/** status.c30.life のサービスのページ (/services/<ホスト名とパス>) */
export function statusPageUrl(url: string): string {
  const u = new URL(url)
  const slug = (u.host + u.pathname.replace(/\/+$/, "")).replace(/\//g, "~")
  return `https://status.c30.life/services/${slug}`
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${STATUS_API}${path}`)
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return (await response.json()) as T
}

/** 今の稼働状況。メンテナンス中のものは down より先に maintenance にする */
export async function loadProductStatuses(): Promise<ProductStatuses> {
  const [status, maintenance] = await Promise.all([
    getJson<{ reports: StatusReport[]; uptime?: UptimeRow[] }>("/api/status"),
    getJson<{ services?: MaintenanceEntry[] }>("/api/maintenance").catch(
      () => null,
    ),
  ])
  const inMaintenance = new Set(
    (maintenance?.services ?? [])
      .filter((s) => s.maintenance)
      .map((s) => s.service),
  )
  const uptime = new Map(
    (status.uptime ?? []).map((u) => [
      normalizeUrl(u.url),
      u.uptime_percent_30d ?? null,
    ]),
  )
  const byUrl: Record<string, ProductStatus> = {}
  let checkedAt: string | null = null
  for (const report of status.reports) {
    const key = normalizeUrl(report.url)
    const host = new URL(report.url).host
    byUrl[key] = {
      state: inMaintenance.has(host)
        ? "maintenance"
        : report.status === "up"
          ? "up"
          : "down",
      latency: report.latency ?? null,
      uptime30d: uptime.get(key) ?? null,
    }
    if (report.checked_at && (!checkedAt || report.checked_at > checkedAt))
      checkedAt = report.checked_at
  }
  return { byUrl, checkedAt }
}

export const statusOf = (
  statuses: ProductStatuses | null,
  product: Product,
): ProductStatus | null => statuses?.byUrl[normalizeUrl(product.url)] ?? null

export const productStateLabels: Record<ProductState, string> = {
  up: "稼働中",
  down: "停止中",
  maintenance: "メンテナンス中",
}

/** 頭文字のアイコンに出す2文字（ホスト名の最初の部分から） */
export function productMonogram(url: string): string {
  const label = productHost(url).split(".")[0] ?? ""
  return (
    label
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 2)
      .toUpperCase() || "?"
  )
}

/** 頭文字のアイコンの色相（ホスト名から決める） */
export function productHue(url: string): number {
  let hash = 0
  for (const ch of productHost(url)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return hash % 360
}

/** 稼働率の表示（100 は小数を出さない） */
export const formatUptime = (value: number | null) =>
  value === null ? "—" : `${value === 100 ? 100 : value.toFixed(2)}%`
