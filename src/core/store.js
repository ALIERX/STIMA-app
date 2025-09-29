
import { LS_KEY } from './state'
export function load(){ const raw=localStorage.getItem(LS_KEY); if(!raw) return { assets:[], token:{totalSupply:0, navPerToken:1, liquidityFundEUR:0}, oracle:[], lastEpoch: null }; try{ return JSON.parse(raw) }catch{return { assets:[], token:{totalSupply:0, navPerToken:1, liquidityFundEUR:0}, oracle:[], lastEpoch: null }}}
export function save(state){ localStorage.setItem(LS_KEY, JSON.stringify(state)) }
