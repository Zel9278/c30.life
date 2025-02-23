import axios, { type AxiosResponse } from "axios"

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

export const mastodonAccountFetcher = async (args: Args) =>
  await axios
    .get(`https://${args.host}/api/v1/accounts/lookup?acct=${args.userid}`)
    .then((data: AxiosResponse<AccountData>) => data.data)
