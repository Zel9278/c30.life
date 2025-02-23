type Args = {
  host: string
}

export type MetaData = {
  name: string
  iconUrl: string
  version: string
  disableRegistration: boolean
  repositoryUrl: string
}

export const misskeyMetaFetcher = async (args: Args): Promise<MetaData> => {
  const response = await fetch(`https://${args.host}/api/meta`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ detail: false }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
