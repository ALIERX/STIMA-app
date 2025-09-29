import React, { useMemo } from 'react'
import { Card } from '../components.jsx'
import { CATEGORIES } from '../../core/state'
import { Link } from 'react-router-dom'

export default function Trends({state}){
  const byCat = useMemo(()=>{
    const m = new Map(CATEGORIES.map(c=>[c.id, []]))
    state.assets.forEach(a=> m.get(a.category).push(a))
    return m
  },[state.assets])

  function growth(a){
    if(a.history.length<2) return 0
    const last = a.history[a.history.length-1].display
    const prev = a.history[a.history.length-2].display
    return (last-prev)/Math.max(1,prev)
  }

  const gainers = [...state.assets].sort((x,y)=> growth(y)-growth(x)).slice(0,6)
  const losers = [...state.assets].sort((x,y)=> growth(x)-growth(y)).slice(0,6)

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-6">
        <Card>
          <div className="text-sm font-medium mb-3">Top gainers</div>
          <div className="grid md:grid-cols-2 gap-3">
            {gainers.map(a=> <Link to={`/asset/${a.id}`} key={a.id} className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50">{[a.artist||a.brand, a.title||a.model].filter(Boolean).join(' — ')||a.id}</Link>)}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-3">Top losers</div>
          <div className="grid md:grid-cols-2 gap-3">
            {losers.map(a=> <Link to={`/asset/${a.id}`} key={a.id} className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50">{[a.artist||a.brand, a.title||a.model].filter(Boolean).join(' — ')||a.id}</Link>)}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-6 space-y-6">
        {[...byCat.entries()].map(([k, arr])=> (
          <Card key={k}>
            <div className="text-sm font-medium mb-2">{CATEGORIES.find(c=>c.id===k)?.label}</div>
            <div className="text-xs text-slate-500 mb-2">{arr.length} asset</div>
            <div className="flex flex-wrap gap-2">
              {arr.slice(0,8).map(a=> <Link to={`/asset/${a.id}`} key={a.id} className="text-xs rounded-xl border bg-white px-2 py-1 hover:bg-slate-50">{a.title||a.model||a.id}</Link>)}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
