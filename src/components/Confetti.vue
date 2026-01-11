<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import confetti from "canvas-confetti"

// Birthday: April 25
const BIRTHDAY_MONTH = 4
const BIRTHDAY_DAY = 25

let intervalId: number | undefined

function isBirthday(): boolean {
  const today = new Date()
  return (
    today.getMonth() + 1 === BIRTHDAY_MONTH && today.getDate() === BIRTHDAY_DAY
  )
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function startConfetti() {
  const duration = 2 * 1000
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
  }

  intervalId = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = undefined
      }
      return
    }

    const particleCount = 50 * (timeLeft / duration)

    // Fire from left side
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
      }),
    )

    // Fire from right side
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
      }),
    )
  }, 250)
}

onMounted(() => {
  if (isBirthday()) {
    startConfetti()
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = undefined
  }
})
</script>

<template>
  <!-- Confetti is rendered via canvas-confetti, no DOM needed -->
</template>
