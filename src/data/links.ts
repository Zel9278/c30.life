// /links ページのリンク集データ。SPA (src/components/Links.vue) と noscript レンダラーで共有する
// ビルド時に vite.config.ts 経由でも読まれる可能性があるので、Vue / DOM には依存させない

export type Link = {
  title: string
  href: string
  rel?: string
  image?: string | null
  alt?: string
  width?: number
  height?: number
}

export const contacts: Link[] = [
  {
    title: "X (旧Twitter)",
    href: "https://x.com/fuji_ced",
  },
  {
    title: "Discord",
    href: "https://discord.gg/X7RrHwV4US",
  },
  {
    title: "Mail",
    href: "mailto:ced@c30.life",
  },
  {
    title: "Misskey",
    href: "https://mk.c30.life/@c30",
    rel: "me",
  },
]

export const socialLinks: Link[] = [
  {
    title: "Misskey.art",
    href: "https://misskey.art/@c30",
    rel: "me",
  },
  {
    title: "Misskey.io",
    href: "https://misskey.io/@c30",
    rel: "me",
  },
  {
    title: "Emoji Ranking V2",
    href: "https://er.c30.life/ap/u/c30",
  },
  {
    title: "Bluesky",
    href: "https://bsky.app/profile/c30.life",
  },
  {
    title: "Github",
    href: "https://github.com/Zel9278",
  },
  {
    title: "Youtube(archive)",
    href: "https://www.youtube.com/@cedmidiark",
  },
  {
    title: "Niconico",
    href: "https://www.nicovideo.jp/user/40069987",
  },
  {
    title: "Pixiv",
    href: "https://www.pixiv.net/users/71067167",
  },
  {
    title: "Keyoxide",
    href: "https://keyoxide.org/5717936DE6707ABE284ADB9A4C10C121022E422D",
  },
  {
    title: "Keybase",
    href: "https://keybase.io/c30",
  },
  {
    title: "Skeb",
    href: "https://skeb.jp/@c30",
  },
]

export const otherSites: Link[] = [
  {
    title: "Status Page",
    href: "https://status.c30.life",
  },
  {
    title: "kusoda.net(クソだね)",
    href: "https://kusoda.net",
  },
  {
    title: "PC Status",
    href: "https://pc-stats.eov2.com",
  },
  {
    title: "PC Status (new)",
    href: "https://pc-status.net",
  },
  {
    title: "Progress Bar for Days Web",
    href: "https://pdays.eov2.com",
  },
  {
    title: "c30のふぁいるさあばあ",
    href: "https://f.c30.life",
  },
  {
    title: "至り来たり宿 モニタリング",
    href: "https://itari-kitari.c30.life",
  },
  {
    title: "Emoji Ranking V2",
    href: "https://er.c30.life",
  },
  {
    title: "炒めて切った野菜ジュースのチャット (Dev)",
    href: "https://chat.dev.c30.life",
  },
  {
    title: "Multi Player Piano",
    href: "https://mpp.c30.life",
  },
  {
    title: "Misskey Login Bonus Calendar",
    href: "https://lbc.tools.c30.life",
  },
  {
    title: "Misskey Juice (docs)",
    href: "https://docs.mk-juice.dev",
  },
]

export const myFediverseServers: Link[] = [
  {
    title: "Misskey.art",
    href: "https://misskey.art",
    image:
      "https://raw.githubusercontent.com/Misskey-art/Assets/main/banner/200x40.png",
    alt: "Misskey.art",
  },
  {
    title: "至り来たり宿（第二期）",
    href: "https://mk.c30.life",
    image: "https://mk.c30.life/files/2d68d53f-1316-4953-86c7-92f88e566620",
    alt: "至り来たり宿（第二期）",
  },
  {
    title: "炒めて切った野菜ジュース Activity Relay Service",
    href: "https://relay.tools.c30.life",
  },
  {
    title: "炒めて切った希望ジュース",
    href: "https://pr.c30.life",
  },
  {
    title: "炒めて切った契約ジュース",
    href: "https://mitra.c30.life",
  },
  {
    title: "Misskey Juice",
    href: "https://mk-juice.dev",
  },
]

export const mutualLinks: Link[] = [
  {
    title: "hi there (assault1892)",
    href: "https://assault1892.boats",
    image: "https://assault1892.boats/banner/assault1892.png",
    alt: "あさるとのホームページ",
  },
  {
    title: "fuck cloudflare (assault1892)",
    href: "https://assault1892.boats/fuck",
    image: "https://assault1892.boats/banner/fuckcloudflare.png",
    alt: "あさるとのホームページ",
  },
  {
    title: "kazukazu123123",
    href: "https://kazu123.net",
    image: "https://kazu123.net/banner.png",
    alt: "かずかずのホームページ",
  },
  {
    title: "かんたん宛名印刷",
    href: "https://eap.vg",
    image: "https://eap.vg/img/eap-banner.png",
    alt: "かんたん宛名印刷さんのホームページ",
  },
  {
    title: "OopsOkinTP",
    href: "https://www.okin-jp.net",
    image:
      "https://www.okin-jp.net/wp-content/uploads/2024/07/d8d7453933231e34d67366077f68504b.png",
    alt: "おきんさんのホームページ",
  },
  {
    title: "SyoBoN’s Home",
    href: "https://syobon.net",
    image: "https://syobon.net/assets/banner.png",
    alt: "SyoBoNさんのホームページ",
  },
  {
    title: "敷島ロイのホームページ",
    href: "https://roi.3.5mbps.net",
    image: "https://roi.3.5mbps.net/images/homepage_banner_1.png",
    alt: "敷島ロイさんのホームページ",
  },
  {
    title: "さんせっとのホームページ",
    href: "https://sunset0916.net",
    image: "https://sunset0916.net/img/banner.png",
    alt: "さんせっとさんのホームページ",
  },
  {
    title: "腋すきー",
    href: "https://soukun.io",
    image:
      "https://files.soukun.io/a/webpublic-8da63201-f663-429e-bd2a-ad8a22364e23",
    alt: "くろのすけさんのホームページ",
  },
  {
    title: "デデオチャンのホームページ",
    href: "https://deryck2000.jp.eu.org/",
    image: "https://deryck2000.jp.eu.org/banner.png",
    alt: "デデオチャンのホームページ",
  },
  {
    title: "垂紡町",
    href: "https://suiboutown.tumblr.com/",
    image:
      "https://files.misskey.art//fd270cc0-02e3-49ad-9351-c247f5a466a5.png",
    alt: "さんめさんのホームページ",
  },
  {
    title: "Lamp",
    href: "https://lamp.wtf",
    image: null,
    alt: "ランプのホームページ",
  },
]

export const myBanners: Link[] = [
  {
    title: "c30.life",
    href: "https://c30.life",
    image: "/c30-life-banner.png",
    alt: "ホームページ",
    width: 234,
    height: 60,
  },
  {
    title: "c30.life",
    href: "https://c30.life",
    image: "/c30-life-banner-2.png",
    alt: "ホームページ",
    width: 234,
    height: 60,
  },
]

export const linksPage = {
  title: "Links",
  subtitle: "c30の各種リンク集",
}

export const linkSectionTitles = {
  contacts: "Contacts",
  socials: "Socials",
  others: "Others",
  fediverse: "My Fediverse Servers",
  reciprocal: "Reciprocal Links",
  banner: "My Banner",
}

export type LinkSection = {
  id: keyof typeof linkSectionTitles
  title: string
  // list: テキストリンクのグリッド / banner: バナー画像 (画像がなければタイトル文字)
  kind: "list" | "banner"
  links: Link[]
}

// 表示順は SPA と同じ
export const linkSections: LinkSection[] = [
  {
    id: "contacts",
    title: linkSectionTitles.contacts,
    kind: "list",
    links: contacts,
  },
  {
    id: "socials",
    title: linkSectionTitles.socials,
    kind: "list",
    links: socialLinks,
  },
  {
    id: "others",
    title: linkSectionTitles.others,
    kind: "list",
    links: otherSites,
  },
  {
    id: "fediverse",
    title: linkSectionTitles.fediverse,
    kind: "banner",
    links: myFediverseServers,
  },
  {
    id: "reciprocal",
    title: linkSectionTitles.reciprocal,
    kind: "banner",
    links: mutualLinks,
  },
  {
    id: "banner",
    title: linkSectionTitles.banner,
    kind: "banner",
    links: myBanners,
  },
]
