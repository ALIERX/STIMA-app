
import { MODEL_VERSION, TWAP_WINDOW_DAYS, HYSTERESIS_THRESHOLD } from './state'
export function fmtEUR(n){ return n.toLocaleString('it-IT',{style:'currency',currency:'EUR'}) }
export function todayISO(d){ const x=d||new Date(); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const dd=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}` }
export function hashStr(s){ let h=5381; for(let i=0;i<s.length;i++) h=(h*33)^s.charCodeAt(i); return h>>>0 }
export function mulberry32(seed){ return function(){ let t=(seed+=0x6d2b79f5); t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967296 } }
export function sha256demo(s){ return `k${hashStr(s).toString(16)}` }
export function simpleAverage(a){ if(!a.length) return 0; return a.reduce((x,y)=>x+y,0)/a.length }
import { CATEGORY_PARAMS } from './state'
export function marketFactor(category, dateISO){ const seed=hashStr(`${MODEL_VERSION}|${category}|${dateISO}`); const rnd=mulberry32(seed); const params=CATEGORY_PARAMS[category]||{baseVol:0.005,alpha:0.001}; const shock=(rnd()*2-1)*params.baseVol; const drift=params.alpha; return 1+drift+shock }
export function computeValuationForAsset(asset, dateISO){
  const factor=marketFactor(asset.category, dateISO);
  const valueRaw=Math.max(0, asset.declaredValueEUR*factor);
  const past=asset.history.filter(h=>h.date<dateISO).sort((a,b)=>a.date<b.date?1:-1).slice(0, TWAP_WINDOW_DAYS-1).map(h=>h.value);
  const { DISPLAY_BLEND } = awaitDisplayBlend(); // hack to avoid circular
  const twap=simpleAverage([...past, valueRaw]);
  let blended = DISPLAY_BLEND.twap*twap + DISPLAY_BLEND.today*valueRaw;
  const lastDisplay=asset.history.length?asset.history[asset.history.length-1].display:asset.declaredValueEUR;
  const change=Math.abs(blended-lastDisplay)/Math.max(1,lastDisplay);
  if(change < HYSTERESIS_THRESHOLD) blended=lastDisplay;
  const idempotencyKey=sha256demo(`${asset.fingerprint}|${dateISO}|${MODEL_VERSION}`);
  return { valueToday:valueRaw, displayValue:blended, idempotencyKey };
}
// minimal trick to import constant lazily
export function awaitDisplayBlend(){ return { DISPLAY_BLEND: { twap:0.7, today:0.3 } } }
