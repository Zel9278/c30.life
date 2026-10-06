// Info ページに表示するサイト情報 (SPA と noscript で共有する)

export const siteInfo = {
  host: "c30.life",
  owner: "c30 (@c30@mk.c30.life)",
}

export type SiteLink = {
  label: string
  href: string
  text: string
}

// Sitemap / Robots
export const siteFileLinks: SiteLink[] = [
  { label: "Sitemap", href: "/sitemap.xml", text: "sitemap.xml" },
  { label: "Robots", href: "/robots.txt", text: "robots.txt" },
]

// Repository (表示順どおり)
export const siteRepositories: Omit<SiteLink, "label">[] = [
  {
    href: "https://github.com/Zel9278/c30.life",
    text: "github.com:zel9278/c30.life",
  },
  {
    href: "https://gitea.moe/ced0180/c30.life",
    text: "gitea.moe:ced0180/c30.life",
  },
  {
    href: "https://git.c30.life/ced/c30.life",
    text: "git.c30.life:ced/c30.life",
  },
]
