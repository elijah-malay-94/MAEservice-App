import { useLocation } from 'react-router-dom'

const titles = {
  '/':             'Dashboard',
  '/devices':      'Devices',
  '/network':      'Network',
  '/data-engine':  'Data Engine',
  '/api-monitor':  'API Monitor',
  '/architecture': 'Architecture',
  '/settings':     'Settings',
}

export default function Topbar({ onMenuClick, user, onLogout }) {
  const location = useLocation()
  const title = titles[location.pathname] || 'Dashboard'

  return (
    <div style={{
      height: 52,
      background: '#0A1225',
      borderBottom: '1px solid #1A2D50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      gap: 10,
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onMenuClick}
          className="hamburger"
          style={{
            background: 'transparent',
            border: '1px solid #1A2D50',
            borderRadius: 6,
            padding: '5px 7px',
            cursor: 'pointer',
            color: '#60a5fa',
            fontSize: 16,
            lineHeight: 1,
            display: 'none',
            flexShrink: 0,
            fontFamily: 'monospace',
          }}
        >☰</button>

        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        <span className="topbar-sub" style={{ fontSize: 9, color: '#64748b', whiteSpace: 'nowrap' }}>
          MAEService 2.0
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {[
          { t: '● LIVE',    c: '#10b981' },
          { t: '24 ONLINE', c: '#0ea5e9' },
          { t: '1 WARN',    c: '#f59e0b' },
        ].map(b => (
          <span key={b.t} className="topbar-badge" style={{
            fontSize: 8, fontWeight: 700,
            padding: '3px 7px', borderRadius: 20,
            border: `1px solid ${b.c}44`,
            background: `${b.c}18`,
            color: b.c, whiteSpace: 'nowrap',
          }}>{b.t}</span>
        ))}

        {/* Username */}
        {user && (
          <span className="topbar-sub" style={{
            fontSize: 9, color: '#60a5fa',
            padding: '3px 8px', borderRadius: 20,
            border: '1px solid #3b82f644',
            background: '#3b82f618',
            whiteSpace: 'nowrap',
          }}>
            {user.username} · {user.role}
          </span>
        )}

        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {user?.username?.[0]?.toUpperCase() || 'OP'}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid #ef444444',
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            color: '#ef4444',
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#ef444418'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >LOGOUT</button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: flex !important; }
          .topbar-sub { display: none; }
          .topbar-badge { display: none; }
        }
      `}</style>
    </div>
  )
}
