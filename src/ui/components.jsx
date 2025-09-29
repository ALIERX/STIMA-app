
import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export function Card({children, className}){
  return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35}} className={clsx('bg-glass backdrop-blur border border-slate-200 rounded-2xl p-5 shadow-glass', className)}>{children}</motion.div>
}

export function Chip({active, children, onClick}){
  return <button onClick={onClick} className={clsx('px-3 py-1.5 rounded-full text-sm border', active?'bg-black text-white border-black':'bg-white hover:bg-slate-50')}>{children}</button>
}
