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

export const misskeyAccountFetcher = async (
  args: Args,
): Promise<AccountData> => {
  const response = await fetch(`https://${args.host}/api/users/show`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: args.userid,
      host: null,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return (await response.json()) as AccountData
}
