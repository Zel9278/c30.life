type Args = {
  host: string
  userid: string
}

export type AccountData = {
  display_name: string
  username: string
  note: string
  avatar: string
  followers_count: number
  following_count: number
  statuses_count: number
}

export const mastodonAccountFetcher = async (
  args: Args,
): Promise<AccountData> => {
  const response = await fetch(
    `https://${args.host}/api/v1/accounts/lookup?acct=${args.userid}`,
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return (await response.json()) as AccountData
}
