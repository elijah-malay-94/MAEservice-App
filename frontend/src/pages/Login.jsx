import { useState } from 'react'
import axios from 'axios'
import { API_BASE as API } from '../lib/apiBase'

const C = {
  card: '#0E1A30', border: '#1A2D50',
  blue: '#3b82f6', teal: '#0ea5e9',
  green: '#10b981', amber: '#f59e0b',
  red: '#ef4444', muted: '#64748b', text: '#e2e8f0',
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password })
      localStorage.setItem('mae_token',    res.data.token)
      localStorage.setItem('mae_username', res.data.username)
      localStorage.setItem('mae_role',     res.data.role)
      onLogin(res.data)
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#070D1A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', position: 'relative', overflow: 'hidden',
    }}>

      {/* Grid Background */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.1, pointerEvents:'none' }}>
        {Array.from({length:30}, (_,i) => (
          <line key={`v${i}`} x1={i*60} y1="0" x2={i*60} y2="100%" stroke="#1A2D50" strokeWidth="0.5"/>
        ))}
        {Array.from({length:20}, (_,i) => (
          <line key={`h${i}`} x1="0" y1={i*60} x2="100%" y2={i*60} stroke="#1A2D50" strokeWidth="0.5"/>
        ))}
      </svg>

      {/* Glow circles */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}>
        <div style={{ width:500, height:500, borderRadius:'50%', border:'1px solid #2563eb22', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>
        <div style={{ width:350, height:350, borderRadius:'50%', border:'1px solid #3b82f633', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>
        <div style={{ width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, #2563eb12 0%, transparent 70%)', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>
      </div>

      {/* Login Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 400,
        margin: '0 16px',
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '40px 36px',
        boxShadow: '0 0 40px #2563eb22',
      }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:56, height:56, borderRadius:14,
            background:'linear-gradient(135deg,#1d4ed8,#2563eb)',
            border:'1px solid #3b82f6',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24, fontWeight:900, color:'#fff',
            boxShadow:'0 0 20px #2563eb66',
            margin:'0 auto 16px',
          }}>M</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#fff' }}>MAEService</div>
          <div style={{ fontSize:24, fontWeight:900, color:'#60a5fa', textShadow:'0 0 12px #3b82f6' }}>2.0</div>
          <div style={{ fontSize:9, color:C.teal, letterSpacing:'.15em', marginTop:4 }}>
            HIGH LEVEL DESIGN PLATFORM
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:`${C.red}15`, border:`1px solid ${C.red}44`,
            borderRadius:8, padding:'10px 14px',
            fontSize:11, color:C.red, marginBottom:20, textAlign:'center',
          }}>⚠ {error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:'.1em', marginBottom:6 }}>USERNAME</div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              style={{
                width:'100%', padding:'10px 14px',
                background:'#111F38', border:`1px solid ${C.border}`,
                borderRadius:8, color:C.text, fontSize:12,
                fontFamily:'monospace', outline:'none',
                boxSizing:'border-box',
              }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:'.1em', marginBottom:6 }}>PASSWORD</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width:'100%', padding:'10px 14px',
                background:'#111F38', border:`1px solid ${C.border}`,
                borderRadius:8, color:C.text, fontSize:12,
                fontFamily:'monospace', outline:'none',
                boxSizing:'border-box',
              }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%', padding:'12px',
              background: loading ? C.border : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
              border:'1px solid #3b82f6',
              borderRadius:8, color:'#fff',
              fontSize:12, fontWeight:700,
              fontFamily:'monospace', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 16px #2563eb44',
              transition:'all 0.2s',
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN →'}
          </button>
        </form>

        {/* Hint */}
        <div style={{ marginTop:24, padding:'12px', background:'#111F38', borderRadius:8 }}>
          <div style={{ fontSize:8, color:C.muted, marginBottom:6, letterSpacing:'.1em' }}>TEST CREDENTIALS</div>
          {[
            { u:'admin',    p:'admin123',    r:'Admin'    },
            { u:'operator', p:'operator123', r:'Operator' },
            { u:'viewer',   p:'viewer123',   r:'Viewer'   },
          ].map(x => (
            <div key={x.u} style={{ fontSize:9, color:C.muted, marginBottom:3 }}>
              <span style={{ color:C.blue }}>{x.u}</span> / <span style={{ color:C.teal }}>{x.p}</span>
              <span style={{ color:C.amber, marginLeft:8 }}>[{x.r}]</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}