import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteSettingsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SiteSettingsProvider>
  </React.StrictMode>,
)
