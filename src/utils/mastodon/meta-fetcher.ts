type Args = {
  host: string
}

export type MetaData = {
  title: string
  version: string
  registrations: boolean
}

export const mastodonMetaFetcher = async (args: Args): Promise<MetaData> => {
  const response = await fetch(`https://${args.host}/api/v1/instance`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}
