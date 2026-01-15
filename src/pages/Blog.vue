<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"

interface BlogPost {
  id: string
  title: string
  date: string
  views: number
  draft?: boolean
}

interface Pagination {
  page: number
  limit: number
  totalPosts: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const route = useRoute()
const router = useRouter()

const posts = ref<BlogPost[]>([])
const pagination = ref<Pagination | null>(null)
const loading = ref(true)
const error = ref(false)
const isEditor = ref(false)
const viewMode = ref<"grid" | "list">("grid")

const currentPage = ref(1)

const fetchPosts = async (page: number) => {
  loading.value = true
  error.value = false

  try {
    // Include drafts if user is editor
    const editKey = localStorage.getItem("blog_edit_key") || ""
    const includeDrafts = isEditor.value ? "&includeDrafts=true" : ""
    const response = await fetch(
      `/api/blog?page=${page}&limit=8${includeDrafts}`,
      {
        headers: editKey ? { "X-Edit-Key": editKey } : {},
      },
    )
    if (!response.ok) throw new Error("Failed to fetch")
    const data = await response.json()
    posts.value = data.posts
    pagination.value = data.pagination
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page === currentPage.value) return
  currentPage.value = page
  router.push({ query: { page: page.toString() } })
  fetchPosts(page)
}

onMounted(() => {
  const pageParam = route.query.page
  currentPage.value = pageParam ? parseInt(pageParam as string, 10) : 1

  // Check if user has edit key stored
  isEditor.value = !!localStorage.getItem("blog_edit_key")

  // Load view mode preference
  const savedViewMode = localStorage.getItem("blog_view_mode")
  if (savedViewMode === "grid" || savedViewMode === "list") {
    viewMode.value = savedViewMode
  }

  // Fetch posts after setting isEditor
  fetchPosts(currentPage.value)
})

watch(
  () => route.query.page,
  (newPage) => {
    const page = newPage ? parseInt(newPage as string, 10) : 1
    if (page !== currentPage.value) {
      currentPage.value = page
      fetchPosts(page)
    }
  },
)

watch(viewMode, (newMode) => {
  localStorage.setItem("blog_view_mode", newMode)
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl md:text-3xl font-bold text-white">Blog</h1>
        <div class="flex items-center gap-2">
          <!-- View mode toggle -->
          <div class="flex bg-neutral-800 rounded-lg p-0.5">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-1.5 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white',
              ]"
              title="グリッド表示"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-1.5 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white',
              ]"
              title="リスト表示"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <RouterLink
            v-if="isEditor"
            to="/blog/new/edit"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
            title="新規作成"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規
          </RouterLink>
          <a
            href="/api/rss"
            target="_blank"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-colors"
            title="RSS Feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"
              />
            </svg>
            RSS
          </a>
        </div>
      </div>
      <p class="text-neutral-400 text-sm mb-4">c30のブログです</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="animate-pulse bg-neutral-800/50 rounded-xl p-4"
        >
          <div class="h-6 bg-neutral-700 rounded w-3/4 mb-2" />
          <div class="h-4 bg-neutral-700 rounded w-1/4" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-400">記事の読み込みに失敗しました</p>
      </div>

      <!-- Empty -->
      <div v-else-if="posts.length === 0" class="text-center py-8">
        <p class="text-neutral-400">まだ記事がありません</p>
      </div>

      <!-- Posts - Grid View -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.id}`"
          class="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 hover:bg-neutral-700/50 transition-colors group"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <h2
              class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors"
            >
              {{ post.title }}
            </h2>
            <span
              v-if="post.draft"
              class="shrink-0 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium"
            >
              下書き
            </span>
          </div>
          <div class="flex items-center gap-3 text-neutral-400 text-sm">
            <span>{{ formatDate(post.date) }}</span>
            <span class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ post.views }}
            </span>
          </div>
        </RouterLink>
      </div>

      <!-- Posts - List View -->
      <div v-else class="space-y-2">
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.id}`"
          class="flex items-center justify-between gap-4 bg-neutral-800/50 border border-neutral-700 rounded-lg px-4 py-3 hover:bg-neutral-700/50 transition-colors group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <h2
              class="text-base font-medium text-white group-hover:text-blue-400 transition-colors truncate"
            >
              {{ post.title }}
            </h2>
            <span
              v-if="post.draft"
              class="shrink-0 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium"
            >
              下書き
            </span>
          </div>
          <div
            class="flex items-center gap-4 text-neutral-400 text-sm shrink-0"
          >
            <span class="hidden sm:inline">{{ formatDate(post.date) }}</span>
            <span class="sm:hidden">{{ post.date }}</span>
            <span class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ post.views }}
            </span>
          </div>
        </RouterLink>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.totalPages > 1"
        class="flex justify-center items-center gap-2 mt-6"
      >
        <button
          :disabled="!pagination.hasPrev"
          class="px-3 py-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
          @click="goToPage(currentPage - 1)"
        >
          ←
        </button>

        <div class="flex gap-1">
          <button
            v-for="page in pagination.totalPages"
            :key="page"
            :class="[
              'px-3 py-2 rounded-lg transition-colors',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700',
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          :disabled="!pagination.hasNext"
          class="px-3 py-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
          @click="goToPage(currentPage + 1)"
        >
          →
        </button>
      </div>

      <!-- Page info -->
      <div v-if="pagination" class="text-center text-neutral-500 text-sm mt-3">
        {{ pagination.totalPosts }}件中
        {{ (currentPage - 1) * pagination.limit + 1 }}-{{
          Math.min(currentPage * pagination.limit, pagination.totalPosts)
        }}件を表示
      </div>
    </div>
  </section>
</template>
