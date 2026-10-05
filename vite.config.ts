import { readdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import Sitemap from "vite-plugin-sitemap"

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

const rootDir = fileURLToPath(new URL(".", import.meta.url))
const require = createRequire(import.meta.url)
const { version, dependencies, devDependencies } =
  require("./package.json") as {
    version: string
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
  }

type PackageJson = {
  version: string
  license?: string | { type?: string }
  repository?: string | { url?: string }
  author?: string | { name?: string }
}

// package.json に license / repository が無いパッケージの補完
const packageInfoOverrides: Record<
  string,
  { license?: string; repository?: string }
> = {
  "vite-plugin-sitemap": {
    license: "MIT",
    repository: "https://github.com/jbaubree/vite-plugin-sitemap",
  },
}

function normalizeRepository(
  name: string,
  repository: PackageJson["repository"],
) {
  const raw = typeof repository === "string" ? repository : repository?.url
  if (!raw) return `https://www.npmjs.com/package/${name}`
  // "owner/repo" や "github:owner/repo" の省略形
  const shorthand = raw.match(/^(?:github:)?([\w.-]+\/[\w.-]+)$/)
  if (shorthand) return `https://github.com/${shorthand[1]}`
  return raw
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^http:\/\//, "https://")
    .replace(/\.git$/, "")
}

function normalizeAuthor(author: PackageJson["author"]) {
  const raw = typeof author === "string" ? author : author?.name
  // "Name <email> (url)" から名前だけ残す
  const name = raw
    ?.replace(/<[^>]*>/g, "")
    .replace(/\([^)]*\)/g, "")
    .trim()
  return name && !name.includes("@") ? name : undefined
}

function readLicenseText(dir: string) {
  const files = readdirSync(dir)
    .filter((file) => /^(licen[cs]e|copying)/i.test(file))
    // LICENSE-MIT を LICENSE-APACHE より先に出す
    .sort(
      (a, b) =>
        Number(/mit/i.test(b)) - Number(/mit/i.test(a)) || a.localeCompare(b),
    )
  return (
    files
      .map((file) =>
        readFileSync(join(dir, file), "utf8")
          .replace(/\r\n/g, "\n")
          // vite の LICENSE.md は同梱ライブラリのライセンスまで含むので本体分だけ残す
          .split(/^#+ Licenses of bundled dependencies/im)[0]
          .trim(),
      )
      .join("\n\n---\n\n") || undefined
  )
}

function collectLicenses() {
  return Object.keys({ ...dependencies, ...devDependencies })
    .sort()
    .map((name) => {
      const dir = join(rootDir, "node_modules", name)
      const pkg = JSON.parse(
        readFileSync(join(dir, "package.json"), "utf8"),
      ) as PackageJson
      const override = packageInfoOverrides[name] ?? {}
      const license =
        override.license ??
        (typeof pkg.license === "string" ? pkg.license : pkg.license?.type) ??
        "UNKNOWN"
      const repository =
        override.repository ?? normalizeRepository(name, pkg.repository)
      return {
        name,
        version: pkg.version,
        license,
        repository,
        publisher: normalizeAuthor(pkg.author),
        licenseText:
          readLicenseText(dir) ??
          `Licensed under ${license}.\nSee ${repository} for the full license text.`,
      }
    })
}

// Info ページ用に、依存パッケージとライセンスをビルド時に package.json / node_modules から生成する
const packageInfoModuleId = "virtual:package-info"
const packageInfoPlugin = {
  name: "package-info",
  resolveId(id: string) {
    if (id === packageInfoModuleId) return `\0${packageInfoModuleId}`
  },
  load(id: string) {
    if (id !== `\0${packageInfoModuleId}`) return
    const toList = (deps: Record<string, string>) =>
      Object.entries(deps).map(([name, version]) => ({ name, version }))
    return [
      `export const dependencies = ${JSON.stringify(toList(dependencies))}`,
      `export const devDependencies = ${JSON.stringify(toList(devDependencies))}`,
      `export const licenses = ${JSON.stringify(collectLicenses())}`,
    ].join("\n")
  },
}

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
    packageInfoPlugin,
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
