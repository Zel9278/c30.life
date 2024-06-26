import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/chat/", "/read/"],
        },
        sitemap: "https://c30.life/sitemap.xml",
        host: "https://c30.life",
    }
}
