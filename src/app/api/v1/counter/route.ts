import { NextResponse } from "next/server"
import Counter from "@/.counter.json"
import { writeFileSync } from "fs"

export async function POST(request: Request) {
    Counter.count++
    writeFileSync("./src/.counter.json", JSON.stringify(Counter, null, 2))

    return NextResponse.json({
        count: Counter.count,
    })
}
