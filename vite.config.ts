import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import Sitemap from "vite-plugin-sitemap"
import { createRequire } from "node:module"

import { fediverseLinks } from "./fediverseLinks.ts"

const fediverseRelMePlugin = {
  name: "fediverse-rel-me",
  transformIndexHtml(html: string) {
    const links = fediverseLinks
      .map(({ href }) => `  <link rel="me" href="${href}" />`)
      .join("\n")

    return html.replace(
      '  <link rel="alternate" type="application/rss+xml" title="c30.life Blog RSS" href="/api/rss" />',
      `  <link rel="alternate" type="application/rss+xml" title="c30.life Blog RSS" href="/api/rss" />\n${links}`,
    )
  },
}

const { version } = require("./package.json") as { version: string }

const routes = [
  "/",
  "/links",
  "/blog",
  "/fediaccounts",
  "/info",
  "/environments",
  "/servers",
  "/pubkeys",
  "/watched-animes",
]

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    vue(),
    tailwindcss(),
    fediverseRelMePlugin,
    Sitemap({
      hostname: "https://c30.life",
      dynamicRoutes: routes,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    chunkSizeWarningLimit: 7000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          // Vue core
          if (/[\\/]node_modules[\\/](vue|vue-router|@vue)[\\/]/.test(id))
            return "vue-vendor"
          // Markdown & syntax highlighting (used only in BlogPost)
          if (
            /[\\/]node_modules[\\/](marked|marked-highlight|highlight\.js)[\\/]/.test(
              id,
            )
          )
            return "markdown"
          // Monaco Editor
          if (/[\\/]node_modules[\\/]monaco-editor[\\/]/.test(id))
            return "monaco-editor"
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
    },
  },
})
