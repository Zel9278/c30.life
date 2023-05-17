import axios, { AxiosResponse } from "axios"

type Args = {
    host: string
    userid: string
}

export type UserData = {
    name: string
    username: string
    avatarUrl: string
    followersCount: number
    followingCount: number
    notesCount: number
    description: string
}

export const misskeyAccountFetcher = (args: Args) =>
    axios
        .post(`https://${args.host}/api/users/show`, {
            username: args.userid,
            host: null,
        })
        .then((data: AxiosResponse<UserData>) => data.data)
