// /servers ページのデータ (SPA と noscript で共有する)

export type ServerStatus = "gone" | "active" | "unknown"
export type ServerSoftware =
  | "Misskey"
  | "Misskey Tempura"
  | "Akkoma"
  | "Foundkey"
  | "Calckey"
  | "Dolphin"
  | "GotoSocial"
  | "Mastodon"
  | "Simkey"
  | "Firefish"
  | "Pleroma"
  | "Activity Relay Fork"
  | "Mitra"
  | "Misskey Juice"
export type Server = {
  name: string
  url: string
  software: ServerSoftware
  created_at: string
  status: ServerStatus
}

export const serversPage = {
  title: "My Fediverse Servers",
  subtitle: "c30が関わったFediverseサーバーの一覧",
}

// 凡例の表示順
export const serverStatusOrder: ServerStatus[] = ["unknown", "gone", "active"]

export const serverStatusLabels: Record<ServerStatus, string> = {
  unknown: "Unknown",
  gone: "Gone済み",
  active: "稼働中",
}

export const serverTableHeaders = ["名前", "URL", "ソフトウェア", "作成日"]

// gone のサーバーはリンクにせず、URL の後ろにこの注意書きを付ける
export const goneServerNote = "(アクセスしないでください)"

export const softwares: Record<ServerSoftware, string> = {
  Misskey: "https://github.com/misskey-dev/misskey",
  "Misskey Tempura": "https://github.com/lqvp/misskey-tempura",
  Akkoma: "https://akkoma.dev/AkkomaGang/akkoma",
  Foundkey: "https://akkoma.dev/FoundKeyGang/FoundKey",
  Calckey: "https://codeberg.org/calckey/calckey",
  Dolphin: "https://github.com/misskey-dev/dolphin",
  GotoSocial: "https://github.com/superseriousbusiness/gotosocial",
  Mastodon: "https://github.com/mastodon/mastodon",
  Simkey: "https://github.com/sim1222/misskey",
  Firefish: "https://git.joinfirefish.org/firefish/firefish.git",
  Pleroma: "https://git.pleroma.social/pleroma/pleroma",
  "Activity Relay Fork": "https://github.com/Zel9278/Activity-Relay",
  Mitra: "https://codeberg.org/silverpill/mitra",
  "Misskey Juice": "https://github.com/Zel9278/misskey-juice",
}

export const bigServers: Server[] = [
  {
    name: "Misskeyをしよう",
    url: "https://mi-wo.site",
    software: "Misskey",
    created_at: "2022-12-24",
    status: "gone",
  },
  {
    name: "Beta Misskeyをしよう",
    url: "https://beta.mi-wo.site",
    software: "Misskey",
    created_at: "2022-12-28",
    status: "gone",
  },
  {
    name: "Misskey.art",
    url: "https://misskey.art",
    software: "Misskey",
    created_at: "2023-02-06",
    status: "active",
  },
]

export const privateServers: Server[] = [
  {
    name: "csys misskey鯖",
    url: "https://misskey.csys64.com/",
    software: "Misskey",
    created_at: "2022-11-24",
    status: "gone",
  },
  {
    name: "misskey kusoda.net店",
    url: "https://social.kusoda.net/",
    software: "Misskey",
    created_at: "2022-11-27",
    status: "gone",
  },
  {
    name: "せどすきー",
    url: "https://mi.eox2.com",
    software: "Misskey",
    created_at: "2022-12-22",
    status: "gone",
  },
  {
    name: "せどすきー",
    url: "https://m.c30.life",
    software: "Misskey",
    created_at: "2023-03-30",
    status: "gone",
  },
  {
    name: "せどこま",
    url: "https://a.c30.life",
    software: "Akkoma",
    created_at: "2023-05-27",
    status: "gone",
  },
  {
    name: "せどくっきー",
    url: "https://ck.c30.life",
    software: "Calckey",
    created_at: "2023-05-28",
    status: "gone",
  },
  {
    name: "せどぴん",
    url: "https://d.c30.life",
    software: "Dolphin",
    created_at: "2023-05-31",
    status: "gone",
  },
  {
    name: "GS30",
    url: "https://gs.c30.life",
    software: "GotoSocial",
    created_at: "2023-06-09",
    status: "gone",
  },
  {
    name: "せどん",
    url: "https://md.c30.life",
    software: "Mastodon",
    created_at: "2023-06-10",
    status: "gone",
  },
  {
    name: "せしむ",
    url: "https://sk.c30.life",
    software: "Simkey",
    created_at: "2023-06-10",
    status: "gone",
  },
  {
    name: "何かものすごく木月ってるサーバー",
    url: "https://kizzkey.cloud",
    software: "Firefish",
    created_at: "2023-07-09",
    status: "gone",
  },
  {
    name: "ab62",
    url: "https://ab62.icu",
    software: "Misskey",
    created_at: "2023-07-22",
    status: "gone",
  },
  {
    name: "_",
    url: "https://_c30.life",
    software: "Firefish",
    created_at: "2023-??-??",
    status: "gone",
  },
  {
    name: "木月のようなそうでもない地下にあるすごくもないサーバー",
    url: "https://shelter.kizzkey.cloud",
    software: "Firefish",
    created_at: "2023-09-05",
    status: "gone",
  },
  {
    name: "木月 Misskey",
    url: "https://mi.kizzkey.cloud",
    software: "Misskey",
    created_at: "2023-09-17",
    status: "gone",
  },
  {
    name: "木月 Foundkey",
    url: "https://fk.kizzkey.cloud",
    software: "Foundkey",
    created_at: "2023-09-25",
    status: "gone",
  },
  {
    name: "なんかものすごい木月ではなさそうな鯖へ来た感じのそういうあれみたいな...",
    url: "https://gts.kizzkey.cloud",
    software: "GotoSocial",
    created_at: "2023-09-28",
    status: "gone",
  },
  {
    name: "木月 Mastodon店",
    url: "https://mstdn.kizzkey.cloud",
    software: "Mastodon",
    created_at: "2023-09-29",
    status: "gone",
  },
  {
    name: "木月 Pleroma店",
    url: "https://ple.kizzkey.cloud",
    software: "Pleroma",
    created_at: "2023-09-30",
    status: "gone",
  },
  {
    name: "tro鯖",
    url: "https://tro9.life",
    software: "Firefish",
    created_at: "2023-10-07",
    status: "gone",
  },
  {
    name: "tty7",
    url: "https://p.tty7.uk",
    software: "Pleroma",
    created_at: "2023-11-??",
    status: "gone",
  },
  {
    name: "至り来たり宿",
    url: "https://m.tty7.uk",
    software: "Misskey",
    created_at: "2024-01-05",
    status: "gone",
  },
  {
    name: "至り来たり宿（第二期）-> 炒めて切った野菜ジュース",
    url: "https://mk.c30.life",
    software: "Misskey Tempura",
    created_at: "2024-05-22",
    status: "active",
  },
  {
    name: "炒めて切った野菜ジュース Activity Relay Service",
    url: "https://relay.tools.c30.life",
    software: "Activity Relay Fork",
    created_at: "2026-01-01",
    status: "active",
  },
  {
    name: "炒めて切った希望ジュース",
    url: "https://pr.c30.life",
    software: "Pleroma",
    created_at: "2026-01-05",
    status: "active",
  },
  {
    name: "炒めて切った契約ジュース",
    url: "https://mitra.c30.life",
    software: "Mitra",
    created_at: "2026-08-20",
    status: "active",
  },
  {
    name: "Juice Server",
    url: "https://mk-juice.dev",
    software: "Misskey Juice",
    created_at: "2026-09-01",
    status: "active",
  },
]

export const sponsoringServers: Server[] = [
  {
    name: "腋すきー",
    url: "https://soukun.xyz",
    software: "Foundkey",
    created_at: "2023-06-02",
    status: "gone",
  },
  {
    name: "腋すきー",
    url: "https://soukun.io",
    software: "Misskey",
    created_at: "2023-08-12",
    status: "active",
  },
]

export type ServerSection = {
  heading: string
  servers: Server[]
}

export const serverSections: ServerSection[] = [
  { heading: "大型鯖", servers: bigServers },
  { heading: "個人鯖", servers: privateServers },
  { heading: "提供鯖", servers: sponsoringServers },
]
