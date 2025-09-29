import React, { useMemo, useState, useEffect } from 'react'
import { Card } from '../components.jsx'
import { CATEGORIES } from '../../core/state'
import { fmtEUR, todayISO, hashStr } from '../../core/utils'
import Ticker from '../widgets/Ticker.jsx'
import HeroDonut from '../widgets/HeroDonut.jsx'
import BlockchainLive from '../widgets/BlockchainLive.jsx'
import NewsGrid from '../widgets/NewsGrid.jsx'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip } from 'recharts'
import { HelpCircle, Upload, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

/** Small “?” tooltip */
function InfoTip({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full border text-slate-600 hover:bg-slate-50"
        aria-label="What is this?"
        title={text}
      >
        <HelpCircle size={12}/>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-64 p-2 text-xs bg-white border rounded-lg shadow">
          {text}
        </div>
      )}
    </span>
  )
}

/** Simple modal */
function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded-lg border">Close</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export default function Home({ state }) {
  // ===== Derived data =====
  const byCategory = useMemo(() => {
    const map = new Map(CATEGORIES.map(c => [c.id, 0]))
    state.assets.filter(a => a.verified).forEach(a => {
      const last = a.history[a.history.length - 1]
      const v = last ? last.display : a.declaredValueEUR
      map.set(a.category, (map.get(a.category) || 0) + v)
    })
    return CATEGORIES.map(c => ({ id: c.id, name: c.label, value: map.get(c.id) || 0 }))
  }, [state.assets])

  const totalReserve = byCategory.reduce((s,d)=>s+d.value, 0)
  const minted = state.token.totalSupply
  const nav = state.token.navPerToken || 1

  // Simulated DEX liquidity (placeholder for Uniswap pair)
  const simulatedLiquidityEUR = useMemo(() => {
    const seed = hashStr(todayISO())
    const base = totalReserve * (0.16 + (seed % 7) * 0.01) // ~16–22% of reserve
    const jitter = (seed % 1000) / 1000 * 0.06 // +0–6%
    return Math.round(base * (1 + jitter))
  }, [totalReserve])

  // Weekly per-category series (build from asset histories)
  const weekly = useMemo(() => {
    const m = Object.fromEntries(CATEGORIES.map(c=>[c.id, []]))
    const dates = new Set()
    state.assets.forEach(a => a.history.slice(-7).forEach(h => dates.add(h.date)))
    const sorted = [...dates].sort()
    CATEGORIES.forEach(c => {
      const arr = sorted.map(d => {
        const sum = state.assets
          .filter(a => a.verified && a.category===c.id)
          .reduce((acc,a) => {
            const hit = a.history.find(h=>h.date===d)
            return acc + (hit ? hit.display : 0)
          }, 0)
        return { date: d, value: sum }
      })
      m[c.id] = arr
    })
    return { dates: sorted, byCat: m }
  }, [state.assets])

  // ===== Category DPI modal =====
  const [openModal, setOpenModal] = useState(false)
  const [modalCat, setModalCat] = useState(null)
  const modalData = useMemo(() => {
    if (!modalCat) return []
    const series = weekly.byCat[modalCat] || []
    // Build a normalized DPI (index base 100)
    if (!series.length) return []
    const base = series[0].value || 1
    return series.map((p, i) => ({
      label: p.date?.slice(5) || `D${i}`,
      dpi: base ? (p.value / base) * 100 : 100
    }))
  }, [modalCat, weekly])

  function openCategoryModal(catId) {
    setModalCat(catId)
    setOpenModal(true)
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ===== Ticker ===== */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium">
            Market Ticker
            <InfoTip text="Live-like scrolling view of category momentum with micro sparklines. Data is derived from recent valuation snapshots."/>
          </div>
          <div className="text-xs text-slate-500">Today — {todayISO()}</div>
        </div>
        <Ticker weekly={weekly}/>
      </Card>

      {/* ===== Hero ===== */}
      <Card className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <HeroDonut state={state} />
          </div>
          <div className="lg:col-span-5 p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">STIMA Ecosystem Overview</h2>
              <InfoTip text="This is the heartbeat of STIMA: verified assets form the reserve; daily deterministic valuations power the NAV and mint capacity."/>
            </div>
            <ul className="mt-3 text-sm space-y-2">
              <li><strong>Verified reserve:</strong> {fmtEUR(totalReserve)}</li>
              <li><strong>Minted supply:</strong> {minted.toFixed(2)} STIMA</li>
              <li className="flex items-center gap-2">
                <span><strong>Simulated DEX liquidity:</strong> {fmtEUR(simulatedLiquidityEUR)}</span>
                <InfoTip text="Placeholder: this simulates current liquidity on a DEX pair (e.g., Uniswap). Later we’ll replace it with live on-chain data."/>
              </li>
            </ul>

            {/* Category explorer grid */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">
                Category Explorer
                <InfoTip text="Click a category to open its DPI (Daily Price Index) mini chart and relative share of the reserve."/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {byCategory.map(c => {
                  const pct = totalReserve ? (c.value / totalReserve) * 100 : 0
                  return (
                    <button
                      key={c.id}
                      onClick={() => openCategoryModal(c.id)}
                      className="text-left rounded-xl border bg-white p-3 hover:bg-slate-50"
                      title="Open DPI popup"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-slate-500">{pct.toFixed(1)}%</div>
                      </div>
                      <div className="text-xs mt-1">{fmtEUR(c.value)}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CTA: Add your asset */}
            <div className="mt-5 rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    Add your asset <InfoTip text="Register your watch, artwork, wine, or other collectible. We’ll compute a stable, daily valuation and prepare it for tokenization."/>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    STIMA is an asset-intelligence portal. Upload an item, get a consistent valuation (idempotent per day),
                    and see how it contributes to the ecosystem’s reserve and mint capacity.
                  </p>
                </div>
                <a href="/assets" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-black text-white text-sm">
                  <Upload size={14}/> Add asset
                </a>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Want to learn more?
                <a href="/trends" className="inline-flex items-center gap-1 ml-1 underline">
                  Explore Trends <ExternalLink size={12}/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== Bento: Heat + Liquidity ===== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Heat by share */}
        <Card className="md:col-span-6">
          <div className="text-sm font-medium">
            Category Heat by Share
            <InfoTip text="Relative share of the verified reserve by category. Useful to spot concentration and diversification."/>
          </div>
          <div className="mt-3 space-y-2">
            {byCategory
              .slice()
              .sort((a,b)=> b.value-a.value)
              .map(c => {
                const pct = totalReserve ? (c.value/totalReserve)*100 : 0
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs">
                      <span>{c.name}</span><span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#111,#444)' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* Simulated DEX Liquidity */}
        <Card className="md:col-span-6">
          <div className="text-sm font-medium">
            Exchange Liquidity (simulated)
            <InfoTip text="Estimated liquidity on a DEX pair (e.g., Uniswap). This is simulated for demo; later it will pull live pair reserves."/>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl border bg-white">
              <div className="text-xs text-slate-500">Current (est.)</div>
              <div className="text-lg font-semibold">{fmtEUR(simulatedLiquidityEUR)}</div>
            </div>
            <div className="p-3 rounded-xl border bg-white">
              <div className="text-xs text-slate-500">NAV/token</div>
              <div className="text-lg font-semibold">€ {nav.toFixed(4)}</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Figures are placeholders based on reserve and daily seed — replace with on-chain pair data when contracts are live.
          </p>
        </Card>
      </div>

      {/* ===== Blockchain + News ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5">
          <div className="text-sm font-medium">
            Blockchain Live
            <InfoTip text="Animated feed from simulated events (and live later): verifications, mint-ready states, and oracle snapshots."/>
          </div>
          <div className="text-xs text-slate-500 mb-2">Today — {todayISO()}</div>
          <BlockchainLive state={state}/>
        </Card>
        <Card className="lg:col-span-7">
          <div className="text-sm font-medium">
            Insights & News
            <InfoTip text="Curated market notes across watches, art, wine and more. Replace with a real API or editorial feed."/>
          </div>
          <NewsGrid/>
        </Card>
      </div>

      {/* ===== DPI Modal ===== */}
      <Modal
        open={openModal}
        title="Category DPI (Daily Price Index)"
        onClose={()=>setOpenModal(false)}
      >
        {!modalCat || modalData.length===0 ? (
          <div className="text-sm text-slate-500">No recent data available for this category.</div>
        ) : (
          <div>
            <div className="text-sm text-slate-500 mb-2">
              Category: <strong>{CATEGORIES.find(c=>c.id===modalCat)?.label}</strong>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={modalData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }}/>
                  <YAxis domain={['auto','auto']} tick={{ fontSize: 10 }}/>
                  <RTooltip />
                  <Line type="monotone" dataKey="dpi" dot={false} stroke="#111" strokeWidth={1.6}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              DPI is normalized with base 100 at the oldest visible date, computed from daily display valuations of verified assets in this category.
            </div>
          </div>
        )}
      </Modal>
    </main>
  )
}
