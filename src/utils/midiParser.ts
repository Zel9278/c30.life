/**
 * Simple MIDI Parser
 * Parses Standard MIDI File (SMF) format
 */

export type MidiNote = {
  note: number // MIDI note number (0-127)
  velocity: number // Note velocity (0-127)
  startTick: number // Start time in ticks
  endTick: number // End time in ticks
  duration: number // Duration in ticks
  channel: number // MIDI channel (0-15)
  track: number // Track index
}

export type MidiHeader = {
  format: number // 0, 1, or 2
  numTracks: number
  ticksPerBeat: number // Resolution (ticks per quarter note)
}

export type MidiTempo = {
  tick: number
  tempo: number // microseconds per beat
  bpm: number
}

export type MidiData = {
  header: MidiHeader
  notes: MidiNote[]
  tempos: MidiTempo[]
  totalTicks: number
  durationMs: number
}

class MidiReader {
  private data: DataView
  private pos: number = 0

  constructor(arrayBuffer: ArrayBuffer) {
    this.data = new DataView(arrayBuffer)
  }

  readUint8(): number {
    return this.data.getUint8(this.pos++)
  }

  readUint16(): number {
    const value = this.data.getUint16(this.pos, false) // big-endian
    this.pos += 2
    return value
  }

  readUint32(): number {
    const value = this.data.getUint32(this.pos, false) // big-endian
    this.pos += 4
    return value
  }

  readBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(this.data.buffer, this.pos, length)
    this.pos += length
    return bytes
  }

  readString(length: number): string {
    const bytes = this.readBytes(length)
    return String.fromCharCode(...bytes)
  }

  // Read variable-length quantity (VLQ)
  readVLQ(): number {
    let value = 0
    let byte: number

    do {
      byte = this.readUint8()
      value = (value << 7) | (byte & 0x7f)
    } while (byte & 0x80)

    return value
  }

  getPosition(): number {
    return this.pos
  }

  setPosition(pos: number): void {
    this.pos = pos
  }

  hasMore(): boolean {
    return this.pos < this.data.byteLength
  }
}

function parseHeader(reader: MidiReader): MidiHeader {
  const chunkType = reader.readString(4)
  if (chunkType !== "MThd") {
    throw new Error(`Invalid MIDI file: expected MThd, got ${chunkType}`)
  }

  const chunkLength = reader.readUint32()
  if (chunkLength !== 6) {
    throw new Error(`Invalid header length: ${chunkLength}`)
  }

  const format = reader.readUint16()
  const numTracks = reader.readUint16()
  const division = reader.readUint16()

  // Check if SMPTE time division is used (we only support ticks per beat)
  if (division & 0x8000) {
    throw new Error("SMPTE time division is not supported")
  }

  return {
    format,
    numTracks,
    ticksPerBeat: division,
  }
}

function parseTrack(
  reader: MidiReader,
  trackIndex: number,
): { notes: MidiNote[]; tempos: MidiTempo[] } {
  const chunkType = reader.readString(4)
  if (chunkType !== "MTrk") {
    throw new Error(`Invalid track chunk: expected MTrk, got ${chunkType}`)
  }

  const chunkLength = reader.readUint32()
  const endPos = reader.getPosition() + chunkLength

  const notes: MidiNote[] = []
  const tempos: MidiTempo[] = []
  const activeNotes: Map<
    string,
    { note: number; velocity: number; startTick: number; channel: number }
  > = new Map()

  let tick = 0
  let runningStatus = 0

  while (reader.getPosition() < endPos) {
    const deltaTime = reader.readVLQ()
    tick += deltaTime

    let statusByte = reader.readUint8()

    // Running status: if high bit is not set, reuse last status
    if (!(statusByte & 0x80)) {
      reader.setPosition(reader.getPosition() - 1)
      statusByte = runningStatus
    } else {
      runningStatus = statusByte
    }

    const messageType = statusByte & 0xf0
    const channel = statusByte & 0x0f

    switch (messageType) {
      case 0x80: {
        // Note Off
        const note = reader.readUint8()
        const velocity = reader.readUint8()
        const key = `${channel}-${note}`
        const activeNote = activeNotes.get(key)

        if (activeNote) {
          notes.push({
            note: activeNote.note,
            velocity: activeNote.velocity,
            startTick: activeNote.startTick,
            endTick: tick,
            duration: tick - activeNote.startTick,
            channel: activeNote.channel,
            track: trackIndex,
          })
          activeNotes.delete(key)
        }
        break
      }

      case 0x90: {
        // Note On
        const note = reader.readUint8()
        const velocity = reader.readUint8()
        const key = `${channel}-${note}`

        if (velocity === 0) {
          // Note On with velocity 0 is equivalent to Note Off
          const activeNote = activeNotes.get(key)
          if (activeNote) {
            notes.push({
              note: activeNote.note,
              velocity: activeNote.velocity,
              startTick: activeNote.startTick,
              endTick: tick,
              duration: tick - activeNote.startTick,
              channel: activeNote.channel,
              track: trackIndex,
            })
            activeNotes.delete(key)
          }
        } else {
          // Close any existing note with the same key
          const existingNote = activeNotes.get(key)
          if (existingNote) {
            notes.push({
              note: existingNote.note,
              velocity: existingNote.velocity,
              startTick: existingNote.startTick,
              endTick: tick,
              duration: tick - existingNote.startTick,
              channel: existingNote.channel,
              track: trackIndex,
            })
          }

          activeNotes.set(key, {
            note,
            velocity,
            startTick: tick,
            channel,
          })
        }
        break
      }

      case 0xa0: {
        // Polyphonic Key Pressure
        reader.readUint8() // note
        reader.readUint8() // pressure
        break
      }

      case 0xb0: {
        // Control Change
        reader.readUint8() // controller
        reader.readUint8() // value
        break
      }

      case 0xc0: {
        // Program Change
        reader.readUint8() // program
        break
      }

      case 0xd0: {
        // Channel Pressure
        reader.readUint8() // pressure
        break
      }

      case 0xe0: {
        // Pitch Bend
        reader.readUint8() // LSB
        reader.readUint8() // MSB
        break
      }

      case 0xf0: {
        // System messages
        if (statusByte === 0xff) {
          // Meta event
          const metaType = reader.readUint8()
          const metaLength = reader.readVLQ()

          if (metaType === 0x51 && metaLength === 3) {
            // Set Tempo
            const tempo =
              (reader.readUint8() << 16) |
              (reader.readUint8() << 8) |
              reader.readUint8()
            tempos.push({
              tick,
              tempo,
              bpm: 60000000 / tempo,
            })
          } else {
            // Skip other meta events
            reader.readBytes(metaLength)
          }
        } else if (statusByte === 0xf0 || statusByte === 0xf7) {
          // SysEx
          const length = reader.readVLQ()
          reader.readBytes(length)
        } else {
          // Other system messages (skip)
          break
        }
        break
      }

      default:
        // Unknown message type
        break
    }
  }

  // Close any remaining active notes
  for (const [key, activeNote] of activeNotes) {
    notes.push({
      note: activeNote.note,
      velocity: activeNote.velocity,
      startTick: activeNote.startTick,
      endTick: tick,
      duration: tick - activeNote.startTick,
      channel: activeNote.channel,
      track: trackIndex,
    })
  }

  return { notes, tempos }
}

function calculateDuration(
  totalTicks: number,
  ticksPerBeat: number,
  tempos: MidiTempo[],
): number {
  if (tempos.length === 0) {
    // Default tempo: 120 BPM = 500000 microseconds per beat
    const defaultTempo = 500000
    return (totalTicks / ticksPerBeat) * (defaultTempo / 1000)
  }

  let durationMs = 0
  let lastTick = 0
  let currentTempo = 500000 // Default tempo

  for (const tempo of tempos) {
    if (tempo.tick > lastTick) {
      const tickDelta = tempo.tick - lastTick
      durationMs += (tickDelta / ticksPerBeat) * (currentTempo / 1000)
    }
    lastTick = tempo.tick
    currentTempo = tempo.tempo
  }

  // Add remaining time after last tempo change
  if (totalTicks > lastTick) {
    const tickDelta = totalTicks - lastTick
    durationMs += (tickDelta / ticksPerBeat) * (currentTempo / 1000)
  }

  return durationMs
}

export function parseMidi(arrayBuffer: ArrayBuffer): MidiData {
  const reader = new MidiReader(arrayBuffer)
  const header = parseHeader(reader)

  const allNotes: MidiNote[] = []
  const allTempos: MidiTempo[] = []

  for (let i = 0; i < header.numTracks; i++) {
    const { notes, tempos } = parseTrack(reader, i)
    allNotes.push(...notes)
    allTempos.push(...tempos)
  }

  // Sort tempos by tick
  allTempos.sort((a, b) => a.tick - b.tick)

  // Sort notes by start tick
  allNotes.sort((a, b) => a.startTick - b.startTick)

  const totalTicks = allNotes.reduce(
    (max, note) => Math.max(max, note.endTick),
    0,
  )

  const durationMs = calculateDuration(
    totalTicks,
    header.ticksPerBeat,
    allTempos,
  )

  return {
    header,
    notes: allNotes,
    tempos: allTempos,
    totalTicks,
    durationMs,
  }
}

export async function loadMidiFromUrl(url: string): Promise<MidiData> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load MIDI file: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return parseMidi(arrayBuffer)
}
