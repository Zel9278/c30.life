import {
    Syrinx,
    EncoderType,
    type SynthesisOption,
} from "@discordjs-japan/om-syrinx"
import { Readable } from "stream"

export async function GET(request: Request): Promise<Response> {
    const syrinx = Syrinx.fromConfig({
        dictionary: "naist-jdic",
        models: ["htsvoice/tohoku-f01-neutral.htsvoice"],
        encoder: { type: EncoderType.Raw },
    })

    const inputText = "鳴管は、鳥類のもつ発声器官。"
    const option: SynthesisOption = {}
    const stream: Readable = syrinx.synthesize(inputText, option)

    // Create WAV header
    const header = new Uint8Array(44)
    const view = new DataView(header.buffer)

    // RIFF identifier
    header.set(new TextEncoder().encode("RIFF"), 0)

    // RIFF chunk size (file size - 8 bytes), initially set to 0
    view.setUint32(4, 0, true)

    // WAVE identifier
    header.set(new TextEncoder().encode("WAVE"), 8)

    // fmt sub-chunk
    header.set(new TextEncoder().encode("fmt "), 12)
    view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true) // NumChannels (1 for mono)
    view.setUint32(24, 48000, true) // SampleRate
    view.setUint32(28, (48000 * 1 * 16) / 8, true) // ByteRate
    view.setUint16(32, (1 * 16) / 8, true) // BlockAlign
    view.setUint16(34, 16, true) // BitsPerSample

    // data sub-chunk
    header.set(new TextEncoder().encode("data"), 36)
    view.setUint32(40, 0, true) // Subchunk2Size (data size), initially set to 0

    let dataSize = 0

    const response = new Response(
        new ReadableStream({
            async start(controller) {
                controller.enqueue(header)
                stream.on("data", (chunk) => {
                    dataSize += chunk.length
                    controller.enqueue(new Uint8Array(chunk.buffer))
                })

                stream.on("end", () => {
                    // Update the sizes in the header
                    view.setUint32(4, 36 + dataSize, true) // RIFF chunk size
                    view.setUint32(40, dataSize, true) // data sub-chunk size

                    // Enqueue the updated header
                    controller.enqueue(header)
                    controller.close()
                })
            },
            cancel() {
                stream.destroy()
            },
        }),
        {
            headers: {
                "Content-Type": "audio/wav",
            },
        },
    )

    return response
}
