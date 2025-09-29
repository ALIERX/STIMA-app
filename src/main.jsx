 import React from 'react'
 import { createRoot } from 'react-dom/client'
 import { BrowserRouter } from 'react-router-dom'
 import App from './ui/App.jsx'
+import ErrorBoundary from './ui/ErrorBoundary.jsx'
 // (se hai il SoundProvider, lascialo)
 
 createRoot(document.getElementById('root')).render(
   <React.StrictMode>
     <BrowserRouter>
-      <App />
+      <ErrorBoundary>
+        <App />
+      </ErrorBoundary>
     </BrowserRouter>
   </React.StrictMode>
 )
