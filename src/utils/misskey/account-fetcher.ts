import axios, { type AxiosResponse } from "axios"

type Args = {
  host: string
  userid: string
}

type Role = {
  name: string
  color: string
  iconUrl: string
}

export type AccountData = {
  name: string
  username: string
  description: string
  avatarUrl: string
  notesCount: number
  followingCount: number
  followersCount: number
  roles: Role[]
}

export const misskeyAccountFetcher = async (args: Args) =>
  await axios
    .post(`https://${args.host}/api/users/show`, {
      username: args.userid,
      host: null,
    })
    .then((data: AxiosResponse<AccountData>) => data.data)
