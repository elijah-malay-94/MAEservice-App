import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { id: '/',             icon: '◈', label: 'Dashboard'    },
  { id: '/devices',      icon: '⬡', label: 'Devices'      },
  { id: '/network',      icon: '◎', label: 'Network'      },
  { id: '/data-engine',  icon: '◉', label: 'Data Engine'  },
  { id: '/api-monitor',  icon: '⊞', label: 'API Monitor'  },
  { id: '/architecture', icon: '⬙', label: 'Architecture' },
  { id: '/settings',     icon: '✦', label: 'Settings'     },
]

const techBadges = [
  { t: 'React 18', c: '#0ea5e9' },
  { t: 'Vite',     c: '#f59e0b' },
  { t: 'LoRaWAN',  c: '#3b82f6' },
  { t: 'MQTT',     c: '#10b981' },
]

export default function Sidebar({ onClose }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      width: open ? 220 : 52,
      transition: 'width 0.3s ease',
      background: '#070D1A',
      borderRight: '1px solid #1A2D50',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Grid Lines Background ── */}
      {open && (
        <svg style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', opacity: 0.15,
        }}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`}
              x1={i * 20} y1="0" x2={i * 20} y2="100%"
              stroke="#1A2D50" strokeWidth="0.5"/>
          ))}
          {Array.from({ length: 40 }, (_, i) => (
            <line key={`h${i}`}
              x1="0" y1={i * 24} x2="100%" y2={i * 24}
              stroke="#1A2D50" strokeWidth="0.5"/>
          ))}
        </svg>
      )}

      {/* ── Glow Circles ── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '18%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          <div style={{
            width: 180, height: 180, borderRadius: '50%',
            border: '1px solid #2563eb44',
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}/>
          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            border: '1px solid #3b82f633',
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}/>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle, #2563eb18 0%, transparent 70%)',
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}/>
        </div>
      )}

      {/* ── Logo / Toggle Button ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', zIndex: 2,
          padding: open ? '22px 16px 16px' : '14px 10px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: open ? 'column' : 'row',
          alignItems: 'center',
          gap: open ? 6 : 0,
          borderBottom: open ? 'none' : '1px solid #1A2D50',
        }}
      >
        {/* M Logo Box */}
        <div style={{
          width: open ? 44 : 32,
          height: open ? 44 : 32,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          border: '1px solid #3b82f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: open ? 20 : 14,
          fontWeight: 900, color: '#fff',
          boxShadow: '0 0 16px #2563eb66',
          flexShrink: 0,
          transition: 'all 0.3s',
        }}>M</div>

        {open && (
          <>
            <div style={{
              fontSize: 15, fontWeight: 900, color: '#fff',
              letterSpacing: '0.02em', textAlign: 'center',
              fontFamily: 'monospace',
            }}>MAEService</div>
            <div style={{
              fontSize: 18, fontWeight: 900,
              color: '#60a5fa',
              fontFamily: 'monospace',
              lineHeight: 1,
              textShadow: '0 0 12px #3b82f6',
            }}>2.0</div>
            <div style={{
              fontSize: 8, color: '#0ea5e9',
              letterSpacing: '0.15em', textAlign: 'center',
              fontFamily: 'monospace',
            }}>High Level Design Platform</div>
            <div style={{
              fontSize: 7, color: '#64748b',
              textAlign: 'center', marginTop: 2,
              fontFamily: 'monospace',
            }}>IoT · LoRaWAN · MAE Device · Cloud</div>
          </>
        )}
      </div>

      {/* ── Tech Badges ── */}
      {open && (
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexWrap: 'wrap',
          gap: 5, padding: '0 12px 12px',
          justifyContent: 'center',
        }}>
          {techBadges.map(b => (
            <span key={b.t} style={{
              fontSize: 7, padding: '2px 7px', borderRadius: 10,
              background: `${b.c}18`,
              border: `1px solid ${b.c}44`,
              color: b.c, fontWeight: 700,
              fontFamily: 'monospace',
            }}>{b.t}</span>
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      {open && (
        <div style={{
          margin: '0 16px 10px',
          height: 1,
          background: 'linear-gradient(to right, transparent, #3b82f644, transparent)',
          position: 'relative', zIndex: 2,
        }}/>
      )}

      {/* ── Status ── */}
      {open && (
        <div style={{
          margin: '0 12px 12px',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            background: '#0A1225',
            border: '1px solid #1A2D50',
            borderRadius: 8, padding: '6px 10px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
            }}/>
            <span style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace' }}>
              All systems operational
            </span>
          </div>
        </div>
      )}

      {/* ── Nav Items ── */}
      <nav style={{
        flex: 1, padding: '4px 0',
        position: 'relative', zIndex: 2,
        overflowY: 'auto',
      }}>
        {navItems.map(n => {
          const active = location.pathname === n.id
          return (
            <button
              key={n.id}
             onClick={() => { navigate(n.id); if(onClose) onClose() }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: open ? '9px 16px' : '10px',
                justifyContent: open ? 'flex-start' : 'center',
                background: active ? 'rgba(37,99,235,0.2)' : 'transparent',
                border: 'none',
                borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
                color: active ? '#60a5fa' : '#64748b',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 11,
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition: 'all 0.2s',
                boxShadow: active ? 'inset 0 0 20px #2563eb18' : 'none',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.color = '#94a3b8'
                if (!active) e.currentTarget.style.background = '#ffffff08'
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.color = '#64748b'
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{
                fontSize: 14, flexShrink: 0,
                filter: active ? `drop-shadow(0 0 4px #3b82f6)` : 'none',
              }}>{n.icon}</span>
              {open && (
                <span style={{ fontWeight: active ? 700 : 400 }}>{n.label}</span>
              )}
              {open && active && (
                <span style={{
                  marginLeft: 'auto', width: 5, height: 5,
                  borderRadius: '50%', background: '#3b82f6',
                  boxShadow: '0 0 6px #3b82f6',
                  flexShrink: 0,
                }}/>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Bottom Info ── */}
      {open && (
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '10px 12px 14px',
          borderTop: '1px solid #1A2D50',
        }}>
          {/* Health Bars */}
          <div style={{
            background: '#0A1225',
            border: '1px solid #1A2D50',
            borderRadius: 8, padding: '10px',
            marginBottom: 10,
          }}>
            <div style={{
              fontSize: 8, color: '#64748b',
              marginBottom: 8, letterSpacing: '.1em',
              fontFamily: 'monospace',
            }}>PLATFORM HEALTH</div>
            {[
              { l: 'CPU', v: 68, c: '#3b82f6' },
              { l: 'MEM', v: 45, c: '#0ea5e9' },
              { l: 'NET', v: 81, c: '#10b981' },
            ].map(x => (
              <div key={x.l} style={{
                display: 'flex', alignItems: 'center',
                gap: 6, marginBottom: 5,
              }}>
                <span style={{ fontSize: 8, color: '#64748b', minWidth: 22, fontFamily: 'monospace' }}>
                  {x.l}
                </span>
                <div style={{ flex: 1, height: 4, background: '#1A2D50', borderRadius: 2 }}>
                  <div style={{
                    width: `${x.v}%`, height: '100%',
                    background: x.c, borderRadius: 2,
                    boxShadow: `0 0 4px ${x.c}88`,
                  }}/>
                </div>
                <span style={{ fontSize: 8, color: x.c, minWidth: 24, textAlign: 'right', fontFamily: 'monospace' }}>
                  {x.v}%
                </span>
              </div>
            ))}
          </div>

          {/* Footer text */}
          <div style={{
            fontSize: 7, color: '#1e3a5f',
            textAlign: 'center', fontFamily: 'monospace',
            letterSpacing: '.05em',
          }}>
            MAEService 2.0 · Template Preview · Confidential
          </div>
        </div>
      )}

    </div>
  )
}