'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ensureAudioCtx,
  unlockAudio,
  playKnobClick as engineKnobClick,
  playNoteClick as engineNoteClick,
  playBookClick as engineBookClick,
} from '@/lib/audio-engine'

// ═══ AUDIO CONTEXT PROVIDER & HOOK ═══
// Wraps the app to provide shared audio state (sound on/off) and
// sound-playing functions to any component via useAudio().

interface AudioContextValue {
  soundOn: boolean
  toggleSound: () => void
  playKnobClick: () => void
  playNoteClick: () => void
  playBookClick: () => void
}

const AudioCtx = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState(true)
  const soundOnRef = useRef(true)

  // Keep ref in sync for use inside non-reactive callbacks
  useEffect(() => {
    soundOnRef.current = soundOn
  }, [soundOn])

  // ── iOS audio unlock on first user gesture ──
  useEffect(() => {
    function handleGesture() {
      const ctx = ensureAudioCtx()
      unlockAudio(ctx)
    }

    document.addEventListener('touchstart', handleGesture, { passive: true })
    document.addEventListener('touchend', handleGesture, { passive: true })
    document.addEventListener('click', handleGesture)

    return () => {
      document.removeEventListener('touchstart', handleGesture)
      document.removeEventListener('touchend', handleGesture)
      document.removeEventListener('click', handleGesture)
    }
  }, [])

  const playKnobClick = useCallback(() => {
    const ctx = ensureAudioCtx()
    engineKnobClick(ctx)
  }, [])

  const playNoteClick = useCallback(() => {
    if (!soundOnRef.current) return
    const ctx = ensureAudioCtx()
    engineNoteClick(ctx)
  }, [])

  const playBookClick = useCallback(() => {
    if (!soundOnRef.current) return
    const ctx = ensureAudioCtx()
    engineBookClick(ctx)
  }, [])

  const toggleSound = useCallback(() => {
    // Play knob click on BOTH on and off (matches Astro behavior)
    const ctx = ensureAudioCtx()
    engineKnobClick(ctx)
    setSoundOn((prev) => {
      const next = !prev
      soundOnRef.current = next
      return next
    })
  }, [])

  return (
    <AudioCtx.Provider value={{ soundOn, toggleSound, playKnobClick, playNoteClick, playBookClick }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx)
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return ctx
}

// Re-export for components that need direct AudioContext access (e.g. custom synth sounds)
export { ensureAudioCtx } from '@/lib/audio-engine'
