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
