'use client'

import { useCallback, useRef, useState } from 'react'
import { useAudio, ensureAudioCtx } from '@/hooks/useAudio'
import { cn } from '@/lib/utils'

const STACK = ['Figma', 'React', 'SwiftUI', 'Claude Code'] as const

// Rotation for stacked state: alternating tilts
const ROTATIONS = ['-2.5deg', '2deg', '-1.5deg', '2.5deg']

export function StackCards() {
  const { soundOn } = useAudio()
  const [fanned, setFanned] = useState(false)

  // Audio refs for shuffle sound
  const srcRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const playShuffleSound = useCallback(() => {
    if (!soundOn) return
    try {
      const ctx = ensureAudioCtx()

      // Stop any existing sound
      stopShuffleSound()

      const t = ctx.currentTime
      const dur = 0.25
      const bufLen = Math.ceil(ctx.sampleRate * dur)
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) {
        const p = i / bufLen
        const env = Math.sin(p * Math.PI) * Math.pow(1 - p, 0.6)
        d[i] = (Math.random() * 2 - 1) * env
      }

      const src = ctx.createBufferSource()
      src.buffer = buf
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.Q.value = 0.7
      bp.frequency.setValueAtTime(1000, t)
      bp.frequency.linearRampToValueAtTime(3200, t + dur)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur)

      src.connect(bp)
      bp.connect(gain)
      gain.connect(ctx.destination)
      src.start(t)
      src.stop(t + dur)

      srcRef.current = src
      gainRef.current = gain
      src.onended = () => {
        srcRef.current = null
        gainRef.current = null
      }
    } catch {
      // Audio unavailable
    }
  }, [soundOn])

  const stopShuffleSound = useCallback(() => {
    if (!srcRef.current && !gainRef.current) return
    let ctx: AudioContext
    try { ctx = ensureAudioCtx() } catch { return }
    try {
      if (gainRef.current) {
        gainRef.current.gain.cancelScheduledValues(ctx.currentTime)
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime)
        gainRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)
      }
      if (srcRef.current) {
        srcRef.current.stop(ctx.currentTime + 0.03)
      }
    } catch {
      // ignore
    }
    srcRef.current = null
    gainRef.current = null
  }, [])

  return (
    <span
      className="flex items-center pl-1"
      onMouseEnter={() => {
        setFanned(true)
        playShuffleSound()
      }}
      onMouseLeave={() => {
        setFanned(false)
        stopShuffleSound()
      }}
      onTouchStart={() => {
        setFanned((prev) => {
          const next = !prev
          if (next) playShuffleSound()
          else stopShuffleSound()
          return next
        })
      }}
    >
      {STACK.map((name, idx) => (
        <span
          key={name}
          className={cn(
            'py-2 px-3 rounded-xl',
            'font-mono text-[12px] font-semibold tracking-[0.04em] uppercase',
            'text-text-secondary whitespace-nowrap relative cursor-default',
          )}
          style={{
            background: 'linear-gradient(180deg, #F0EDE8 0%, #E8E5E0 100%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 0 0 #D4D0CA',
            zIndex: 4 - idx,
            marginLeft: fanned
              ? idx === 0 ? 0 : 4
              : idx === 0 ? 0 : -18,
            transform: fanned ? 'rotate(0deg)' : `rotate(${ROTATIONS[idx]})`,
            transition:
              'transform 0.25s cubic-bezier(0.32,0.72,0,1), margin 0.25s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          {name}
        </span>
      ))}
    </span>
  )
}
