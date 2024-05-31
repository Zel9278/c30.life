"use client"

import { useEffect, useState, useCallback, use } from "react"

type Props = {
    title: string
    id: string
    isClose?: boolean
    isWindowDVD?: boolean
    children: JSX.Element
}

export function Window({
    title,
    id,
    isClose,
    isWindowDVD,
    children,
}: Props): JSX.Element {
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
    const [windowElement, setWindowElement] = useState<HTMLElement | null>(null)
    const [parentElement, setParentElement] = useState<HTMLElement | null>(null)
    const [bottomSize, setBottomSize] = useState(64)

    useEffect(() => {
        const element = document.getElementById(`window-${id}`)
        if (element) {
            setWindowElement(element)
        }

        const parent = element?.parentElement
        if (parent) {
            setParentElement(parent)

            const elementIndexOf = Array.prototype.indexOf.call(
                parent.children,
                element,
            )

            const x = elementIndexOf * 20
            const y = elementIndexOf * 20

            console.log(x, y)

            setPosition({
                x,
                y,
            })
        }

        return () => {
            setWindowElement(null)
            setParentElement(null)
        }
    }, [id])

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            event.preventDefault()

            let x = event.clientX - startPosition.x
            let y = event.clientY - startPosition.y

            if (x < 0) {
                x = 0
            } else if (x + windowElement!.offsetWidth > window.innerWidth) {
                x = window.innerWidth - windowElement!.offsetWidth
            }

            if (y < 0) {
                y = 0
            } else if (
                y + windowElement!.offsetHeight >
                window.innerHeight - bottomSize
            ) {
                y =
                    window.innerHeight -
                    windowElement!.offsetHeight -
                    bottomSize
            }

            setPosition({
                x,
                y,
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        const handleTouchMove = (event: TouchEvent) => {
            event.preventDefault()

            const touch = event.touches[0]

            let x = touch.clientX - startPosition.x
            let y = touch.clientY - startPosition.y

            if (x < 0) {
                x = 0
            } else if (x + windowElement!.offsetWidth > window.innerWidth) {
                x = window.innerWidth - windowElement!.offsetWidth
            }

            if (y < 0) {
                y = 0
            } else if (
                y + windowElement!.offsetHeight >
                window.innerHeight - bottomSize
            ) {
                y =
                    window.innerHeight -
                    windowElement!.offsetHeight -
                    bottomSize
            }

            setPosition({
                x,
                y,
            })
        }

        const handleTouchEnd = () => {
            setIsDragging(false)
            document.body.style.overscrollBehavior = "auto"
            document.body.style.touchAction = "auto"
            document.documentElement.style.overscrollBehavior = "auto"
            document.documentElement.style.touchAction = "auto"
        }

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleMouseUp)

            window.addEventListener("touchmove", handleTouchMove, {
                passive: false,
            })
            window.addEventListener("touchend", handleTouchEnd, {
                passive: false,
            })

            return () => {
                window.removeEventListener("mousemove", handleMouseMove)
                window.removeEventListener("mouseup", handleMouseUp)

                window.removeEventListener("touchmove", handleTouchMove, false)
                window.removeEventListener("touchend", handleTouchEnd, false)
            }
        }
    }, [
        bottomSize,
        isDragging,
        startPosition.x,
        startPosition.y,
        windowElement,
    ])

    useEffect(() => {
        const resize = (event: Event) => {
            event.preventDefault()

            const width = window.innerWidth
            const height = window.innerHeight

            let x = position.x
            let y = position.y

            if (x + windowElement!.offsetWidth > width) {
                x = width - windowElement!.offsetWidth
            } else if (x < 0) {
                x = 0
            }

            if (y + windowElement!.offsetHeight > height - bottomSize) {
                y = height - windowElement!.offsetHeight - bottomSize
            } else if (y < 0) {
                y = 0
            }

            if (position.x !== x || position.y !== y) {
                setPosition({
                    x,
                    y,
                })
            }
        }

        window.addEventListener("resize", resize)

        return () => {
            window.removeEventListener("resize", resize)
        }
    }, [bottomSize, position.x, position.y, windowElement])

    return (
        <div
            className="fixed z-50 bg-[#00000085] rounded backdrop-blur-sm shadow-[0_0_6px_6px_#1118] border-[#5f8bdd] border-2"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
            }}
            id={`window-${id}`}
            onMouseDown={(event) => {
                event.preventDefault()

                const parent = parentElement

                if (parent) {
                    const windows = parent.children
                    for (let i = 0; i < windows.length; i++) {
                        const window = windows[i] as HTMLElement
                        const baseZIndex = 500
                        const zIndex = parseInt(
                            window.style.zIndex || baseZIndex.toString(),
                        )
                        if (window === windowElement) {
                            window.style.zIndex = (
                                baseZIndex + windows.length
                            ).toString()
                        } else {
                            window.style.zIndex = (zIndex - 1).toString()
                        }
                    }
                }
            }}
            onTouchStart={(event) => {
                event.preventDefault()

                const parent = parentElement

                if (parent) {
                    const windows = parent.children
                    for (let i = 0; i < windows.length; i++) {
                        const window = windows[i] as HTMLElement
                        const baseZIndex = 500
                        const zIndex = parseInt(
                            window.style.zIndex || baseZIndex.toString(),
                        )
                        if (window === windowElement) {
                            window.style.zIndex = (
                                baseZIndex + windows.length
                            ).toString()
                        } else {
                            window.style.zIndex = (zIndex - 1).toString()
                        }
                    }
                }
            }}
        >
            <div
                onMouseDown={(event) => {
                    event.preventDefault()

                    setIsDragging(true)
                    setStartPosition({
                        x: event.clientX - position.x,
                        y: event.clientY - position.y,
                    })
                }}
                onTouchStart={(event) => {
                    event.preventDefault()

                    const touch = event.touches[0]

                    document.body.style.overscrollBehavior = "none"
                    document.body.style.touchAction = "none"
                    document.documentElement.style.overscrollBehavior = "none"
                    document.documentElement.style.touchAction = "none"

                    setIsDragging(true)
                    setStartPosition({
                        x: touch.clientX - position.x,
                        y: touch.clientY - position.y,
                    })
                }}
                className="flex justify-between border-b-[#73474] border-b-2 cursor-move window"
                id={`window-${id}-titlebar`}
            >
                <div className="ml-2">
                    <h1>{title}</h1>
                </div>
                <div>
                    {isClose && (
                        <button
                            className="bg-[#550000] hover:bg-[#ff0000] text-white px-2"
                            onClick={(event) => {
                                event.preventDefault()

                                const parent = parentElement

                                if (parent) {
                                    parent.removeChild(windowElement!)
                                }
                            }}
                        >
                            X
                        </button>
                    )}
                </div>
            </div>
            <div className="p-2">{children}</div>
        </div>
    )
}
