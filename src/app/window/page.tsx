"use client"

import { Window } from "@/components/window"
import { useState, useEffect } from "react"

export default function Home() {
    const [windows, setWindows] = useState<JSX.Element[]>([])
    const [count, setCount] = useState(0)
    const [isWindowDVD, setIsWindowDVD] = useState(false)
    const [isWindowClose, setIsWindowClose] = useState(false)
    const [isBlur, setIsBlur] = useState(false)
    const [title, setTitle] = useState<string | null>(null)
    const [text, setText] = useState<string | null>(null)

    return (
        <>
            <main>
                <div>{windows}</div>
                <h1>Windows: {count}</h1>
                <div className="form-control flex flex-row">
                    <label className="label cursor-pointer">
                        <span className="label-text mr-4">
                            use DVD Animation for new window
                        </span>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            onClick={(evt) => {
                                const checked = (evt.target as HTMLInputElement)
                                    .checked
                                if (checked) {
                                    setIsWindowDVD(true)
                                } else {
                                    setIsWindowDVD(false)
                                }
                            }}
                        />
                    </label>
                </div>
                <div className="form-control flex flex-row">
                    <label className="label cursor-pointer">
                        <span className="label-text mr-4">
                            use CloseWindow for new window
                        </span>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            onClick={(evt) => {
                                const checked = (evt.target as HTMLInputElement)
                                    .checked
                                if (checked) {
                                    setIsWindowClose(true)
                                } else {
                                    setIsWindowClose(false)
                                }
                            }}
                        />
                    </label>
                </div>
                <div className="form-control flex flex-row">
                    <label className="label cursor-pointer">
                        <span className="label-text mr-4">
                            use Blur for new window
                        </span>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            onClick={(evt) => {
                                const checked = (evt.target as HTMLInputElement)
                                    .checked
                                if (checked) {
                                    setIsBlur(true)
                                } else {
                                    setIsBlur(false)
                                }
                            }}
                        />
                    </label>
                </div>
                <input
                    type="text"
                    placeholder="Title here"
                    className="input input-bordered input-accent w-full max-w-xs"
                    onChange={(evt) => {
                        setTitle(evt.target.value)
                    }}
                />
                <input
                    type="text"
                    placeholder="Text Here"
                    className="input input-bordered input-accent w-full max-w-xs"
                    onChange={(evt) => {
                        setText(evt.target.value)
                    }}
                />
                <button
                    className="btn btn-primary"
                    onClick={(evt) => {
                        evt.preventDefault()

                        const rndId = Math.floor(Math.random() * 10000)

                        const closeWindow = () => {
                            if (count > 0) {
                                setCount(count - 1)
                            }
                            console.log("Window Closed")
                            console.log("Window Count: ", count)
                        }

                        const win = (
                            <Window
                                title={title || "Window Test"}
                                id={`WindowTest-${rndId}`}
                                isWindowDVD={isWindowDVD}
                                isClose={isWindowClose}
                                enableBlur={isBlur}
                                key={rndId}
                                onClose={closeWindow}
                            >
                                <p>{text || "Hello?"}</p>
                            </Window>
                        )

                        setWindows([...windows, win])
                        setCount(count + 1)
                    }}
                >
                    Open Window
                </button>
                <button
                    className="btn btn-primary"
                    onClick={(evt) => {
                        evt.preventDefault()

                        for (let i = 0; i < 100; i++) {
                            const rndId = Math.floor(Math.random() * 10000)

                            const closeWindow = () => {
                                if (count > 0) {
                                    setCount(count - 1)
                                }
                                console.log("Window Closed")
                                console.log("Window Count: ", count)
                            }

                            const win = (
                                <Window
                                    title={title || "Window Test"}
                                    id={`WindowTest-${rndId}`}
                                    isWindowDVD={isWindowDVD}
                                    isClose={isWindowClose}
                                    enableBlur={isBlur}
                                    key={rndId}
                                    onClose={closeWindow}
                                >
                                    <p>{text || "Hello?"}</p>
                                </Window>
                            )

                            setWindows([...windows, win])
                            setCount(count + 1)
                        }
                    }}
                >
                    Open Window (x100)
                </button>
                <button
                    className="btn btn-error"
                    onClick={(evt) => {
                        evt.preventDefault()

                        const wins = [...windows]
                        wins.shift()
                        setWindows([...wins])
                        if (count > 0) {
                            setCount(count - 1)
                        }
                    }}
                >
                    Close Window
                </button>
            </main>
        </>
    )
}
