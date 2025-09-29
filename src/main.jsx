import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './ui/App.jsx'
import ErrorBoundary from './ui/ErrorBoundary.jsx'
import { SoundProvider } from './core/sound.js'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
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
