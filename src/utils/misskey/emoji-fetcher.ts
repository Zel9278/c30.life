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

export const misskeyEmojiFetcher = async (args: Args): Promise<EmojiData[]> => {
  const response = await fetch(`https://${args.host}/api/emojis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = (await response.json()) as ResultData
  return data.emojis
}
