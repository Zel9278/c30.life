import axios, { type AxiosResponse } from "axios"

type Args = {
  host: string
}

export type MetaData = {
  title: string
  version: string
  registrations: boolean
}

export const mastodonMetaFetcher = async (args: Args) =>
  await axios
    .get(`https://${args.host}/api/v1/instance`)
    .then((data: AxiosResponse<MetaData>) => data.data)
