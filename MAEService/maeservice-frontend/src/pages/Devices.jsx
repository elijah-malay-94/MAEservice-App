import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE as API } from '../lib/apiBase'

const C = {
  card: '#0E1A30', border: '#1A2D50',
  blue: '#3b82f6', teal: '#0ea5e9',
  green: '#10b981', amber: '#f59e0b',
  red: '#ef4444', muted: '#64748b',
  text: '#e2e8f0', purple: '#8b5cf6',
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '16px 18px', ...style,
    }}>{children}</div>
  )
}

function DeviceCard({ device }) {
  const sc = device.status === 'online'  ? C.green
           : device.status === 'warning' ? C.amber : C.red
  const batColor = device.battery > 50 ? C.green
                 : device.battery > 20 ? C.amber : C.red
  return (
    <Card style={{ border: `1px solid ${sc}44`, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(to right, ${sc}, transparent)`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: sc, boxShadow: `0 0 6px ${sc}`,
            display: 'inline-block', marginTop: 2, flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{device.name}</div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>ID: {device.deviceId}</div>
          </div>
        </div>
        <span style={{
          fontSize: 8, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
          background: `${C.purple}18`, border: `1px solid ${C.purple}44`,
          color: C.purple, flexShrink: 0,
        }}>{device.type}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { l: 'RSSI',  v: device.rssi,          c: C.blue    },
          { l: 'MSG/S', v: device.msgPerSec,      c: C.green   },
          { l: 'BAT',   v: `${device.battery}%`,  c: batColor  },
        ].map(x => (
          <div key={x.l} style={{
            background: '#111F38', borderRadius: 8,
            padding: '8px 4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{x.l}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
        <div style={{ fontSize: 8, color: C.muted, marginBottom: 4 }}>STATUS</div>
        <div style={{
          padding: '4px 0', borderRadius: 6, textAlign: 'center',
          background: `${sc}18`, border: `1px solid ${sc}33`,
          fontSize: 9, fontWeight: 700, color: sc,
          textTransform: 'uppercase', letterSpacing: '.08em',
        }}>{device.status}</div>
      </div>
    </Card>
  )
}

function BandwidthChart() {
  const data = [2.1,2.4,2.2,2.8,2.5,3.0,2.7,2.9,2.4,2.6,2.3,2.8,2.5,2.4]
  const max = Math.max(...data), min = Math.min(...data)
  const w = 600, h = 50
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min)) * (h - 8) - 4}`
  ).join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.blue} stopOpacity=".4" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#bwGrad)" />
      <polyline points={pts} fill="none" stroke={C.blue}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [filter, setFilter]   = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get(`${API}/devices`)
        setDevices(res.data)
        setError(null)
      } catch (err) {
        setError('Failed to connect to API')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDevices()
    const id = setInterval(fetchDevices, 5000)
    return () => clearInterval(id)
  }, [])

  const filters = ['ALL','ONLINE','OFFLINE','WARNING']
  const counts = {
    ALL:     devices.length,
    ONLINE:  devices.filter(d => d.status === 'online').length,
    OFFLINE: devices.filter(d => d.status === 'offline').length,
    WARNING: devices.filter(d => d.status === 'warning').length,
  }
  const filtered = filter === 'ALL'
    ? devices
    : devices.filter(d => d.status === filter.toLowerCase())

  if (loading) return (
    <div style={{ color: C.muted, textAlign: 'center', padding: 40, fontSize: 12 }}>
      Loading devices from API...
    </div>
  )

  if (error) return (
    <div style={{
      color: C.red, textAlign: 'center', padding: 40, fontSize: 12,
      background: `${C.red}11`, borderRadius: 12, border: `1px solid ${C.red}33`,
    }}>
      ⚠ {error} — make sure the backend is running on port 5052
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 10,
              fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              border: `1px solid ${filter === f ? C.blue : C.border}`,
              background: filter === f ? `${C.blue}22` : C.card,
              color: filter === f ? C.blue : C.muted,
              transition: 'all 0.2s',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { l:`${counts.ALL} TOTAL`,     c:C.blue  },
            { l:`${counts.ONLINE} ONLINE`, c:C.green },
            { l:`${counts.WARNING} WARN`,  c:C.amber },
            { l:`${counts.OFFLINE} OFF`,   c:C.red   },
          ].map(b => (
            <span key={b.l} style={{
              fontSize: 9, padding: '4px 10px', borderRadius: 20,
              background: `${b.c}18`, border: `1px solid ${b.c}44`,
              color: b.c, fontWeight: 700,
            }}>{b.l}</span>
          ))}
        </div>
      </div>

      {/* Device Cards */}
      <div className="grid-4">
        {filtered.map(d => <DeviceCard key={d.deviceId} device={d} />)}
      </div>

      {/* Bandwidth */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '.1em' }}>
            NETWORK BANDWIDTH · LIVE
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ l:'Now',v:'2.4 Mbps' },{ l:'Peak',v:'3.1 Mbps' },{ l:'Avg',v:'2.4 Mbps' }].map(x => (
              <div key={x.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{x.v}</div>
                <div style={{ fontSize: 8, color: C.muted }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>
        <BandwidthChart />
      </Card>

    </div>
  )
}