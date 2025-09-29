
import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Sparkles, Moon, Sun, RefreshCcw, Plus } from 'lucide-react'
import { load, save } from '../core/store'
import { todayISO } from '../core/utils'
import Home from './pages/Home.jsx'
import Assets from './pages/Assets.jsx'
import AssetDetail from './pages/AssetDetail.jsx'
import Trends from './pages/Trends.jsx'

export default function App(){
  const [state, setState] = useState(()=>load())
  const [dark, setDark] = useState(false)
  const nav = useNavigate()
  useEffect(()=>save(state),[state])
  useEffect(()=>{ document.documentElement.classList.toggle('dark', dark)},[dark])

  return (
    <div className="min-h-screen text-ink dark:text-slate-100">
      <header className="px-6 py-4 sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Sparkles size={18}/>
            <div>
              <div className="text-lg font-bold leading-none">STIMA</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-1">Asset Intelligence · Token Vault</div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/assets" className="hover:underline">Asset</Link>
            <Link to="/trends" className="hover:underline">Tendenze</Link>
            <button onClick={()=>setDark(v=>!v)} className="px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
              {dark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home state={state} setState={setState} />}/>
        <Route path="/assets" element={<Assets state={state} setState={setState} />}/>
        <Route path="/asset/:id" element={<AssetDetail state={state} setState={setState} />}/>
        <Route path="/trends" element={<Trends state={state} setState={setState} />}/>
      </Routes>
    </div>
  )
}
