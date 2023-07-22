import { MetadataRoute } from "next"

const root = "https://c30.life"

export default function sitemap(): MetadataRoute.Sitemap {
    return [
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
    ]
}
