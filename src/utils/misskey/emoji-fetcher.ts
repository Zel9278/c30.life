import axios, { type AxiosResponse } from "axios"

type Args = {
  host: string
}

export type EmojiData = {
  aliases: string[]
  category: string
  name: string
  url: string
}

type ResultData = {
  emojis: EmojiData[]
}

export const misskeyEmojiFetcher = async (args: Args) =>
  await axios
    .post(`https://${args.host}/api/emojis`, {})
    .then((data: AxiosResponse<ResultData>) => data.data?.emojis)
