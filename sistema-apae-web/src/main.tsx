import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css' // Se estiver usando bootstrap
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* REMOVA O <BrowserRouter> DAQUI, pois ele já está no App.tsx */}
    <App />
  </React.StrictMode>,
)