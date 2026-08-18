import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
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
