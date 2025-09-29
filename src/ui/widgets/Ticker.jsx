import React, { useMemo } from 'react'
import { CATEGORIES } from '../../core/state'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts'

/**
 * Smooth marquee ticker with category momentum & micro sparklines
 */
export default function Ticker({ weekly }) {
  const items = useMemo(() => {
    return CATEGORIES.map(c => {
      const arr = weekly.byCat[c.id] || []
      const last = arr[arr.length - 1]?.value || 0
      const prev = arr[arr.length - 2]?.value || 0
      const chg = prev ? (last - prev) / Math.max(1, prev) : 0
      return { id: c.id, name: c.label, change: chg, series: arr.map(d => ({ x: d.date?.slice(5), y: d.value })) }
    })
  }, [weekly])

  return (
    <div className="relative whitespace-nowrap overflow-hidden py-2">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none"/>
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"/>
      <div className="flex gap-6 animate-[marquee_20s_linear_infinite] px-4">
        {items.concat(items).map((it, idx) => (
          <div key={it.id + '_' + idx} className="flex items-center gap-3 border rounded-xl bg-white px-3 py-1.5">
            <span className="text-sm font-medium">{it.name}</span>
            <span className={`text-xs ${it.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {it.change >= 0 ? '▲' : '▼'} {(it.change * 100).toFixed(2)}%
            </span>
            <div className="w-28 h-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={it.series}>
                  <XAxis hide dataKey="x" />
                  <YAxis hide domain={['auto','auto']} />
                  <Line type="monotone" dataKey="y" dot={false} stroke="#111" strokeWidth={1.2}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
