// /pubkeys ページのデータ (SPA と noscript で共有する)

export type Pubkey = {
  title: string
  content: string | string[]
}

export const pubkeysPage = {
  title: "Public Keys",
  subtitle: "c30の公開鍵・ID一覧",
}

export const pubkeys: Pubkey[] = [
  {
    title: "SSH",
    content:
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAUPX3H1WYraFO4i9XHZPA7Mytzxjl6buDkIsvP45adw",
  },
  {
    title: "PGP",
    content: "5717936DE6707ABE284ADB9A4C10C121022E422D",
  },
  {
    title: "Steam",
    content: ["1012960934", "fuji_midi"],
  },
]

export const getPubkeyContents = (content: string | string[]): string[] =>
  Array.isArray(content) ? content : [content]
