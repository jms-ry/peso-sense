import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </ToastProvider>
)