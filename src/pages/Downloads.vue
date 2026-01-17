<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

interface FileItem {
  name: string
  key: string
  size: number
  lastModified: string
  type: "file" | "folder"
  children?: FileItem[]
}

const route = useRoute()
const router = useRouter()

const allFiles = ref<FileItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const downloadCounts = ref<Record<string, number>>({})

// Get current path from URL
const currentPath = computed(() => {
  const pathParam = route.params.path
  if (!pathParam) return []
  if (Array.isArray(pathParam)) {
    return pathParam.filter((p) => p)
  }
  return pathParam.split("/").filter((p) => p)
})

async function fetchFiles() {
  loading.value = true
  error.value = null
  try {
    const [filesResponse, countsResponse] = await Promise.all([
      fetch("/api/files/list"),
      fetch("/api/download-counts"),
    ])
    if (!filesResponse.ok) throw new Error("Failed to fetch files")
    const data = (await filesResponse.json()) as { files: FileItem[] }
    allFiles.value = data.files

    if (countsResponse.ok) {
      const countsData = (await countsResponse.json()) as {
        counts: Record<string, number>
      }
      downloadCounts.value = countsData.counts
    }
  } catch (e) {
    error.value = "ファイルの取得に失敗しました"
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Get current directory contents based on path
const currentItems = computed(() => {
  let items = allFiles.value
  for (const folder of currentPath.value) {
    const found =
      items.find((item) => item.name === folder && item.type === "folder") ||
      items.find(
        (item) => decodeName(item.name) === folder && item.type === "folder",
      )
    if (found?.children) {
      items = found.children
    } else {
      return null // Path not found
    }
  }
  return items
})

// Check if path is valid and redirect to 404 if not
const isPathValid = computed(() => {
  if (loading.value || allFiles.value.length === 0) return true
  if (currentPath.value.length === 0) return true
  return currentItems.value !== null
})

watch(isPathValid, (valid) => {
  if (!valid) {
    router.replace({ name: "NotFound" })
  }
})

function navigateToFolder(folderName: string) {
  const decoded = decodeName(folderName)
  const newPath = [...currentPath.value, decoded].join("/")
  router.push(`/downloads/${newPath}`)
}

function navigateToPath(index: number) {
  // -1 means root
  if (index === -1) {
    router.push("/downloads")
  } else {
    const newPath = currentPath.value.slice(0, index + 1).join("/")
    router.push(`/downloads/${newPath}`)
  }
}

function goUp() {
  if (currentPath.value.length > 0) {
    const newPath = currentPath.value.slice(0, -1).join("/")
    router.push(newPath ? `/downloads/${newPath}` : "/downloads")
  }
}

async function downloadFile(key: string) {
  window.open(`https://fs.c30.life/${key}`, "_blank")

  // Increment download count
  try {
    const response = await fetch("/api/download-counts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
    if (response.ok) {
      const data = (await response.json()) as { count: number }
      downloadCounts.value[key] = data.count
    }
  } catch (e) {
    console.error("Failed to increment download count:", e)
  }
}

function getDownloadCount(key: string): number {
  return downloadCounts.value[key] ?? 0
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "-"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function decodeName(name: string): string {
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

function getFileIconType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || ""
  const types: Record<string, string> = {
    // Images
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    webp: "image",
    svg: "image",
    ico: "image",
    bmp: "image",
    // Documents
    pdf: "pdf",
    doc: "document",
    docx: "document",
    txt: "text",
    md: "text",
    rtf: "document",
    // Archives
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    tar: "archive",
    gz: "archive",
    xz: "archive",
    // Code
    js: "code",
    ts: "code",
    py: "code",
    rs: "code",
    c: "code",
    cpp: "code",
    h: "code",
    java: "code",
    go: "code",
    rb: "code",
    php: "code",
    html: "code",
    css: "code",
    scss: "code",
    vue: "code",
    jsx: "code",
    tsx: "code",
    // Audio
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    flac: "audio",
    aac: "audio",
    m4a: "audio",
    // Video
    mp4: "video",
    mkv: "video",
    avi: "video",
    webm: "video",
    mov: "video",
    wmv: "video",
    // Data
    json: "data",
    xml: "data",
    yaml: "data",
    yml: "data",
    csv: "data",
    sql: "data",
    // Executable
    exe: "executable",
    msi: "executable",
    dmg: "executable",
    app: "executable",
    deb: "executable",
    rpm: "executable",
  }
  return types[ext] || "file"
}

onMounted(fetchFiles)
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Downloads</h1>
      <p class="text-neutral-400 text-sm mb-4">公開ファイルのダウンロード</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Breadcrumb Navigation -->
      <div
        class="flex items-center gap-1 mb-4 px-3 py-2 bg-neutral-800/50 rounded-lg overflow-x-auto"
      >
        <button
          class="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-700 transition-colors text-neutral-300 hover:text-white shrink-0"
          @click="navigateToPath(-1)"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span class="text-sm font-medium">Root</span>
        </button>

        <template v-for="(folder, index) in currentPath" :key="index">
          <span class="text-neutral-600 shrink-0">/</span>
          <button
            class="px-2 py-1 rounded hover:bg-neutral-700 transition-colors text-neutral-300 hover:text-white text-sm shrink-0"
            @click="navigateToPath(index)"
          >
            {{ decodeName(folder) }}
          </button>
        </template>
      </div>

      <!-- Info Section -->
      <div
        class="mb-4 p-4 bg-neutral-800/30 rounded-xl border border-neutral-700"
      >
        <h3 class="text-white font-semibold mb-2 flex items-center gap-2">
          <svg
            class="w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          利用について
        </h3>
        <p class="text-neutral-400 text-sm">
          ここで公開しているファイルは自由にダウンロードして使用できます。<br />
          再配布はおやめください。<br />
          The files published here are free to download and use. <br />
          Please do not redistribute them.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-600 border-t-white"
        />
        <p class="text-neutral-400 mt-4">読み込み中...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-center py-12 bg-red-900/20 rounded-xl border border-red-800"
      >
        <p class="text-red-400">{{ error }}</p>
        <button
          class="mt-4 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          @click="fetchFiles"
        >
          再試行
        </button>
      </div>

      <!-- File List -->
      <div
        v-else-if="
          currentItems && (currentItems.length > 0 || currentPath.length > 0)
        "
        class="border border-neutral-700 rounded-lg overflow-hidden"
      >
        <!-- Table Header -->
        <div
          class="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_60px_80px] md:grid-cols-[1fr_60px_100px_160px] bg-neutral-800 text-neutral-400 text-xs uppercase tracking-wider"
        >
          <div class="px-3 sm:px-4 py-3 font-medium">Name</div>
          <div class="px-3 sm:px-4 py-3 font-medium text-right hidden sm:block">
            DLs
          </div>
          <div class="px-3 sm:px-4 py-3 font-medium text-right">Size</div>
          <div class="px-3 sm:px-4 py-3 font-medium text-right hidden md:block">
            Modified
          </div>
        </div>

        <!-- Back Button (if in subfolder) -->
        <button
          v-if="currentPath.length > 0"
          class="w-full grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_60px_80px] md:grid-cols-[1fr_60px_100px_160px] hover:bg-neutral-800/50 transition-colors border-t border-neutral-700/50 text-left"
          @click="goUp"
        >
          <div class="px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
            <!-- Up Arrow Icon -->
            <svg
              class="w-5 h-5 text-neutral-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10l9-9m0 0l9 9m-9-9v18"
              />
            </svg>
            <span class="text-neutral-300 font-medium">..</span>
          </div>
          <div
            class="px-3 sm:px-4 py-3 text-right text-neutral-500 hidden sm:block"
          >
            -
          </div>
          <div class="px-3 sm:px-4 py-3 text-right text-neutral-500">-</div>
          <div
            class="px-3 sm:px-4 py-3 text-right text-neutral-500 hidden md:block"
          >
            -
          </div>
        </button>

        <!-- Items -->
        <template v-for="item in currentItems" :key="item.key">
          <!-- Folder -->
          <button
            v-if="item.type === 'folder'"
            class="w-full grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_60px_80px] md:grid-cols-[1fr_60px_100px_160px] hover:bg-neutral-800/50 transition-colors border-t border-neutral-700/50 text-left"
            @click="navigateToFolder(item.name)"
          >
            <div
              class="px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 min-w-0"
            >
              <!-- Folder Icon -->
              <svg
                class="w-5 h-5 text-yellow-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"
                />
              </svg>
              <span
                class="text-white font-medium truncate text-sm sm:text-base"
                >{{ decodeName(item.name) }}</span
              >
            </div>
            <div
              class="px-3 sm:px-4 py-3 text-right text-neutral-500 text-sm hidden sm:block"
            >
              -
            </div>
            <div class="px-3 sm:px-4 py-3 text-right text-neutral-500 text-sm">
              -
            </div>
            <div
              class="px-3 sm:px-4 py-3 text-right text-neutral-500 text-sm hidden md:block"
            >
              -
            </div>
          </button>

          <!-- File -->
          <div
            v-else
            class="grid grid-cols-[1fr_70px] sm:grid-cols-[1fr_60px_80px] md:grid-cols-[1fr_60px_100px_160px] hover:bg-neutral-800/50 transition-colors border-t border-neutral-700/50 group"
          >
            <div class="px-4 py-3 flex items-center gap-3 min-w-0">
              <!-- File Icons by type -->
              <!-- Image -->
              <svg
                v-if="getFileIconType(item.name) === 'image'"
                class="w-5 h-5 text-green-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <!-- PDF -->
              <svg
                v-else-if="getFileIconType(item.name) === 'pdf'"
                class="w-5 h-5 text-red-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <!-- Document -->
              <svg
                v-else-if="getFileIconType(item.name) === 'document'"
                class="w-5 h-5 text-blue-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <!-- Text -->
              <svg
                v-else-if="getFileIconType(item.name) === 'text'"
                class="w-5 h-5 text-neutral-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <!-- Archive -->
              <svg
                v-else-if="getFileIconType(item.name) === 'archive'"
                class="w-5 h-5 text-amber-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <!-- Code -->
              <svg
                v-else-if="getFileIconType(item.name) === 'code'"
                class="w-5 h-5 text-purple-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <!-- Audio -->
              <svg
                v-else-if="getFileIconType(item.name) === 'audio'"
                class="w-5 h-5 text-pink-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <!-- Video -->
              <svg
                v-else-if="getFileIconType(item.name) === 'video'"
                class="w-5 h-5 text-cyan-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <!-- Data -->
              <svg
                v-else-if="getFileIconType(item.name) === 'data'"
                class="w-5 h-5 text-orange-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
              <!-- Executable -->
              <svg
                v-else-if="getFileIconType(item.name) === 'executable'"
                class="w-5 h-5 text-emerald-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <!-- Default File -->
              <svg
                v-else
                class="w-5 h-5 text-neutral-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span class="text-white truncate text-sm sm:text-base">{{
                decodeName(item.name)
              }}</span>
              <button
                class="p-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0 ml-auto"
                title="ダウンロード"
                @click="downloadFile(item.key)"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
            <div
              class="px-3 sm:px-4 py-3 text-right text-neutral-400 text-xs sm:text-sm hidden sm:block"
              :title="`${getDownloadCount(item.key)} downloads`"
            >
              {{ getDownloadCount(item.key) }}
            </div>
            <div
              class="px-3 sm:px-4 py-3 text-right text-neutral-400 text-xs sm:text-sm"
            >
              {{ formatSize(item.size) }}
            </div>
            <div
              class="px-3 sm:px-4 py-3 text-right text-neutral-500 text-sm hidden md:block"
            >
              {{ formatDate(item.lastModified) }}
            </div>
          </div>
        </template>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 bg-neutral-800/30 rounded-xl border border-neutral-700"
      >
        <svg
          class="w-12 h-12 text-neutral-500 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <p class="text-neutral-400">このフォルダは空です</p>
      </div>
    </div>
  </section>
</template>
