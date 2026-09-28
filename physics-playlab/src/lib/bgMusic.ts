let _ctx: AudioContext | null = null
let master: GainNode | null = null
let drones: OscillatorNode[] = []
let seqTimer: ReturnType<typeof setTimeout> | null = null
let running = false
let seqStep = 0

// Pentatonic C major — always sounds pleasant
const PENTATONIC = [130, 146, 164, 196, 220, 261, 293, 329, 392, 440, 523]

// Melody as pentatonic indices (0=C3 … 10=C5)
const MELODY = [4, 6, 8, 6, 4, 2, 4, 6, 8, 10, 8, 6, 4, 6, 2, 4]
const BASS_NOTES = [0, 0, 2, 0] // low bass pattern

const ac = (): AudioContext => {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

const scheduleNote = (freq: number, time: number, dur: number, vol = 0.045) => {
  const c = ac()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g); g.connect(master!)
  osc.type = 'sine'; osc.frequency.value = freq
  g.gain.setValueAtTime(0, time)
  g.gain.linearRampToValueAtTime(vol, time + 0.08)
  g.gain.setValueAtTime(vol, time + dur - 0.12)
  g.gain.exponentialRampToValueAtTime(0.001, time + dur)
  osc.start(time); osc.stop(time + dur + 0.05)
}

const tick = () => {
  if (!running || !master) return
  const c = ac(); const now = c.currentTime
  const STEP = 0.72 // seconds per note

  for (let i = 0; i < 4; i++) {
    const t = now + i * STEP
    const mi = (seqStep + i) % MELODY.length
    const bi = (seqStep + i) % BASS_NOTES.length
    scheduleNote(PENTATONIC[MELODY[mi]], t, STEP * 0.85, 0.042)
    scheduleNote(PENTATONIC[BASS_NOTES[bi]], t, STEP * 1.6, 0.055)
  }
  seqStep = (seqStep + 4) % MELODY.length
  seqTimer = setTimeout(tick, STEP * 4 * 1000 - 80)
}

export const startBgMusic = () => {
  if (running) return
  running = true; seqStep = 0
  const c = ac()
  master = c.createGain(); master.gain.value = 0.55; master.connect(c.destination)

  // Soft bass drone
  const drone = c.createOscillator()
  const dg = c.createGain()
  drone.connect(dg); dg.connect(master)
  drone.type = 'sine'; drone.frequency.value = 65
  dg.gain.setValueAtTime(0, c.currentTime)
  dg.gain.linearRampToValueAtTime(0.06, c.currentTime + 1.5)
  drone.start(); drones.push(drone)

  tick()
}

export const stopBgMusic = () => {
  running = false
  if (seqTimer) { clearTimeout(seqTimer); seqTimer = null }
  drones.forEach(d => { try { d.stop() } catch {} }); drones = []
  if (master) { master.disconnect(); master = null }
}

export const isBgMusicPlaying = () => running
