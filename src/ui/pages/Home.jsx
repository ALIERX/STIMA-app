import React, { useMemo, useState, useEffect } from 'react'
import { Card } from '../components.jsx'
import { PieChart, Pie, Sector, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts'
import { CATEGORIES } from '../../core/state'
import { fmtEUR, todayISO } from '../../core/utils'
import Ticker from '../widgets/Ticker.jsx'
import BlockchainLive from '../widgets/BlockchainLive.jsx'
import NewsGrid from '../widgets/NewsGrid.jsx'
import { motion, useAnimation } from 'framer-motion'

/**
 * STIMA — Home (WOW edition, EN)
 * - Hero with pulsing donut (interactive) + token counters
 * - Wall Street–style scrolling ticker with category momentum
 * - Bento grid: Weekly Momentum, Category Heat, Liquidity Simulator
 * - Blockchain Live feed (animated)
 * - News/Insights cards (placeholders)
 * - Tiny synth "blip" on hover/click (no assets needed)
 */

function useBlip() {
  // Tiny WebAudio click/bleep
  return () => {
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
    } catch (e) { /* ignore */ }
  }
}

export default function Home({state}) {
  const blip = useBlip()

  // ===== Compute verified reserves by category =====
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

  // ===== Token counters in the donut =====
  const minted = state.token.totalSupply
  // Potential = (reserve / nav) - minted  (>= 0)
  const nav = state.token.navPerToken || 1
  const potential = Math.max(0, (totalReserve / Math.max(1, nav)) - minted)

  // ===== Weekly mini-series for momentum (fake from history) =====
  const weekly = useMemo(() => {
    // Build a per-category last-7 "index" using asset display history
    const byCat = Object.fromEntries(CATEGORIES.map(c => [c.id, []]))
    const dates = new Set()
    state.assets.forEach(a => {
      a.history.slice(-7).forEach(h => dates.add(h.date))
    })
    const sortedDates = [...dates].sort()
    CATEGORIES.forEach(c => {
      const points = sortedDates.map(d => {
        const sum = state.assets
          .filter(a => a.verified && a.category === c.id)
          .reduce((acc, a) => {
            const hit = a.history.find(h => h.date === d)
            return acc + (hit ? hit.display : 0)
          }, 0)
        return { date: d, value: sum }
      })
      byCat[c.id] = points
    })
    return { dates: sortedDates, byCat }
  }, [state.assets])

  const [activeSlice, setActiveSlice] = useState(null)

  // Pulsing controls
  const controls = useAnimation()
  useEffect(() => {
    controls.start({
      scale: [1, 1.035, 1],
      transition: { duration: 1.75, repeat: Infinity, ease: 'easeInOut' }
    })
  }, [controls])

  const renderActiveShape = (props) => {
    const RAD = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, payload, value } = props
    const sin = Math.sin(-RAD * midAngle)
    const cos = Math.cos(-RAD * midAngle)
    const sx = cx + (outerRadius + 8) * cos
    const sy = cy + (outerRadius + 8) * sin
    const mx = cx + (outerRadius + 18) * cos
    const my = cy + (outerRadius + 18) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 12
    const ey = my
    const ta = cos >= 0 ? 'start' : 'end'
    const total = Math.max(1, totalReserve)
    return (
      <g>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle}/>
        <Sector cx={cx} cy={cy} innerRadius={outerRadius+4} outerRadius={outerRadius+8} startAngle={startAngle} endAngle={endAngle}/>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} fill="none" stroke="#111"/>
        <circle cx={ex} cy={ey} r={2} fill="#111" stroke="none"/>
        <text x={ex + (cos >= 0 ? 6 : -6)} y={ey} textAnchor={ta} className="fill-current text-sm">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 6 : -6)} y={ey+14} textAnchor={ta} className="fill-current text-xs">
          {fmtEUR(value)} · {(value/total*100).toFixed(1)}%
        </text>
      </g>
    )
  }

  // Small helper: generic sparkline renderer
  function Sparkline({ data }) {
    if (!data || data.length < 2) return <div className="h-8"/>
    const compact = data.map(d => ({ x: d.date?.slice(5), y: d.value || 0 }))
    return (
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={compact}>
          <XAxis hide dataKey="x" />
          <YAxis hide domain={['auto', 'auto']} />
          <Line type="monotone" dataKey="y" dot={false} stroke="#111" strokeWidth={1.4} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ====== Wall Street–style ticker ====== */}
      <Card className="p-0 overflow-hidden">
        <Ticker weekly={weekly} />
      </Card>

      {/* ====== Hero: pulsing donut + counters ====== */}
      <Card className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7">
            <motion.div
              animate={controls}
              onMouseEnter={() => { controls.start({ scale: 1.06 }); blip() }}
              onMouseLeave={() => controls.start({ scale: 1 })}
              className="relative h-[360px]"
            >
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeSlice}
                      activeShape={renderActiveShape}
                      data={categorySeries}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={140}
                      onMouseEnter={(_, i) => setActiveSlice(i)}
                      onMouseLeave={() => setActiveSlice(null)}
                      onClick={() => blip()}
                    />
                    <Tooltip formatter={(v) => fmtEUR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Center counters overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="text-xs text-slate-500">Total minted</div>
                <div className="text-2xl font-bold">{minted.toFixed(2)} STIMA</div>
                <div className="mt-2 text-xs text-slate-500">In processing</div>
                <div className="text-lg font-semibold">{potential.toFixed(2)} STIMA</div>
                <div className="mt-3 text-xs text-slate-500">Reserve (verified): <strong>{fmtEUR(totalReserve)}</strong></div>
              </div>
            </motion.div>
          </div>

          {/* Right-side quick facts */}
          <div className="lg:col-span-5 p-4">
            <div className="text-sm text-slate-500">Today — {todayISO()}</div>
            <h2 className="text-xl font-semibold">STIMA Ecosystem Overview</h2>
            <ul className="mt-3 text-sm space-y-2">
              <li>Deterministic daily valuations (idempotent) with hysteresis + TWAP.</li>
              <li>Verified assets contribute to reserve and token NAV.</li>
              <li>10% liquidity autopilot on each mint.</li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categorySeries.map(d => (
                <div key={d.key} className="p-3 rounded-xl border bg-white hover:bg-slate-50">
                  <div className="text-xs text-slate-500">{d.name}</div>
                  <div className="text-sm font-medium">{fmtEUR(d.value)}</div>
                  <div className="mt-1"><Sparkline data={weekly.byCat[d.key]} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ====== Bento grid (modern “wow” layout) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Momentum */}
        <Card className="md:col-span-6">
          <div className="text-sm text-slate-500">Weekly Momentum</div>
          <div className="text-lg font-semibold">Top categories this week</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(c => {
              const arr = weekly.byCat[c.id]
              const latest = arr?.[arr.length - 1]?.value || 0
              const prev = arr?.[arr.length - 2]?.value || 0
              const chg = prev ? (latest - prev) / Math.max(1, prev) : 0
              return (
                <div key={c.id} className="rounded-xl border bg-white p-3">
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className={`text-xs ${chg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {chg >= 0 ? '▲' : '▼'} {(chg * 100).toFixed(2)}%
                  </div>
                  <div className="mt-1"><Sparkline data={arr} /></div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Category Heat */}
        <Card className="md:col-span-3">
          <div className="text-sm text-slate-500">Category Heat</div>
          <div className="text-lg font-semibold">Share of reserve</div>
          <div className="mt-3 space-y-2">
            {categorySeries
              .slice()
              .sort((a,b)=> b.value - a.value)
              .map(d => {
                const pct = totalReserve ? (d.value / totalReserve) * 100 : 0
                return (
                  <div key={d.key}>
                    <div className="flex justify-between text-xs">
                      <span>{d.name}</span><span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#111,#444)' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* Liquidity Simulator */}
        <Card className="md:col-span-3">
          <div className="text-sm text-slate-500">Liquidity Simulator</div>
          <div className="text-lg font-semibold">What if we mint now?</div>
          <Simulator minted={minted} nav={nav} />
        </Card>
      </div>

      {/* ====== Blockchain Live & News ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5">
          <div className="text-sm text-slate-500">Blockchain Live</div>
          <div className="text-lg font-semibold">Recent on-chain events</div>
          <BlockchainLive state={state} />
        </Card>
        <Card className="lg:col-span-7">
          <div className="text-sm text-slate-500">Insights & News</div>
          <div className="text-lg font-semibold">Curated market updates</div>
          <NewsGrid />
        </Card>
      </div>
    </main>
  )
}

/* ===== Liquidity Simulator (mini widget) ===== */
function Simulator({ minted, nav }) {
  const [v, setV] = useState(5000) // EUR
  const mintAmount = v / Math.max(1, nav)
  const lp = v * 0.10
  return (
    <div className="mt-3 text-sm">
      <label className="text-xs text-slate-500">Declared value (€)</label>
      <input type="range" min={500} max={100000} step={500} value={v}
             onChange={e=>setV(Number(e.target.value))}
             className="w-full" />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="p-2 rounded-lg border bg-white">
          <div className="text-xs text-slate-500">Minted (est.)</div>
          <div className="font-medium">{mintAmount.toFixed(2)} STIMA</div>
        </div>
        <div className="p-2 rounded-lg border bg-white">
          <div className="text-xs text-slate-500">LP 10%</div>
          <div className="font-medium">€ {lp.toLocaleString('en-US')}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500">Current NAV/token: <strong>€ {nav.toFixed(4)}</strong> · Minted supply: <strong>{minted.toFixed(2)}</strong></div>
    </div>
  )
}
