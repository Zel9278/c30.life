export default class EmojiParser {
  private host: string
  private emojis: Record<string, string> | null = null

  constructor(host: string) {
    this.host = host
  }

  private async fetchEmojis() {
    if (this.emojis) return

    try {
      const response = await fetch(`https://${this.host}/api/emojis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
      const data = await response.json()

      this.emojis = data.emojis.reduce(
        (acc: Record<string, string>, emoji: { name: string; url: string }) => {
          acc[`:${emoji.name}:`] =
            `<img src="${emoji.url}" alt=":${emoji.name}:" class="inline h-5" />`
          return acc
        },
        {},
      )
    } catch (error) {
      console.error(`[${this.host}] Failed to fetch emojis: ${error}`)
      this.emojis = {}
    }
  }

  async parse(text: string): Promise<string> {
    await this.fetchEmojis()
    if (!this.emojis) return text

    return text.replace(/:([a-zA-Z0-9_]+):/g, (match) => {
      return this.emojis?.[match] || match
    })
  }
}
