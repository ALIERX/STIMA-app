import React, { createContext, useContext, useMemo, useState } from 'react'

const SoundContext = createContext({ enabled: false, setEnabled: () => {}, blip: () => {} })

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(true)

  const blip = () => {
    if (!enabled) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
      o.connect(g); g.connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.13)
    } catch (e) {}
  }

  const value = useMemo(() => ({ enabled, setEnabled, blip }), [enabled])
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  return useContext(SoundContext)
}
