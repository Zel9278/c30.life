"use client"

import { useEffect, useState } from "react"

// This file is for creating windows with next.js.
// this fire is not multiple windows.
// The window can be moved.

type Props = {
    title: string
    children: JSX.Element
}

export function Window({ title, children }: Props): JSX.Element {
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (event: MouseEvent) => {
                event.preventDefault()
                setPosition({
                    x: event.clientX - startPosition.x,
                    y: event.clientY - startPosition.y,
                })
            }

            const handleMouseUp = () => {
                setIsDragging(false)
            }

            const handleTouchStart = (event: TouchEvent) => {
                event.preventDefault()
                setIsDragging(true)

                const touch = event.touches[0]

                console.log(touch.clientX, touch.clientY)

                setStartPosition({
                    x: touch.clientX - position.x,
                    y: touch.clientY - position.y,
                })
            }

            const handleTouchMove = (event: TouchEvent) => {
                event.preventDefault()

                const touch = event.touches[0]

                setPosition({
                    x: touch.clientX - startPosition.x,
                    y: touch.clientY - startPosition.y,
                })
            }

            const handleTouchEnd = () => {
                setIsDragging(false)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)

            document.addEventListener("touchstart", handleTouchStart, false)
            document.addEventListener("touchmove", handleTouchMove, false)
            document.addEventListener("touchend", handleTouchEnd, false)

            return () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)

                document.removeEventListener(
                    "touchstart",
                    handleTouchStart,
                    false,
                )
                document.removeEventListener(
                    "touchmove",
                    handleTouchMove,
                    false,
                )
                document.removeEventListener("touchend", handleTouchEnd, false)
            }
        }
    }, [isDragging, position.x, position.y, startPosition])

    return (
        <div
            className="fixed z-50 bg-[#00000085] rounded backdrop-blur-sm shadow-lg border-[#5f8bdd] border-2"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
        >
            <div
                onMouseDown={(event) => {
                    setIsDragging(true)
                    setStartPosition({
                        x: event.clientX - position.x,
                        y: event.clientY - position.y,
                    })
                }}
                className="flex border-b-[#73474] border-b-2 cursor-move"
            >
                <h1 className="place-self-end p-1">広告 - {title}</h1>
            </div>
            <div className="p-2">{children}</div>
        </div>
    )
}
