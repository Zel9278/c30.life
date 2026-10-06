<script setup lang="ts">
import {
  goneServerNote,
  type ServerStatus,
  serverSections,
  serverStatusLabels,
  serverStatusOrder,
  serversPage,
  serverTableHeaders,
  softwares,
} from "../data/servers.ts"

const statusColors: Record<ServerStatus, string> = {
  gone: "text-red-500",
  active: "text-green-500",
  unknown: "text-gray-500",
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        {{ serversPage.title }}
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        {{ serversPage.subtitle }}
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 mb-4 text-sm">
        <span
          v-for="status in serverStatusOrder"
          :key="status"
          :class="statusColors[status]"
          >● {{ serverStatusLabels[status] }}</span
        >
      </div>

      <!-- 大型鯖 / 個人鯖 / 提供鯖 -->
      <template
        v-for="(section, sectionIndex) in serverSections"
        :key="section.heading"
      >
        <h2 class="text-lg font-semibold text-white mb-2">
          {{ section.heading }}
        </h2>
        <div
          :class="
            sectionIndex < serverSections.length - 1
              ? 'overflow-x-auto mb-6'
              : 'overflow-x-auto'
          "
        >
          <table class="w-full text-sm">
            <thead class="bg-neutral-800 text-neutral-200">
              <tr>
                <th
                  v-for="header in serverTableHeaders"
                  :key="header"
                  class="py-2 px-3 text-left"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="server in section.servers"
                :key="server.url"
                class="border-b border-neutral-700"
                :class="statusColors[server.status]"
              >
                <td class="py-2 px-3">{{ server.name }}</td>
                <td class="py-2 px-3">
                  <template v-if="server.status === 'gone'">
                    {{ server.url }} {{ goneServerNote }}
                  </template>
                  <a
                    v-else
                    :href="server.url"
                    target="_blank"
                    class="underline hover:text-sky-400"
                  >
                    {{ server.url }}
                  </a>
                </td>
                <td class="py-2 px-3">
                  <a
                    :href="softwares[server.software]"
                    target="_blank"
                    class="underline hover:text-sky-400"
                  >
                    {{ server.software }}
                  </a>
                </td>
                <td class="py-2 px-3">{{ server.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </section>
</template>
