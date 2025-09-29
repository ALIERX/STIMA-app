import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Animated feed from simulated on-chain events:
 * - Mint events (from verified assets)
 * - Oracle snapshots
 * - Verifications
 */
export default function BlockchainLive({ state }) {
  const events = useMemo(() => {
    const out = []
    // Oracle snapshots
    state.oracle.slice(-6).forEach(o => {
      out.push({ t: o.epoch, kind: 'ORACLE', text: `Oracle snapshot · Reserve ${o.totalReserveValue.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}` })
    })
    // Verifications and "Mint" hints (simulation from assets)
    state.assets.slice(-8).forEach(a => {
      if (a.verified) out.push({ t: a.createdAt, kind: 'VERIFY', text: `Verified · ${a.artist || a.brand || 'Asset'} ${a.title || a.model || ''}`.trim() })
      if (a.history.length) {
        const last = a.history[a.history.length - 1]
        out.push({ t: last.date, kind: 'MINT', text: `Mint ready · ${Math.round(last.display)} EUR · ${a.title || a.model || a.id}` })
      }
    })
    // newest last
    return out.slice(-10)
  }, [state.assets, state.oracle])

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {events.map((e, i) => (
          <motion.div
            key={`${e.kind}_${i}_${e.t}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className={`rounded-xl border px-3 py-2 text-sm ${e.kind === 'MINT' ? 'bg-emerald-50 border-emerald-200' : e.kind === 'VERIFY' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{e.text}</span>
              <span className="text-xs text-slate-500">{e.t}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="text-xs text-slate-500 mt-2">Simulated for demo · connect contracts later</div>
    </div>
  )
}
