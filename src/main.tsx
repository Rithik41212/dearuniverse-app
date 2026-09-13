import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AstroProvider from './astro/AstroContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AstroProvider><App /></AstroProvider>
  </React.StrictMode>,
)
