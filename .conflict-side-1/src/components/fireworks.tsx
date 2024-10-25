"use client"

import { ReactNode, useEffect } from "react"
import confetti from "canvas-confetti"

type Props = {
    children?: ReactNode
}

export default function Fireworks(progs: Props) {
    useEffect(() => {
        if (!(new Date().getMonth() + 1 === 4 && new Date().getDate() === 25))
            return
        const duration = 2 * 1000
        const animationEnd = Date.now() + duration
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 0,
        }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: {
                        x: randomInRange(0.1, 0.3),
                        y: Math.random() - 0.2,
                    },
                })
            )
            confetti(
                Object.assign({}, defaults, {
                    particleCount,
                    origin: {
                        x: randomInRange(0.7, 0.9),
                        y: Math.random() - 0.2,
                    },
                })
            )
        }, 250)
    }, [])

    return <></>
}
