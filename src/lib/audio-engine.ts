// ═══ AUDIO ENGINE ═══
// Non-React singleton — manages shared AudioContext, iOS unlock, and sound synthesis.
// Imported by useAudio.ts but contains no React dependencies.

let _actx: AudioContext | null = null
let _audioUnlocked = false

// Lazy-loaded MP3 buffer for note click sound
let _mouseClickRaw: ArrayBuffer | null = null
let _mouseClickBuf: AudioBuffer | null = null
let _decoding: Promise<AudioBuffer> | null = null
let _fetchStarted = false

// ── AudioContext management ──

export function ensureAudioCtx(): AudioContext {
  if (!_actx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    _actx = new AC()
  }
  if (_actx.state === 'suspended') {
    _actx.resume()
  }
  return _actx
}

// ── iOS audio unlock ──
// Plays a silent buffer on first user gesture to fully unlock audio on iOS.

export function unlockAudio(ctx: AudioContext): void {
  if (_audioUnlocked) return
  _audioUnlocked = true
  const buf = ctx.createBuffer(1, 1, ctx.sampleRate)
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(ctx.destination)
  src.start(0)
}

// ── Knob click — brass watch crown toggle sound ──
// Three layered components: brass body resonance, friction grit, detent click.
// Total duration ~50ms.

export function playKnobClick(ctx: AudioContext): void {
  const t = ctx.currentTime

  // 1. Brass body resonance — triangle oscillator sweeping 1800→900Hz
  const ring = ctx.createOscillator()
  ring.type = 'triangle'
  ring.frequency.setValueAtTime(1800, t)
  ring.frequency.exponentialRampToValueAtTime(900, t + 0.04)

  const ringFilter = ctx.createBiquadFilter()
  ringFilter.type = 'bandpass'
  ringFilter.frequency.value = 1400
  ringFilter.Q.value = 4

  const ringGain = ctx.createGain()
  ringGain.gain.setValueAtTime(0.15, t)
  ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)

  ring.connect(ringFilter)
  ringFilter.connect(ringGain)
  ringGain.connect(ctx.destination)
  ring.start(t)
  ring.stop(t + 0.05)

  // 2. Friction grit — generated noise buffer with highpass filter
  const noiseSamples = ctx.sampleRate * 0.025
  const noiseBuf = ctx.createBuffer(1, noiseSamples, ctx.sampleRate)
  const noiseData = noiseBuf.getChannelData(0)
  for (let i = 0; i < noiseSamples; i++) {
    const p = i / noiseSamples
    const env = p < 0.3 ? p / 0.3 : Math.pow(1 - (p - 0.3) / 0.7, 2)
    noiseData[i] = (Math.random() * 2 - 1) * env * 0.5
  }

  const noiseSrc = ctx.createBufferSource()
  noiseSrc.buffer = noiseBuf

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 2000

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 6000

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.16, t)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)

  noiseSrc.connect(highpass)
  highpass.connect(lowpass)
  lowpass.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noiseSrc.start(t)
  noiseSrc.stop(t + 0.03)

  // 3. Detent click — sine oscillator 3200→1600Hz, delayed 20ms
  const detent = ctx.createOscillator()
  detent.type = 'sine'
  detent.frequency.setValueAtTime(3200, t + 0.02)
  detent.frequency.exponentialRampToValueAtTime(1600, t + 0.03)

  const detentGain = ctx.createGain()
  detentGain.gain.setValueAtTime(0, t)
  detentGain.gain.setValueAtTime(0.12, t + 0.02)
  detentGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)

  detent.connect(detentGain)
  detentGain.connect(ctx.destination)
  detent.start(t + 0.02)
  detent.stop(t + 0.035)
}

// ── Note click — lazy-loaded MP3 playback ──
// Fetches /magic-mouse-click.mp3 on first call, decodes to AudioBuffer, caches.

function startFetch(): void {
  if (_fetchStarted) return
  _fetchStarted = true
  fetch('/magic-mouse-click.mp3')
    .then((r) => r.arrayBuffer())
    .then((ab) => {
      _mouseClickRaw = ab
    })
    .catch(() => {
      // Silently fail — sound is non-critical
    })
}

// ── Book click — sine sweep 1200→800Hz, 30ms ──
// Matches Astro's books-section.js sound.

export function playBookClick(ctx: AudioContext): void {
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(1200, t)
  o.frequency.exponentialRampToValueAtTime(800, t + 0.03)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.08, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
  o.connect(g)
  g.connect(ctx.destination)
  o.start(t)
  o.stop(t + 0.04)
}

export async function playNoteClick(ctx: AudioContext): Promise<void> {
  // Kick off fetch if not started yet
  startFetch()

  // Decode on first play, cache for subsequent clicks
  if (!_mouseClickBuf) {
    if (_decoding) {
      _mouseClickBuf = await _decoding
    } else if (_mouseClickRaw) {
      // decodeAudioData consumes the buffer, so we slice
      _decoding = ctx.decodeAudioData(_mouseClickRaw.slice(0))
      _mouseClickBuf = await _decoding
      _mouseClickRaw = null
      _decoding = null
    } else {
      // MP3 not yet fetched — skip this click
      return
    }
  }

  const src = ctx.createBufferSource()
  src.buffer = _mouseClickBuf

  const vol = ctx.createGain()
  vol.gain.value = 0.18

  src.connect(vol)
  vol.connect(ctx.destination)
  src.start()
}
