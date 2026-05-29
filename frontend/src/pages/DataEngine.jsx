import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE as API } from '../lib/apiBase'

const C = {
  card: '#0E1A30', border: '#1A2D50',
  blue: '#3b82f6', teal: '#0ea5e9',
  green: '#10b981', amber: '#f59e0b',
  red: '#ef4444', muted: '#64748b', text: '#e2e8f0',
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
  const id = `de${color.replace('#','')}`
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

function Gauge({ value, color, label }) {
  const r = 30, cx = 38, cy = 38, sw = 6
  const ci = Math.PI * r
  const da = (value / 100) * ci
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={76} height={46} viewBox="0 0 76 46">
        <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`}
          fill="none" stroke={C.border} strokeWidth={sw} strokeLinecap="round"/>
        <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r},${cy}`}
          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${da} ${ci}`}
          style={{ filter:`drop-shadow(0 0 4px ${color})` }}/>
        <text x={cx} y={cy-1} textAnchor="middle"
          fill={C.text} fontSize="11" fontWeight="700">{value}%</text>
      </svg>
      <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
    </div>
  )
}

export default function DataEngine() {
  const [stats,  setStats]  = useState({ throughput:1200, queueDepth:800, transforms:98.1, errorRate:0.9, cpuUsage:78, memoryUsage:67, pipeline:[] })
  const [sparkA, setSparkA] = useState(Array.from({length:14}, ()=>1200))
  const [sparkB, setSparkB] = useState(Array.from({length:14}, ()=>800))
  const [sparkC, setSparkC] = useState(Array.from({length:14}, ()=>98))
  const [sparkD, setSparkD] = useState(Array.from({length:14}, ()=>0.9))

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/telemetry/engine/stats`)
      setStats(res.data)
      setSparkA(p => [...p.slice(1), res.data.throughput])
      setSparkB(p => [...p.slice(1), res.data.queueDepth])
      setSparkC(p => [...p.slice(1), res.data.transforms])
      setSparkD(p => [...p.slice(1), res.data.errorRate])
    } catch (err) {
      console.error('DataEngine error:', err)
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
        <KPICard label="THROUGHPUT"  value={stats.throughput}  unit="rec/s" delta="Processing"   color={C.blue}  spark={sparkA} />
        <KPICard label="QUEUE DEPTH" value={stats.queueDepth}  unit="msgs"  delta="⚠ Elevated"   color={C.amber} spark={sparkB} />
        <KPICard label="TRANSFORMS"  value={stats.transforms}  unit="%"     delta="Success rate" color={C.green} spark={sparkC} />
        <KPICard label="ERRORS"      value={stats.errorRate}   unit="%"     delta="Last 1hr"     color={C.red}   spark={sparkD} />
      </div>

      <div className="grid-2">
        <Card>
          <SectionTitle text="Processing Pipeline Status" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stats.pipeline?.map((s, i) => {
              const sc = s.status === 'online' ? C.green : C.amber
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: sc, boxShadow: `0 0 6px ${sc}`, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text, minWidth: 130 }}>{s.name}</span>
                    <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3 }}>
                      <div style={{
                        width: `${s.pct}%`, height: '100%',
                        background: `linear-gradient(to right, ${sc}, ${sc}88)`,
                        borderRadius: 3, boxShadow: `0 0 6px ${sc}44`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: C.blue, minWidth: 90, textAlign: 'right' }}>{s.rate}</span>
                    <span style={{ fontSize: 10, color: C.muted, minWidth: 30, textAlign: 'right' }}>{s.latency}</span>
                  </div>
                  {i < stats.pipeline.length - 1 && (
                    <div style={{ marginLeft: 4, fontSize: 10, color: C.border, lineHeight: 1 }}>↓</div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle text="Engine Resources" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Gauge value={stats.cpuUsage}    color={C.amber} label="CPU"      />
              <Gauge value={stats.memoryUsage} color={C.blue}  label="Memory"   />
              <Gauge value={44}                color={C.green} label="Disk I/O" />
              <Gauge value={29}                color={C.teal}  label="Net I/O"  />
            </div>
          </Card>

          <div style={{
            background: `${C.amber}12`, border: `1px solid ${C.amber}44`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.amber }}>AUTO-SCALE TRIGGERED</span>
            </div>
            <p style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, margin: 0 }}>
              CPU exceeded 80% threshold.<br />
              Scaling to 3 replicas.<br />
              Queue depth elevated — monitoring.
            </p>
            <div style={{
              marginTop: 10, padding: '6px 12px',
              background: `${C.amber}18`, borderRadius: 8,
              fontSize: 9, color: C.amber, fontWeight: 700, display: 'inline-block',
            }}>● SCALING IN PROGRESS</div>
          </div>

          <Card>
            <SectionTitle text="Engine Info" />
            {[
              { l:'Version',    v:'Engine v3.1.2' },
              { l:'Uptime',     v:'14d 6h 22m'    },
              { l:'Workers',    v:'3 / 8 active'  },
              { l:'Last flush', v:'2 seconds ago' },
            ].map(x => (
              <div key={x.l} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: `1px solid ${C.border}33`, fontSize: 10,
              }}>
                <span style={{ color: C.muted }}>{x.l}</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{x.v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

    </div>
  )
}