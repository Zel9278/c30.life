<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const props = defineProps({
  appName: {
    type: String,
    default: "ChatApp",
  },
  version: {
    type: String,
    default: "v1.0",
  },
})

const emit = defineEmits(["complete", "error"])

// Loading state
const loadingLogs = ref([])
const loadingMessage = ref("")
let logIdCounter = 0

// Kernel panic state
const kernelPanic = ref(false)
const panicInfo = ref({
  error: "",
  code: "",
  stack: [],
  registers: {},
})

// Add a log entry
const addLog = (type, message) => {
  const id = ++logIdCounter
  loadingLogs.value.push({ id, type, message, animFrame: 0 })
  return id
}

// Add a progress log with animation
const addProgressLog = (message) => {
  const id = ++logIdCounter
  const log = { id, type: "progress", message, animFrame: 0, intervalId: null }

  // Start animation
  log.intervalId = setInterval(() => {
    const idx = loadingLogs.value.findIndex((l) => l.id === id)
    if (idx !== -1) {
      loadingLogs.value[idx].animFrame =
        (loadingLogs.value[idx].animFrame + 1) % 6
    }
  }, 150)

  loadingLogs.value.push(log)
  return id
}

// End a progress log and set final status
const endProgressLog = (id, type) => {
  const idx = loadingLogs.value.findIndex((l) => l.id === id)
  if (idx !== -1) {
    if (loadingLogs.value[idx].intervalId) {
      clearInterval(loadingLogs.value[idx].intervalId)
    }
    loadingLogs.value[idx].type = type
  }
}

// Set the final loading message
const setMessage = (message) => {
  loadingMessage.value = message
}

// Trigger kernel panic
const triggerPanic = async (errorMessage, errorCode = "FATAL_ERROR") => {
  // Generate fake but realistic-looking data
  const generateHex = (len) => {
    let result = ""
    for (let i = 0; i < len; i++) {
      result += Math.floor(Math.random() * 16).toString(16)
    }
    return result
  }

  const generateAddr = () => "0x" + generateHex(16)

  // Fake stack trace
  const stackFrames = [
    `[<${generateHex(16)}>] panic+0x${generateHex(2)}/${generateHex(3)}`,
    `[<${generateHex(16)}>] c30_homepage_route_resolve+0x${generateHex(2)}/${generateHex(3)}`,
    `[<${generateHex(16)}>] session_manager_init+0x${generateHex(2)}/${generateHex(3)}`,
    `[<${generateHex(16)}>] network_connection_handler+0x${generateHex(2)}/${generateHex(3)}`,
    `[<${generateHex(16)}>] vue_runtime_mount+0x${generateHex(2)}/${generateHex(3)}`,
    `[<${generateHex(16)}>] app_main+0x${generateHex(2)}/${generateHex(3)}`,
    `[<${generateHex(16)}>] __libc_start_main+0x${generateHex(2)}/${generateHex(3)}`,
  ]

  // Fake registers
  const registers = {
    RIP: generateAddr(),
    RSP: generateAddr(),
    RAX: generateAddr(),
    RBX: generateAddr(),
    RCX: generateAddr(),
    RDX: generateAddr(),
    RSI: generateAddr(),
    RDI: generateAddr(),
    RBP: generateAddr(),
    R8: generateAddr(),
    R9: generateAddr(),
    R10: generateAddr(),
    CR2: generateAddr(),
  }

  panicInfo.value = {
    error: errorMessage,
    code: errorCode,
    stack: stackFrames,
    registers: registers,
    pid: Math.floor(Math.random() * 9000) + 1000,
    cpu: Math.floor(Math.random() * 8),
    uptime: Math.floor(Math.random() * 100) + 10,
  }

  kernelPanic.value = true
}

// Get progress animation frame
const getProgressAnim = (frame) => {
  const frames = ["*    ", "**   ", " **  ", "  ** ", "   **", "    *"]
  return frames[frame] || frames[0]
}

// Helper delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// F5 key handler for reboot
const handleKeyDown = (e) => {
  if (e.key === "F5" && kernelPanic.value) {
    e.preventDefault()
    window.location.href = "/"
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown)
})

// Clean up intervals on unmount
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown)
  loadingLogs.value.forEach((log) => {
    if (log.intervalId) {
      clearInterval(log.intervalId)
    }
  })
})

// Expose methods to parent
defineExpose({
  addLog,
  addProgressLog,
  endProgressLog,
  setMessage,
  delay,
  triggerPanic,
})
</script>

<template>
  <!-- Kernel Panic Screen -->
  <div v-if="kernelPanic" class="panic-screen">
    <div class="panic-content">
      <div class="panic-header">
        <span class="panic-icon">☠️</span>
        <span class="panic-title"
          >Kernel panic - not syncing: {{ panicInfo.code }}</span
        >
      </div>

      <div class="panic-message">
        {{ panicInfo.error }}
      </div>

      <div class="panic-info">
        <div class="panic-line">
          CPU: {{ panicInfo.cpu }} PID: {{ panicInfo.pid }} Comm: c30_homepage
          Not tainted
        </div>
        <div class="panic-line">Hardware name: Browser Virtual Machine</div>
        <div class="panic-line">Uptime: {{ panicInfo.uptime }}s</div>
      </div>

      <div class="panic-section">
        <div class="panic-section-title">Call Trace:</div>
        <div
          v-for="(frame, idx) in panicInfo.stack"
          :key="idx"
          class="panic-stack-frame"
        >
          {{ frame }}
        </div>
      </div>

      <div class="panic-section">
        <div class="panic-section-title">Registers:</div>
        <div class="panic-registers">
          <div
            v-for="(value, reg) in panicInfo.registers"
            :key="reg"
            class="panic-register"
          >
            <span class="reg-name">{{ reg }}:</span>
            <span class="reg-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <div class="panic-footer">
        <div class="panic-line">
          ---[ end Kernel panic - not syncing: {{ panicInfo.code }} ]---
        </div>
        <div class="panic-hint">
          <span class="blink">_</span> System halted. Press F5 or
          <a href="/" class="panic-link">click here</a> to reboot.
        </div>
      </div>
    </div>
  </div>

  <!-- Normal Loading Screen -->
  <div v-else class="loading-screen">
    <div class="loading-header">
      <span class="loading-title">{{ appName }}</span>
      <span class="loading-version">{{ version }}</span>
    </div>
    <div class="loading-logs">
      <div v-for="log in loadingLogs" :key="log.id" class="log-row">
        <span class="log-prefix">
          <span class="bracket">[</span>
          <span class="log-status" :class="log.type">{{
            log.type === "progress"
              ? getProgressAnim(log.animFrame)
              : log.type === "ok"
                ? "  OK  "
                : log.type === "failed"
                  ? "FAILED"
                  : " INFO "
          }}</span>
          <span class="bracket">]</span>
        </span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
    <div v-if="loadingMessage" class="loading-message">
      {{ loadingMessage }}
    </div>
  </div>
</template>

<style scoped>
/* Kernel Panic Screen */
.panic-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;
  color: #fff;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  padding: 20px;
  overflow: auto;
}

.panic-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panic-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ff4444;
  font-weight: bold;
  font-size: 14px;
}

.panic-icon {
  font-size: 18px;
}

.panic-title {
  color: #ff4444;
}

.panic-message {
  color: #ffaa00;
  padding: 8px 0;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}

.panic-info {
  color: #aaa;
}

.panic-line {
  color: #888;
  line-height: 1.6;
}

.panic-section {
  margin-top: 8px;
}

.panic-section-title {
  color: #fff;
  margin-bottom: 4px;
}

.panic-stack-frame {
  color: #888;
  padding-left: 8px;
  line-height: 1.5;
}

.panic-registers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 4px 16px;
  padding-left: 8px;
}

.panic-register {
  display: flex;
  gap: 8px;
}

.reg-name {
  color: #6c5ce7;
  min-width: 32px;
}

.reg-value {
  color: #888;
  font-family: monospace;
}

.panic-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #333;
}

.panic-hint {
  margin-top: 16px;
  color: #888;
}

.panic-link {
  color: #6c5ce7;
  text-decoration: underline;
  cursor: pointer;
}

.panic-link:hover {
  color: #a29bfe;
}

.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* Normal Loading Screen */
.loading-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0c0c0c;
  color: #f0f0f0;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  padding: 20px;
  overflow: hidden;
}

.loading-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.loading-title {
  font-size: 18px;
  font-weight: bold;
  color: #6c5ce7;
}

.loading-version {
  color: #888;
  font-size: 12px;
}

.loading-logs {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.log-prefix {
  display: inline-flex;
  font-family: inherit;
}

.bracket {
  color: #888;
}

.log-status {
  display: inline-block;
  width: 6ch;
  text-align: center;
  font-weight: bold;
}

.log-status.ok {
  color: #00ff00;
}

.log-status.failed {
  color: #ff4444;
}

.log-status.info {
  color: #888;
}

.log-status.progress {
  color: #6c5ce7;
}

.log-message {
  color: #f0f0f0;
}

.loading-message {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #333;
  color: #888;
  font-size: 12px;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .loading-screen,
  .panic-screen {
    padding: 16px;
    font-size: 12px;
  }

  .loading-title {
    font-size: 16px;
  }

  .loading-version {
    font-size: 10px;
  }

  .log-row {
    gap: 6px;
  }

  .panic-registers {
    grid-template-columns: 1fr;
  }

  .panic-stack-frame {
    font-size: 10px;
    word-break: break-all;
    white-space: normal;
  }
}
</style>
