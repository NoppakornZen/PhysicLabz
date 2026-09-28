let _ctx: AudioContext | null = null

const ac = (): AudioContext => {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

const tone = (freq: number, duration: number, peak = 0.16, delay = 0) => {
  const ctx = ac()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'; osc.frequency.value = freq
  const t = ctx.currentTime + delay
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(peak, t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t); osc.stop(t + duration + 0.02)
}

const sweep = (f1: number, f2: number, duration: number, peak = 0.14) => {
  const ctx = ac()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(f1, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(f2, ctx.currentTime + duration)
  gain.gain.setValueAtTime(peak, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(); osc.stop(ctx.currentTime + duration + 0.02)
}

// Soft UI click
export const playClick = () => sweep(520, 280, 0.12, 0.12)

// Barely-there hover tick
export const playHover = () => tone(1100, 0.05, 0.035)

// Correct — ascending chime C5→E5→G5
export const playCorrect = () => [523, 659, 784].forEach((f, i) => tone(f, 0.4, 0.17, i * 0.1))

// Wrong — descending warm thud
export const playWrong = () => sweep(240, 110, 0.38, 0.22)

// Victory arpeggio C4→E4→G4→C5→E5
export const playComplete = () => [261, 329, 392, 523, 659].forEach((f, i) => tone(f, 0.55, 0.15, i * 0.09))

// Lab start — power-up sweep
export const playStart = () => {
  const ctx = ac()
  const osc = ctx.createOscillator(); const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.22)
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
  osc.start(); osc.stop(ctx.currentTime + 0.3)
}

// Lab finish — satisfying double ding A5→C#6
export const playFinish = () => [880, 1109].forEach((f, i) => tone(f, 0.7, 0.14, i * 0.15))

// Panel open — slide up
export const playOpen = () => sweep(380, 620, 0.15, 0.1)

// Panel close — slide down
export const playClose = () => sweep(620, 320, 0.15, 0.1)

// Island select pop
export const playPop = () => {
  const ctx = ac()
  const osc = ctx.createOscillator(); const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(420, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.06)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.18)
  gain.gain.setValueAtTime(0.18, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
  osc.start(); osc.stop(ctx.currentTime + 0.24)
}

// Reset — soft reverse blip
export const playReset = () => sweep(600, 320, 0.2, 0.11)
