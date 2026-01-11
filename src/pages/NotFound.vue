<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import SystemdLoader from "../components/SystemdLoader.vue"

const loader = ref<InstanceType<typeof SystemdLoader> | null>(null)
const route = useRoute()

onMounted(async () => {
  if (!loader.value) return

  // Boot sequence
  loader.value.addLog("ok", "Starting c30.life kernel...")
  await loader.value.delay(300)

  loader.value.addLog("ok", "Mounting virtual filesystem...")
  await loader.value.delay(200)

  loader.value.addLog("ok", "Loading route configuration...")
  await loader.value.delay(250)

  const routeCheck = loader.value.addProgressLog("Verifying requested path...")
  await loader.value.delay(800)
  loader.value.endProgressLog(routeCheck, "fail")

  await loader.value.delay(300)

  loader.value.addLog("fail", "ERROR: Route not found in routing table")
  await loader.value.delay(200)

  loader.value.addLog("fail", "ERROR: Unable to resolve path segment")
  await loader.value.delay(400)

  // Trigger kernel panic
  await loader.value.triggerPanic(
    `Unable to resolve route "${route.path}". Page not found. ` +
      "The requested resource does not exist on this server.",
    "HTTP_404_NOT_FOUND",
  )
})
</script>

<template>
  <div class="fixed inset-0 w-screen h-screen bg-black z-[100] overflow-auto">
    <SystemdLoader ref="loader" app-name="c30.life" version="v404" />
  </div>
</template>
