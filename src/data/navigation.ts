// ヘッダーのメニュー (src/components/Header.vue) と noscript 版 (src/noscript/layout.ts) で共有する

// stroke: 24x24 の線アイコン (Heroicons outline と同じ描き方)。image: 画像ファイル
export type NavIcon =
  | { type: "stroke"; d: string }
  | { type: "image"; src: string }

export const navIcons = {
  home: {
    type: "stroke",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  link: {
    type: "stroke",
    d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  document: {
    type: "stroke",
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  download: {
    type: "stroke",
    d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  },
  pc: {
    type: "stroke",
    d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  server: {
    type: "stroke",
    d: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  },
  key: {
    type: "stroke",
    d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  },
  film: {
    type: "stroke",
    d: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
  },
  info: {
    type: "stroke",
    d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  fediverse: { type: "image", src: "/fediverse.svg" },
} satisfies Record<string, NavIcon>

export type NavItem = {
  to: string
  label: string
  icon: NavIcon
}

export const menuItems: NavItem[] = [
  { to: "/", label: "Home", icon: navIcons.home },
  { to: "/links", label: "Links", icon: navIcons.link },
  { to: "/blog", label: "Blog", icon: navIcons.document },
  { to: "/downloads", label: "Downloads", icon: navIcons.download },
  { to: "/environments", label: "Environments", icon: navIcons.pc },
  { to: "/servers", label: "Servers", icon: navIcons.server },
  { to: "/pubkeys", label: "Pubkeys", icon: navIcons.key },
  { to: "/watched-animes", label: "Animes", icon: navIcons.film },
  { to: "/fediaccounts", label: "Fedi Accounts", icon: navIcons.fediverse },
  { to: "/info", label: "Info", icon: navIcons.info },
]

export const siteTitle = "c30.life"

export const footerText = "© 2026 ced / c30.life"
