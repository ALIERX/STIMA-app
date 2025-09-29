import React, { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, ResponsiveContainer } from 'recharts'
import { motion, useAnimation } from 'framer-motion'
import { CATEGORIES } from '../../core/state'
import { fmtEUR } from '../../core/utils'
import { useSound } from '../../core/sound.js'

/**
 * HeroDonut — pulsing donut with particles + counters
 */
export default function HeroDonut({ state }) {
  const { blip } = useSound()
  const [activeIndex, setActiveIndex] = useState(null)

  // Animate heartbeat
  const controls = useAnimation()
  useEffect(() => {
    controls.start({
      scale: [1, 1.04, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    })
  }, [controls])

  // Compute category series
  const categorySeries = useMemo(() => {
    const map = new Map(CATEGORIES.map(c => [c.id, 0]))
    state.assets.filter(a => a.verified).forEach(a => {
      const last = a.history[a.history.length - 1]
      const v = last ? last.display : a.declaredValueEUR
      map.set(a.category, (map.get(a.category) || 0) + v)
    })
    return CATEGORIES.map(c => ({ name: c.label, key: c.id, value: map.get(c.id) || 0 }))
  }, [state.assets])

  const totalReserve = categorySeries.reduce((s, d) => s + d.value, 0)
  const minted = state.token.totalSupply
  const nav = state.token.navPerToken || 1
  const potential = Math.max(0, (totalReserve / Math.max(1, nav)) - minted)

  // Particles positions (static random)
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      radius: 120 + Math.random() * 60,
      size: 2 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.3
    }))
  )
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const int = setInterval(() => setTick(t => t + 1), 50)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="relative w-full h-[420px] flex items-center justify-center">
      {/* Particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {particles.map(p => {
          const angle = (p.angle + tick * p.speed) % 360
          const rad = (angle * Math.PI) / 180
          const x = 210 + p.radius * Math.cos(rad)
          const y = 210 + p.radius * Math.sin(rad)
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={p.size}
              fill="rgba(255,255,255,0.8)"
            />
          )
        })}
      </svg>

      {/* Donut with heartbeat */}
      <motion.div
        animate={controls}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => blip()}
        className="relative w-[360px] h-[360px] rounded-full flex items-center justify-center"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categorySeries}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={110}
              outerRadius={150}
              activeIndex={activeIndex}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 to-emerald-400/30 blur-3xl animate-pulse" />

        {/* Center counters */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-slate-500">Minted</div>
          <div className="text-2xl font-bold">{minted.toFixed(2)} STIMA</div>
          <div className="mt-2 text-xs text-slate-500">Processing</div>
          <div className="text-lg font-semibold">{potential.toFixed(2)} STIMA</div>
          <div className="mt-2 text-xs text-slate-500">Reserve: {fmtEUR(totalReserve)}</div>
        </div>
      </motion.div>
    </div>
  )
}
