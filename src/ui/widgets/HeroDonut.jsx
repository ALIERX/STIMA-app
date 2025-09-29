// src/ui/widgets/HeroSection.jsx
import React, { useMemo } from 'react'
import { Card } from '../components.jsx'
import HeroDonut from './HeroDonut.jsx'
import { CATEGORIES } from '../../core/state'
import { fmtEUR, todayISO, hashStr } from '../../core/utils'
import { HelpCircle, Upload, ExternalLink } from 'lucide-react'

function InfoTip({ text }) {
  return (
    <span className="inline-flex items-center" title={text} aria-label="What is this?">
      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full border text-slate-600 hover:bg-slate-50">
        <HelpCircle size={12}/>
      </span>
    </span>
  )
}

export default function HeroSection({ state, weekly, onOpenCategory }) {
  // Reserve by category (verified only)
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

  // Simulated DEX liquidity (placeholder for Uniswap pair data)
  const simulatedLiquidityEUR = useMemo(() => {
    const seed = hashStr(todayISO())
    const base = totalReserve * (0.16 + (seed % 7) * 0.01) // ~16–22% of reserve
    const jitter = (seed % 1000) / 1000 * 0.06
    return Math.round(base * (1 + jitter))
  }, [totalReserve])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-4">
      {/* LEFT: pulsing donut with particles */}
      <div className="lg:col-span-7">
        <HeroDonut state={state} onOpenCategory={onOpenCategory} />
      </div>

      {/* RIGHT: KPIs + Category Explorer + CTA */}
      <div className="lg:col-span-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">STIMA Ecosystem Overview</h2>
          <InfoTip text="The heartbeat of STIMA: verified assets form the reserve; deterministic daily valuations power NAV and mint capacity."/>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl border bg-white">
            <div className="text-xs text-slate-500">Verified reserve</div>
            <div className="text-lg font-semibold">{fmtEUR(totalReserve)}</div>
          </div>
          <div className="p-3 rounded-xl border bg-white">
            <div className="text-xs text-slate-500">Minted supply</div>
            <div className="text-lg font-semibold">{minted.toFixed(2)} STIMA</div>
          </div>
          <div className="p-3 rounded-xl border bg-white">
            <div className="text-xs text-slate-500">NAV / token</div>
            <div className="text-lg font-semibold">€ {nav.toFixed(4)}</div>
          </div>
          <div className="p-3 rounded-xl border bg-white">
            <div className="text-xs text-slate-500">Exchange liquidity (sim.)</div>
            <div className="text-lg font-semibold">{fmtEUR(simulatedLiquidityEUR)}</div>
          </div>
        </div>

        {/* Category Explorer */}
        <div>
          <div className="text-sm font-medium flex items-center">
            Category Explorer
            <InfoTip text="Click a category to open its DPI (Daily Price Index) chart and relative share of the reserve."/>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {byCategory.map(c => {
              const pct = totalReserve ? (c.value / totalReserve) * 100 : 0
              return (
                <button
                  key={c.id}
                  onClick={() => onOpenCategory?.(c.id)}
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
        <Card>
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <div className="text-sm font-semibold flex items-center gap-2">
                Add your asset
                <InfoTip text="Register your watch, artwork, wine, or other collectible. We compute a stable daily valuation (idempotent per day) and prepare it for tokenization."/>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                STIMA is an asset-intelligence portal. Upload an item, track consistent valuations,
                and understand its impact on the ecosystem’s reserve and mint capacity.
              </p>
            </div>
            <a href="/assets" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-black text-white text-sm whitespace-nowrap">
              <Upload size={14}/> Add asset
            </a>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Curious about market dynamics?
            <a href="/trends" className="inline-flex items-center gap-1 ml-1 underline">
              Explore Trends <ExternalLink size={12}/>
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
