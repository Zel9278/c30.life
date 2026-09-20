export type FediverseAccount = {
  host: string
  userId: string
  isNSFW?: boolean
  profilePrefix?: "at" | "plain"
}

export type FediverseLink = {
  title: string
  href: string
}

export const misskeyAccounts: FediverseAccount[] = [
  { host: "misskey.art", userId: "c30" },
  { host: "mk-juice.dev", userId: "c30" },
  { host: "mk.c30.life", userId: "c30" },
  { host: "misskey.blue", userId: "c30" },
  { host: "eth.rumiserver.com", userId: "c30" },
  { host: "msky.haibala.com", userId: "c30" },
  { host: "misskey.systems", userId: "c30" },
  { host: "honi.club", userId: "c30" },
  { host: "exekey.net", userId: "c30" },
  { host: "crafters.aosankaku.net", userId: "c30" },
  { host: "premis.one", userId: "c30" },
  { host: "ddoskey.com", userId: "c30" },
  { host: "oekakiskey.com", userId: "c30" },
  { host: "nijimiss.moe", userId: "c30" },
  { host: "mk.absturztau.be", userId: "c30" },
  { host: "nekomiya.net", userId: "c30" },
  { host: "minazukey.uk", userId: "c30" },
  { host: "misskey.7ka.org", userId: "c30" },
  { host: "misskey.io", userId: "c30" },
  { host: "misskey.flowers", userId: "c30" },
  { host: "mk.shrimpia.network", userId: "c30" },
  { host: "misskey.m544.net", userId: "c30" },
  { host: "misskey.04.si", userId: "c30" },
  { host: "submarin.online", userId: "c30" },
  { host: "p1.a9z.dev", userId: "ez" },
  { host: "mi.cbrx.io", userId: "c30" },
  { host: "sushi.ski", userId: "c30" },
  { host: "misskey.life", userId: "c30" },
  { host: "misskey.noellabo.jp", userId: "c30" },
  { host: "voskey.icalo.net", userId: "c30" },
  { host: "misskey.yukineko.me", userId: "c30" },
  { host: "misskey.cloud", userId: "c30" },
  { host: "misskey.gg", userId: "c30" },
  { host: "misskey.design", userId: "c30" },
  { host: "soukun.io", userId: "c", isNSFW: true },
]

export const mkGoAccounts: FediverseAccount[] = [
  { host: "go.k7a.org", userId: "c30" },
]

export const mastodonAccounts: FediverseAccount[] = [
  { host: "fedibird.com", userId: "c30" },
  { host: "mstdn.jp", userId: "clive64" },
  { host: "mastodon.art", userId: "c30" },
]

export const pleromaAccounts: FediverseAccount[] = [
  { host: "blob.cat", userId: "c30" },
  { host: "fedi.absturztau.be", userId: "c30" },
  { host: "post.syobon.net", userId: "c30" },
  { host: "pr.c30.life", userId: "c30" },
]

export const mitraAccounts: FediverseAccount[] = [
  { host: "mitra.c30.life", userId: "c30", profilePrefix: "at" },
]

export const pixelfedAccounts: FediverseAccount[] = [
  { host: "pixelfed.tokyo", userId: "c30" }
]

function profileUrl(account: FediverseAccount): string {
  const prefix = account.profilePrefix === "plain" ? "" : "@"
  return `https://${account.host}/${prefix}${account.userId}`
}

export const fediverseLinks: FediverseLink[] = [
  ...misskeyAccounts.map((account) => ({
    title: `Misskey (${account.host})`,
    href: profileUrl(account),
  })),
  ...mkGoAccounts.map((account) => ({
    title: `mk-go (${account.host})`,
    href: profileUrl(account),
  })),
  ...mastodonAccounts.map((account) => ({
    title: `Mastodon (${account.host})`,
    href: profileUrl(account),
  })),
  ...pleromaAccounts.map((account) => ({
    title: `Pleroma (${account.host})`,
    href: profileUrl({ ...account, profilePrefix: "plain" }),
  })),
  ...mitraAccounts.map((account) => ({
    title: `Mitra (${account.host})`,
    href: profileUrl(account),
  })),
  ...pixelfedAccounts.map((account) => ({
    title: `Pixelfed (${account.host})`,
    href: profileUrl(account),
  })),
]
