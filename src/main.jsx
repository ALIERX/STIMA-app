import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './ui/App.jsx'
import ErrorBoundary from './ui/ErrorBoundary.jsx'
import { SoundProvider } from './core/sound.jsx'

import './styles/index.css'

const rootEl = document.getElementById('root')
const boot = document.getElementById('boot-banner')

function removeBoot() {
  try { boot?.parentNode?.removeChild(boot) } catch {}
}

try {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <SoundProvider>
            <App />
          </SoundProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>
  )
  removeBoot()
  // ping console per capire se arriva fin qui
  console.log('[STIMA] App mounted')
} catch (err) {
  console.error('[STIMA] Mount error:', err)
  // se c’è un errore prima del render, mostralo a schermo
  if (boot) boot.innerHTML = `<span style="color:#b91c1c">Mount error: ${String(err)}</span>`
}
