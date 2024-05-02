"use client"

import { useCronitor } from "@cronitorio/cronitor-rum-nextjs"
import { Suspense } from "react"

export default function CronitorComponent() {
    return (
        <Suspense fallback={<div></div>}>
            {/*useCronitor("4410eee32ce40188fe66d5acfe73c8c5")*/}
        </Suspense>
    )
}
