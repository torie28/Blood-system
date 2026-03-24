import React from 'react'
import Index from './routes/Index.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Index />
    </AuthProvider>
  )
}

export default App
