import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import { LibraryProvider } from './context/LibraryContext.jsx'
import { VendingProvider } from './context/VendingContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LibraryProvider>
        <VendingProvider>
          <App />
        </VendingProvider>
      </LibraryProvider>
    </BrowserRouter>
  </React.StrictMode>
)
