import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import MeasurePage from './pages/MeasurePage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/measure/:sessionId" element={<MeasurePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
