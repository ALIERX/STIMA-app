
import React, { useMemo, useState } from 'react'
import { Card } from '../components.jsx'
import { PieChart, Pie, Sector, ResponsiveContainer, Tooltip } from 'recharts'
import { fmtEUR } from '../../core/utils'
import { CATEGORIES } from '../../core/state'
import { Link } from 'react-router-dom'

export default function Home({state}){
  const data = useMemo(()=>{
    const map = new Map(CATEGORIES.map(c=>[c.id,0]))
    state.assets.filter(a=>a.verified).forEach(a=>{
      const last = a.history[a.history.length-1]
      const v = last? last.display : a.declaredValueEUR
      map.set(a.category, (map.get(a.category)||0) + v)
    })
    return CATEGORIES.map(c=>({ name: c.label, key: c.id, value: map.get(c.id)||0 }))
  },[state.assets])

  const [active, setActive] = useState(null)
  const total = data.reduce((s,d)=>s+d.value,0) || 1

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, payload, value } = props
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 8) * cos
    const sy = cy + (outerRadius + 8) * sin
    const mx = cx + (outerRadius + 18) * cos
    const my = cy + (outerRadius + 18) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 12
    const ey = my
    const textAnchor = cos >= 0 ? 'start' : 'end'
    return (
      <g>
        <text x={cx} y={cy} dy={-6} textAnchor="middle" className="fill-current text-sm">Quota</text>
        <text x={cx} y={cy} dy={14} textAnchor="middle" className="fill-current font-semibold">{(value/total*100).toFixed(1)}%</text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} />
        <Sector cx={cx} cy={cy} innerRadius={outerRadius+4} outerRadius={outerRadius+8} startAngle={startAngle} endAngle={endAngle}/>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} fill="none" stroke="#111"/>
        <circle cx={ex} cy={ey} r={2} fill="#111" stroke="none"/>
        <text x={ex + (cos >= 0 ? 6 : -6)} y={ey} textAnchor={textAnchor} className="fill-current text-sm">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 6 : -6)} y={ey+14} textAnchor={textAnchor} className="fill-current text-xs">{fmtEUR(value)}</text>
      </g>
    )
  }

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <Card className="p-0">
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Composizione ecosistema</div>
              <div className="text-lg font-semibold">Distribuzione per categoria (verified)</div>
            </div>
            <div className="text-sm">Totale: <strong>{fmtEUR(total)}</strong></div>
          </div>
          <div className="h-80 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={active}
                  activeShape={renderActiveShape}
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  onMouseEnter={(_, i)=>setActive(i)}
                  onMouseLeave={()=>setActive(null)}
                />
                <Tooltip formatter={(v)=>fmtEUR(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.map(d=> (
              <Link key={d.key} to={`/assets?cat=${d.key}`} className="text-sm flex items-center justify-between bg-white border rounded-xl px-3 py-2 hover:bg-slate-50">
                <span>{d.name}</span>
                <span className="font-medium">{(d.value/total*100).toFixed(1)}%</span>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-2">Novità intelligenti</div>
          <ul className="list-disc ml-5 text-sm space-y-1">
            <li><strong>Insight Engine</strong>: segnali automatici (asset sottovalutati, volatilità anomala, cluster similari).</li>
            <li><strong>Price Guards</strong>: hysteresis + TWAP + soglie anti-manipolazione per valori “calmi”.</li>
            <li><strong>Oracle Batch</strong>: un solo snapshot/giorno con Merkle root (simulato qui come log locale).</li>
            <li><strong>LP Autopilot 10%</strong>: a ogni mint calcoliamo la quota LP e mostriamo il fondo cumulato.</li>
          </ul>
        </Card>
      </div>
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <div className="text-sm font-medium mb-3">Onboarding rapido</div>
          <ol className="text-sm space-y-1 list-decimal ml-5">
            <li>Aggiungi qualche asset e marchiali <em>Verified</em>.</li>
            <li>Esegui <em>Run valutazione</em> dalla pagina Asset.</li>
            <li>Apri un asset e prova <em>Mint quote</em>.</li>
            <li>Ritorna qui per vedere la torta cambiare.</li>
          </ol>
        </Card>
        <Card>
          <div className="text-sm font-medium mb-3">Roadmap UI</div>
          <ul className="text-sm space-y-1 list-disc ml-5">
            <li>Dark mode (già inclusa, toggle in header).</li>
            <li>Theme STIMA personalizzato (palette e logo).</li>
            <li>Pagina <em>Trends</em> con top gainers/losers e heatmap.</li>
            <li>Dettaglio asset con <strong>chart esagonale</strong> e audit trail.</li>
          </ul>
        </Card>
      </div>
    </main>
  )
}
