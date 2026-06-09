import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import TVApp from './TVApp'
import CreateJobOrder from './components/CreateJobOrder'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/create" element={<CreateJobOrder />} />
        <Route path="/tv" element={<TVApp />} />
        <Route path="/tv/:type" element={<TVApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)