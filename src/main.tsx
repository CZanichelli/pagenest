import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/auth'
import { RequireAuth } from './components/Layout'
import Home from './pages/Home'
import { Login, Signup } from './pages/AuthPages'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import PublicPage from './pages/PublicPage'
import Settings from './pages/Settings'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/p/:slug" element={<PublicPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
