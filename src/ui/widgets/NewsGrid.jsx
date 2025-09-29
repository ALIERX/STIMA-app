import React from 'react'

/**
 * Placeholder news grid — replace with real API later.
 */
export default function NewsGrid() {
  const items = [
    { id: 1, tag: 'Watches', title: 'High-end watch auctions show resilient demand', img: 'https://picsum.photos/seed/watch/480/280' },
    { id: 2, tag: 'Art', title: 'Contemporary art index edges higher this month', img: 'https://picsum.photos/seed/art/480/280' },
    { id: 3, tag: 'Wine', title: 'Vintage 2010–2016 Burgundy: pricing trends', img: 'https://picsum.photos/seed/wine/480/280' },
  ]
  return (
    <div className="grid md:grid-cols-3 gap-4 mt-3">
      {items.map(n => (
        <a key={n.id} href="#" className="rounded-2xl border bg-white overflow-hidden group">
          <div className="aspect-[16/9] bg-slate-100">
            <img src={n.img} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          </div>
          <div className="p-3">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{n.tag}</div>
            <div className="text-sm font-medium">{n.title}</div>
          </div>
        </a>
      ))}
    </div>
  )
}
