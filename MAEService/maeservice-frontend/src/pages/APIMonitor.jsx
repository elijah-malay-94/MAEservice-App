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

function SectionTitle({ text }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: C.muted,
      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
    }}>{text}</div>
  )
}

function Spark({ data, color }) {
  const w = 110, h = 38
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 6) - 3}`
  ).join(' ')
  const id = `ap${color.replace('#','')}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function KPICard({ label, value, unit, delta, color, spark }) {
  return (
    <Card>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: '.07em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 10, color: C.muted }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10, color, marginTop: 4, opacity: 0.8 }}>{delta}</div>
      <div style={{ marginTop: 10 }}><Spark data={spark} color={color} /></div>
    </Card>
  )
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: '100%', height: (d.v / max) * 70,
            background: `linear-gradient(to top, ${color}, ${color}44)`,
            borderRadius: '3px 3px 0 0', border: `1px solid ${color}44`,
          }} />
          <span style={{ fontSize: 8, color: C.muted, marginTop: 3 }}>{d.l}</span>
        </div>
      ))}
    </div>
  )
}

const methodColor = { GET:C.green, POST:C.blue, PUT:C.amber, DELETE:C.red }

const statusCodes = [
  { l:'200 OK',      v:88, c:C.green },
  { l:'201 Created', v:9,  c:C.teal  },
  { l:'4xx Client',  v:2,  c:C.amber },
  { l:'5xx Server',  v:1,  c:C.red   },
]

const weekBars = [
  { l:'Mo',v:420 },{ l:'Tu',v:680 },{ l:'We',v:540 },
  { l:'Th',v:730 },{ l:'Fr',v:610 },{ l:'Sa',v:290 },{ l:'Su',v:380 },
]

export default function APIMonitor() {
  const [stats,  setStats]  = useState({ totalRps:340, avgLatency:17, successRate:99.1, errorRate:0.9, routes:[] })
  const [sparkA, setSparkA] = useState(Array.from({length:14}, ()=>340))
  const [sparkB, setSparkB] = useState(Array.from({length:14}, ()=>17))
  const [sparkC, setSparkC] = useState(Array.from({length:14}, ()=>99))
  const [sparkD, setSparkD] = useState(Array.from({length:14}, ()=>0.9))

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/telemetry/api/stats`)
      setStats(res.data)
      setSparkA(p => [...p.slice(1), res.data.totalRps])
      setSparkB(p => [...p.slice(1), res.data.avgLatency])
      setSparkC(p => [...p.slice(1), res.data.successRate])
      setSparkD(p => [...p.slice(1), res.data.errorRate])
    } catch (err) {
      console.error('APIMonitor error:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="grid-4">
        <KPICard label="TOTAL RPS"    value={stats.totalRps}    unit="req/s" delta="↑ Live"  color={C.blue}  spark={sparkA} />
        <KPICard label="AVG LATENCY"  value={stats.avgLatency}  unit="ms"    delta="↓ Live"  color={C.green} spark={sparkB} />
        <KPICard label="SUCCESS RATE" value={stats.successRate} unit="%"     delta="Healthy" color={C.teal}  spark={sparkC} />
        <KPICard label="ERROR RATE"   value={stats.errorRate}   unit="%"     delta="Low"     color={C.red}   spark={sparkD} />
      </div>

      <Card>
        <SectionTitle text="API Routes · Live Traffic" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr 60px 70px 50px',
          gap: 8, padding: '6px 10px',
          background: '#111F38', borderRadius: 8, marginBottom: 4,
        }}>
          {['METHOD','ENDPOINT','STATUS','LATENCY','RPS'].map(h => (
            <span key={h} style={{ fontSize: 8, fontWeight: 700, color: C.muted, letterSpacing: '.1em' }}>{h}</span>
          ))}
        </div>
        {stats.routes?.map((r, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '70px 1fr 60px 70px 50px',
            gap: 8, padding: '8px 10px',
            background: i % 2 === 0 ? '#111F3820' : 'transparent',
            borderRadius: 6, alignItems: 'center',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800,
              color: methodColor[r.method] || C.blue,
              background: `${methodColor[r.method] || C.blue}15`,
              padding: '2px 6px', borderRadius: 4, textAlign: 'center',
            }}>{r.method}</span>
            <span style={{ fontSize: 10, color: C.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.path}</span>
            <span style={{ fontSize: 10, color: C.green }}>{r.status}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{r.latency}</span>
            <span style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>{r.rps}</span>
          </div>
        ))}
      </Card>

      <div className="grid-2">
        <Card>
          <SectionTitle text="Request Volume · 7 Days" />
          <BarChart data={weekBars} color={C.blue} />
        </Card>
        <Card>
          <SectionTitle text="Status Code Distribution" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statusCodes.map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, color: C.muted, minWidth: 80 }}>{x.l}</span>
                <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4 }}>
                  <div style={{
                    width: `${x.v}%`, height: '100%',
                    background: `linear-gradient(to right, ${x.c}, ${x.c}88)`,
                    borderRadius: 4, boxShadow: `0 0 6px ${x.c}44`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: 10, color: x.c, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>
                  {x.v}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  )
}