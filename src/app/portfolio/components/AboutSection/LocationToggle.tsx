'use client'

import { useCallback, useState } from 'react'
import { useAudio, ensureAudioCtx } from '@/hooks/useAudio'

export function LocationToggle() {
  const [isRemote, setIsRemote] = useState(false)
  const { soundOn } = useAudio()

  const playClick = useCallback(() => {
    if (!soundOn) return
    try {
      const ctx = ensureAudioCtx()
      const t = ctx.currentTime
      const bufLen = Math.ceil(ctx.sampleRate * 0.015)
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 3)
      const src = ctx.createBufferSource()
      src.buffer = buf
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 3400
      bp.Q.value = 1.8
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.35, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.025)
      src.connect(bp)
      bp.connect(g)
      g.connect(ctx.destination)
      src.start(t)
      src.stop(t + 0.025)
    } catch { /* Audio unavailable */ }
  }, [soundOn])

  const toggle = useCallback(() => {
    playClick()
    setIsRemote((prev) => !prev)
  }, [playClick])

  return (
    <span className="flex items-center gap-2 text-text-secondary text-[13px]">
      <span
        role="switch"
        aria-checked={isRemote}
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            toggle()
          }
        }}
        className="relative w-[30px] h-[17px] rounded-[12px] cursor-pointer shrink-0"
        style={{
          background: isRemote
            ? 'linear-gradient(180deg, #6050A0 0%, #6B5CA8 100%)'
            : 'linear-gradient(180deg, #DAD7D2 0%, #E2DFDA 100%)',
          boxShadow: isRemote
            ? 'inset 0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.5)'
            : 'inset 0 1px 3px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.5)',
          transition: 'background 0.2s cubic-bezier(0.32,0.72,0,1), box-shadow 0.2s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Knob */}
        <span
          className="absolute top-[2px] left-[2px] w-[13px] h-[13px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #F8F6F3 0%, #E8E5E0 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.08)',
            transform: isRemote ? 'translateX(13px)' : 'translateX(0)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </span>
      <span>{isRemote ? 'Remote' : 'IST and UTC+0'}</span>
    </span>
  )
}
