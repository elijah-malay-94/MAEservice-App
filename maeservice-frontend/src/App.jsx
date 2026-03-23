import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Ticker from './components/Ticker'
import Login       from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Devices      from './pages/Devices'
import Network      from './pages/Network'
import DataEngine   from './pages/DataEngine'
import APIMonitor   from './pages/APIMonitor'
import Architecture from './pages/Architecture'
import Settings     from './pages/Settings'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('mae_token')
    const username = localStorage.getItem('mae_username')
    const role = localStorage.getItem('mae_role')
    return token ? { token, username, role } : null
  })

  const handleLogin = (data) => setUser(data)

  const handleLogout = () => {
    localStorage.removeItem('mae_token')
    localStorage.removeItem('mae_username')
    localStorage.removeItem('mae_role')
    setUser(null)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: '#070D1A', overflow: 'hidden',
    }}>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40 }}
          className="mobile-overlay"
        />
      )}

      <div className={`sidebar-wrap ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Topbar
          onMenuClick={() => setSidebarOpen(o => !o)}
          user={user}
          onLogout={handleLogout}
        />
        <Ticker />
        <div className="app-content" style={{ flex:1, overflow:'auto' }}>
          <Routes>
            <Route path="/"             element={<Dashboard />}    />
            <Route path="/devices"      element={<Devices />}      />
            <Route path="/network"      element={<Network />}      />
            <Route path="/data-engine"  element={<DataEngine />}   />
            <Route path="/api-monitor"  element={<APIMonitor />}   />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/settings"     element={<Settings />}     />
            <Route path="*"             element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>

      <style>{`
        .sidebar-wrap { flex-shrink:0; height:100vh; z-index:50; }
        .mobile-overlay { display:none; }
        .app-content { padding: 16px; }

        @media (max-width: 640px) {
          .app-content { padding: 10px; }
        }

        @media (max-width: 768px) {
          .sidebar-wrap { position:fixed; top:0; left:0; bottom:0; transform:translateX(-100%); transition:transform 0.3s ease; }
          .sidebar-wrap.sidebar-open { transform:translateX(0); }
          .mobile-overlay { display:block !important; }
        }
      `}</style>
    </div>
  )
}