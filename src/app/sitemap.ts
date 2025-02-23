import type { MetadataRoute } from "next"
import { getSortedPostsData } from "../utils/blog"
import moment from "moment-timezone"

const root = "https://c30.life"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    {
      url: root,
      lastModified: new Date(),
    },
    {
      url: `${root}/links`,
      lastModified: new Date(),
    },
    {
      url: `${root}/misskey`,
      lastModified: new Date(),
    },
    {
      url: `${root}/mastodon`,
      lastModified: new Date(),
    },
    {
      url: `${root}/midis`,
      lastModified: new Date(),
    },
    {
      url: `${root}/mdic`,
      lastModified: new Date(),
    },
    {
      url: `${root}/pubkeys`,
      lastModified: new Date(),
    },
    {
      url: `${root}/info`,
      lastModified: new Date(),
    },
    {
      url: `${root}/servers`,
      lastModified: new Date(),
    },
    {
      url: `${root}/blog`,
      lastModified: new Date(),
    },
  ]

  const posts = getSortedPostsData()

  for (const post of posts) {
    const date = moment(post.date)

    pages.push({
      url: `${root}/blog/${post.id}`,
      lastModified: date.toDate(),
    })
  }

  return pages
}
