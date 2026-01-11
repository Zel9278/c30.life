<script setup lang="ts">
import { ref } from "vue"
import { RouterLink, useRoute } from "vue-router"

const route = useRoute()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const isActive = (path: string) => {
  if (path === "/") {
    return route.path === "/"
  }
  return route.path.startsWith(path)
}

const menuItems = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/links", label: "Links", icon: "link" },
  { to: "/blog", label: "Blog", icon: "document" },
  { to: "/environments", label: "Environments", icon: "pc" },
  { to: "/servers", label: "Servers", icon: "server" },
  { to: "/pubkeys", label: "Pubkeys", icon: "key" },
  { to: "/watched-animes", label: "Animes", icon: "film" },
  { to: "/timeline", label: "Timeline", icon: "clock" },
  { to: "/misskey", label: "Misskey", icon: "misskey" },
  { to: "/mastodon", label: "Mastodon", icon: "mastodon" },
  { to: "/info", label: "Info", icon: "info" },
]
</script>

<template>
  <!-- Header -->
  <header
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-neutral-900/80 border-b border-neutral-800"
  >
    <div
      class="max-w-4xl lg:max-w-6xl xl:max-w-full xl:px-8 mx-auto px-4 h-14 flex items-center justify-between"
    >
      <!-- Logo -->
      <RouterLink
        to="/"
        class="text-lg font-bold text-white hover:text-neutral-300 transition-colors"
        @click="closeMenu"
      >
        c30.life
      </RouterLink>

      <!-- Hamburger Button -->
      <button
        type="button"
        class="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
        :aria-expanded="isOpen"
        aria-label="Menu"
        @click="toggleMenu"
      >
        <div class="w-5 h-4 flex flex-col justify-between">
          <span
            class="w-full h-0.5 bg-white rounded transition-all duration-300 origin-center"
            :class="isOpen ? 'rotate-45 translate-y-[7px]' : ''"
          />
          <span
            class="w-full h-0.5 bg-white rounded transition-all duration-300"
            :class="isOpen ? 'opacity-0 scale-0' : ''"
          />
          <span
            class="w-full h-0.5 bg-white rounded transition-all duration-300 origin-center"
            :class="isOpen ? '-rotate-45 -translate-y-[7px]' : ''"
          />
        </div>
      </button>
    </div>
  </header>

  <!-- Mobile Menu Overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="closeMenu"
    />
  </Transition>

  <!-- Mobile Menu Panel -->
  <Transition name="slide">
    <nav
      v-if="isOpen"
      class="fixed top-14 right-0 z-50 w-64 h-[calc(100vh-3.5rem)] bg-neutral-900 border-l border-neutral-800 shadow-2xl"
    >
      <ul class="p-4 space-y-2">
        <li v-for="item in menuItems" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            :class="
              isActive(item.to)
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            "
            @click="closeMenu"
          >
            <!-- Home -->
            <svg
              v-if="item.icon === 'home'"
              class="w-5 h-5"
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
            <!-- Link -->
            <svg
              v-else-if="item.icon === 'link'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <!-- PC -->
            <svg
              v-else-if="item.icon === 'pc'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <!-- Server -->
            <svg
              v-else-if="item.icon === 'server'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
            <!-- Key -->
            <svg
              v-else-if="item.icon === 'key'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <!-- Film -->
            <svg
              v-else-if="item.icon === 'film'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <!-- Clock -->
            <svg
              v-else-if="item.icon === 'clock'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <!-- Misskey -->
            <svg
              v-else-if="item.icon === 'misskey'"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 160 160"
            >
              <g transform="matrix(0.28948,0,0,0.28948,-54.705,-30.7703)">
                <path
                  d="M256.418,188.976C248.558,188.944 240.758,190.308 233.379,193.013C220.308,197.613 209.533,205.888 201.091,217.802C193.02,229.329 188.977,242.195 188.977,256.409L188.977,508.89C188.977,527.332 195.52,543.29 208.576,556.732C222.032,569.803 237.99,576.331 256.418,576.331C275.259,576.331 291.204,569.803 304.274,556.747C317.73,543.291 324.441,527.332 324.441,508.89L324.441,462.983C324.584,453.04 334.824,455.655 340.01,462.983C349.691,479.76 372.36,494.119 394.193,494.119C416.026,494.119 438.005,482.196 448.375,462.983C452.304,458.354 463.377,450.455 464.52,462.983L464.52,508.89C464.52,527.332 471.047,543.29 484.104,556.732C497.574,569.803 513.511,576.331 531.953,576.331C550.78,576.331 566.739,569.803 579.809,556.747C593.265,543.291 599.977,527.332 599.977,508.89L599.977,256.409C599.977,242.195 595.752,229.329 587.309,217.802C579.224,205.874 568.653,197.613 555.597,193.013C547.912,190.314 540.228,188.976 532.543,188.976C511.788,188.976 494.301,197.046 480.073,213.188L411.636,293.281C410.107,294.438 405.006,303.247 394.178,303.247C383.379,303.247 378.868,294.439 377.325,293.296L308.297,213.188C294.47,197.046 277.173,188.976 256.418,188.976ZM682.904,188.983C666.763,188.983 652.926,194.748 641.404,206.271C630.261,217.413 624.691,231.054 624.691,247.196C624.691,263.338 630.261,277.174 641.404,288.697C652.926,299.839 666.763,305.41 682.904,305.41C699.046,305.41 712.88,299.839 724.412,288.697C735.935,277.174 741.693,263.338 741.693,247.196C741.693,231.054 735.935,217.413 724.412,206.271C712.88,194.748 699.046,188.983 682.904,188.983ZM683.473,316.947C667.331,316.947 653.495,322.713 641.972,334.236C630.449,345.768 624.691,359.602 624.691,375.744L624.691,518.118C624.691,534.259 630.449,548.095 641.972,559.618C653.504,570.761 667.341,576.331 683.473,576.331C699.624,576.331 713.27,570.761 724.412,559.618C735.935,548.095 741.693,534.259 741.693,518.118L741.693,375.744C741.693,359.593 735.935,345.759 724.412,334.236C713.261,322.713 699.614,316.947 683.473,316.947Z"
                />
              </g>
            </svg>
            <!-- Mastodon -->
            <svg
              v-else-if="item.icon === 'mastodon'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"
              />
            </svg>
            <!-- Document -->
            <svg
              v-else-if="item.icon === 'document'"
              class="w-5 h-5"
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
            <!-- Info -->
            <svg
              v-else-if="item.icon === 'info'"
              class="w-5 h-5"
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
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
