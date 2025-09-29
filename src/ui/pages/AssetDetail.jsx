import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components.jsx'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { fmtEUR } from '../../core/utils'

const METRICS = ['Rarity','Market','Museum','Durability','Provenance','Liquidity']

export default function AssetDetail({state}){
  const { id } = useParams()
  const a = state.assets.find(x=>x.id===id)
  if(!a) return <main className="max-w-5xl mx-auto p-6">Asset non trovato</main>
  const last = a.history[a.history.length-1]
  const display = last? last.display : a.declaredValueEUR

  const seed = Math.abs((a.fingerprint||'0').split('').reduce((s,c)=>s+c.charCodeAt(0),0))
  function rnd(i){ return ( (seed*(i+3)) % 100 ) }
  const chartData = METRICS.map((m,i)=>({ metric: m, score: Math.max(20, Math.min(95, rnd(i))) }))

  return (
    <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <div className="text-sm text-slate-500">Asset</div>
          <h1 className="text-2xl font-bold">{[a.artist||a.brand, a.title||a.model].filter(Boolean).join(' — ')||a.id}</h1>
          {a.serial && <div className="text-sm">Seriale/Lotto: <strong>{a.serial}</strong></div>}
          <div className="text-sm">Valore (display): <strong>{fmtEUR(display)}</strong></div>
          <div className="text-xs text-slate-500">Fingerprint: <span className="font-mono">{a.fingerprint}</span></div>
          <div className="mt-3 text-sm space-y-1">
            <div><strong>Stato</strong>: {a.verified? 'Verified' : 'Pending check'}</div>
            <div><strong>Categoria</strong>: {a.category}</div>
            <div><strong>Creato</strong>: {a.createdAt}</div>
          </div>
          <div className="mt-4"><Link to="/assets" className="text-sm underline">← Torna agli asset</Link></div>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Documenti & Provenienza</div>
          <ul className="text-sm list-disc ml-5 space-y-1">
            <li>Fattura (placeholder)</li>
            <li>Certificato autenticità (placeholder)</li>
            <li>Foto HQ macro (placeholder)</li>
          </ul>
        </Card>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <Card className="h-[380px]">
          <div className="text-sm font-medium mb-2">Profilo caratteristiche (esagono)</div>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart data={chartData} outerRadius="75%">
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0,100]} tick={false} />
              <Radar dataKey="score" stroke="#111" fill="#111" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Audit trail (simulato)</div>
          <ul className="text-sm list-disc ml-5 space-y-1">
            <li>Valutazioni giornaliere idempotenti (ultima: {a.history.length? a.history[a.history.length-1].date : '—'})</li>
            <li>Mint events (simulati via UI)</li>
            <li>Oracle snapshots globali (vedi pagina Asset → KPIs)</li>
          </ul>
        </Card>
      </div>
    </main>
  )
}
