import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import Sitemap from "vite-plugin-sitemap"

const routes = [
  "/",
  "/links",
  "/blog",
  "/timeline",
  "/misskey",
  "/mastodon",
  "/info",
  "/environments",
  "/servers",
  "/pubkeys",
  "/watched-animes",
]

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue core
          "vue-vendor": ["vue", "vue-router"],
          // Markdown & syntax highlighting (used only in BlogPost)
          markdown: ["marked", "marked-highlight", "highlight.js"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8788",
        changeOrigin: true,
      },
    },
  },
})
