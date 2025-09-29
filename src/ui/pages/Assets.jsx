import React, { useEffect, useMemo, useState } from 'react'
import { Card } from '../components.jsx'
import { Link, useLocation } from 'react-router-dom'
import { fmtEUR, todayISO, sha256demo, simpleAverage, marketFactor } from '../../core/utils'
import { CATEGORIES } from '../../core/state'

export default function Assets({state, setState}){
  const [q,setQ] = useState('')
  const [cat,setCat] = useState('all')
  const loc = useLocation()

  useEffect(()=>{
    const p = new URLSearchParams(loc.search).get('cat')
    if(p) setCat(p)
  },[loc.search])

  const totalReserveDisplay = useMemo(()=>{
    return state.assets
      .filter(a=>a.verified)
      .reduce((sum,a)=> sum + (a.history.length ? a.history[a.history.length-1].display : a.declaredValueEUR),0)
  },[state.assets])

  function runDailyValuation(epochISO){
    const iso = epochISO || todayISO()
    let updatedAssets = state.assets.map(a=>{
      const factor = marketFactor(a.category, iso)
      const valueRaw = Math.max(0, a.declaredValueEUR*factor)
      const past = a.history
        .filter(h=>h.date<iso)
        .sort((a,b)=>a.date<b.date?1:-1)
        .slice(0,2)
        .map(h=>h.value)
      const twap = simpleAverage([...past, valueRaw])
      let blended = 0.7*twap + 0.3*valueRaw
      const lastDisplay = a.history.length ? a.history[a.history.length-1].display : a.declaredValueEUR
      const change = Math.abs(blended-lastDisplay)/Math.max(1,lastDisplay)
      if(change < 0.015) blended = lastDisplay
      const key = sha256demo(`${a.fingerprint}|${iso}|2025.09`)
      const exists = a.history.find(h=>h.key===key)
      if(exists) return a
      return { ...a, history: [...a.history, {date: iso, value: valueRaw, display: blended, key}] }
    })
    const totalReserve = updatedAssets
      .filter(a=>a.verified)
      .reduce((s,a)=> s + (a.history.length? a.history[a.history.length-1].display : a.declaredValueEUR),0)
    const navPerToken = state.token.totalSupply>0 ? totalReserve/state.token.totalSupply : 1
    const newSnap = { epoch: iso, totalReserveValue: totalReserve }
    setState(s=>({
      ...s,
      assets: updatedAssets,
      token:{...s.token, navPerToken},
      oracle:[...s.oracle.filter(o=>o.epoch!==iso), newSnap],
      lastEpoch: iso
    }))
  }

  function toggleVerify(id){
    setState(s=>({
      ...s,
      assets: s.assets.map(a=> a.id===id ? { ...a, verified: !a.verified } : a)
    }))
  }

  function mintForAsset(id){
    const a = state.assets.find(x=>x.id===id); if(!a) return
    if(!a.verified){ alert('Verifica prima l\'asset'); return }
    const last = a.history[a.history.length-1]
    const V = last? last.display : a.declaredValueEUR
    const nav = state.token.navPerToken || 1
    const mintAmount = V / nav
    const lp = V*0.1
    setState(s=>({
      ...s,
      token:{
        totalSupply: s.token.totalSupply+mintAmount,
        navPerToken: (s.oracle[s.oracle.length-1]?.totalReserveValue||0)/(s.token.totalSupply+mintAmount || 1),
        liquidityFundEUR: s.token.liquidityFundEUR+lp
      }
    }))
  }

  const filtered = useMemo(()=>{
    return state.assets.filter(a=>{
      const inCat = cat==='all' || a.category===cat
      const text = (q||'').toLowerCase()
      const hit = !q || [a.brand, a.model, a.title, a.artist, a.serial]
        .filter(Boolean).join(' ').toLowerCase().includes(text)
      return inCat && hit
    })
  },[state.assets, q, cat])

  // Quick add
  const [draft, setDraft] = useState({
    category:'watch', brand:'', model:'', serial:'',
    title:'', artist:'', year:'', condition:'', declaredValueEUR:''
  })
  function fingerprintFromDraft(){
    return ['category','brand','model','serial','title','artist','year','condition']
      .map(k=> (draft[k]||'').trim().toLowerCase()).join('|')
  }
  function addAsset(){
    const declared = Number(draft.declaredValueEUR||0)
    if(!declared) return alert('Valore dichiarato?')
    const fp = 'k'+(Math.abs(
      fingerprintFromDraft().split('').reduce((a,c)=>a+c.charCodeAt(0),0)
    )).toString(16)
    if(state.assets.find(a=>a.fingerprint===fp)) return alert('Asset già presente')
    const id = 'A'+Date.now()
    const base = {
      id,
      category: draft.category,
      brand: draft.brand||undefined,
      model: draft.model||undefined,
      serial: draft.serial||undefined,
      title:draft.title||undefined,
      artist:draft.artist||undefined,
      year:draft.year||undefined,
      condition:draft.condition||undefined,
      declaredValueEUR: declared,
      fingerprint: fp,
      verified:false,
      createdAt: todayISO(),
      history: []
    }
    setState(s=>({...s, assets:[...s.assets, base]}))
    setDraft({ category:'watch', brand:'', model:'', serial:'', title:'', artist:'', year:'', condition:'', declaredValueEUR:'' })
  }

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Colonna sinistra: KPI + Add */}
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <div className="text-sm font-medium mb-2">KPIs</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl border bg-white">Reserve: <strong>{fmtEUR(totalReserveDisplay)}</strong></div>
            <div className="p-3 rounded-xl border bg-white">Supply: <strong>{state.token.totalSupply.toFixed(2)}</strong></div>
            <div className="p-3 rounded-xl border bg-white">NAV/token: <strong>{fmtEUR(state.token.navPerToken)}</strong></div>
            <div className="p-3 rounded-xl border bg-white">LP 10%: <strong>{fmtEUR(state.token.liquidityFundEUR)}</strong></div>
          </div>
          <div className="mt-3">
            <button onClick={()=>runDailyValuation()} className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm">
              Run valutazione
            </button>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium mb-3">Aggiungi rapido</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2 text-xs text-slate-500">Categoria</label>
            <select className="col-span-2 px-3 py-2 rounded-xl border" value={draft.category} onChange={e=>setDraft({...draft, category:e.target.value})}>
              {CATEGORIES.map(c=> <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input className="px-3 py-2 rounded-xl border" placeholder="Marca/Artista" value={draft.brand} onChange={e=>setDraft({...draft, brand:e.target.value})}/>
            <input className="px-3 py-2 rounded-xl border" placeholder="Modello/Titolo" value={draft.model} onChange={e=>setDraft({...draft, model:e.target.value})}/>
            <input className="px-3 py-2 rounded-xl border col-span-2" placeholder="Seriale/Lotto" value={draft.serial} onChange={e=>setDraft({...draft, serial:e.target.value})}/>
            <input className="px-3 py-2 rounded-xl border col-span-2" type="number" placeholder="Valore dichiarato €" value={draft.declaredValueEUR} onChange={e=>setDraft({...draft, declaredValueEUR:e.target.value})}/>
            <button onClick={addAsset} className="col-span-2 px-3 py-2 rounded-xl border bg-black text-white">
              Aggiungi
            </button>
          </div>
        </Card>
      </div>

      {/* Colonna destra: Lista asset con azioni */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-0">
          <div className="p-5 flex items-center justify-between">
            <div className="text-sm font-medium">Asset registrati</div>
            <div className="text-xs text-slate-500">
              Epoch: <span className="font-mono">{state.lastEpoch || todayISO()}</span>
            </div>
          </div>

          <div className="px-5 pb-5 grid md:grid-cols-2 gap-4">
            {filtered.length===0 && <div className="text-slate-500 text-sm">Nessun asset</div>}

            {filtered.map(a=>{
              const last = a.history[a.history.length-1]
              const display = last ? last.display : a.declaredValueEUR
              const catLabel = CATEGORIES.find(c=>c.id===a.category)?.label
              return (
                <div key={a.id} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">{catLabel}</div>
                      <Link to={`/asset/${a.id}`} className="font-semibold hover:underline">
                        {[a.artist||a.brand, a.title||a.model].filter(Boolean).join(' — ')||a.id}
                      </Link>
                      {a.serial && <div className="text-xs text-slate-500">Seriale: {a.serial}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Valore</div>
                      <div className="text-lg font-bold">{fmtEUR(display)}</div>
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mt-1 ${a.verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {a.verified ? 'Verified' : 'Pending check'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={()=>toggleVerify(a.id)}
                      className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm">
                      {a.verified ? 'Segna non verificato' : 'Verifica (light)'}
                    </button>
                    <button
                      onClick={()=>mintForAsset(a.id)}
                      className="px-3 py-2 rounded-xl border bg-black text-white text-sm">
                      Mint quote
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </main>
  )
}
