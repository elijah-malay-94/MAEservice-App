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
  const id = `g${color.replace('#', '')}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function KPICard({ label, value, unit, delta, color, icon, spark }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: '.07em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{unit}</span>
          </div>
          <div style={{ fontSize: 10, color, marginTop: 4, opacity: 0.8 }}>{delta}</div>
        </div>
        <span style={{ fontSize: 20, color }}>{icon}</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <Spark data={spark} color={color} />
      </div>
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
        <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke={C.border} strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${da} ${ci}`}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <text x={cx} y={cy - 1} textAnchor="middle"
          fill={C.text} fontSize="11" fontWeight="700">{value}%</text>
      </svg>
      <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
    </div>
  )
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: '100%', height: (d.v / max) * 54,
            background: `linear-gradient(to top, ${color}, ${color}44)`,
            borderRadius: '3px 3px 0 0',
            border: `1px solid ${color}44`,
          }} />
          <span style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{d.l}</span>
        </div>
      ))}
    </div>
  )
}

function NodeRow({ icon, name, type, status, value, proto }) {
  const sc = status === 'online' ? C.green : status === 'warning' ? C.amber : C.red
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: `1px solid ${C.border}33`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: `${C.blue}15`, border: `1px solid ${C.blue}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 9, color: C.muted }}>{type}</div>
      </div>
      {proto && (
        <span style={{
          fontSize: 8, padding: '2px 6px', borderRadius: 4,
          background: `${C.teal}18`, border: `1px solid ${C.teal}44`,
          color: C.teal, fontWeight: 700, flexShrink: 0,
        }}>{proto}</span>
      )}
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: sc, boxShadow: `0 0 6px ${sc}`,
        display: 'inline-block', flexShrink: 0,
      }} />
      <span style={{ fontSize: 11, color: '#60a5fa', minWidth: 56, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  )
}

const typeIcon = {
  'Sensor': '📡', 'Gateway': '🔀', 'MAE Core': '🖥️',
  'REST Service': '⚙️', 'Object Store': '🗄️',
  'Stream Processor': '🔧', 'Frontend CDN': '🌐',
  'External Server': '📁', 'External API': '📱',
}

export default function Dashboard() {
  const [kpi,          setKpi]          = useState({ mqttRate:120, apiRequests:340, avgLatency:17, activeNodes:0 })
  const [health,       setHealth]       = useState({ cpu:68, memory:45, disk:32, network:81 })
  const [alerts,       setAlerts]       = useState([])
  const [nodes,        setNodes]        = useState({ devices:[], summary:{} })
  const [messages,     setMessages]     = useState({ weekly:[], stats:{} })
  const [mqttMessages, setMqttMessages] = useState([])
  const [sparkA,       setSparkA]       = useState(Array.from({length:14}, ()=>120))
  const [sparkB,       setSparkB]       = useState(Array.from({length:14}, ()=>340))
  const [sparkC,       setSparkC]       = useState(Array.from({length:14}, ()=>17))
  const [sparkD,       setSparkD]       = useState(Array.from({length:14}, ()=>22))

  const fetchMqtt = async () => {
    try {
      const res = await axios.get(`${API}/mqtt/messages`)
      setMqttMessages(res.data)
    } catch (err) {
      console.error('MQTT fetch error:', err)
    }
  }

  const fetchAll = async () => {
    try {
      const [kpiRes, healthRes, alertsRes, nodesRes, msgRes] = await Promise.all([
        axios.get(`${API}/dashboard/kpi`),
        axios.get(`${API}/dashboard/health`),
        axios.get(`${API}/dashboard/alerts`),
        axios.get(`${API}/dashboard/nodes`),
        axios.get(`${API}/dashboard/messages`),
      ])
      setKpi(kpiRes.data)
      setHealth(healthRes.data)
      setAlerts(alertsRes.data)
      setNodes(nodesRes.data)
      setMessages(msgRes.data)
      setSparkA(p => [...p.slice(1), kpiRes.data.mqttRate])
      setSparkB(p => [...p.slice(1), kpiRes.data.apiRequests])
      setSparkC(p => [...p.slice(1), kpiRes.data.avgLatency])
      setSparkD(p => [...p.slice(1), kpiRes.data.activeNodes])
    } catch (err) {
      console.error('Dashboard API error:', err)
    }
  }

  useEffect(() => {
    fetchAll()
    fetchMqtt()
    const id = setInterval(() => { fetchAll(); fetchMqtt() }, 3000)
    return () => clearInterval(id)
  }, [])

  const bars = messages.weekly?.map(w => ({ l: w.day, v: w.count })) || []
  const ac = l => l === 'warning' ? C.amber : l === 'info' ? C.teal : C.green

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="grid-4">
        <KPICard label="MQTT RATE"    value={kpi.mqttRate}    unit="msg/s"  delta="↑ Live"    color={C.blue}  icon="⟳" spark={sparkA} />
        <KPICard label="API REQUESTS" value={kpi.apiRequests} unit="req/s"  delta="↑ Live"    color={C.teal}  icon="⊞" spark={sparkB} />
        <KPICard label="AVG LATENCY"  value={kpi.avgLatency}  unit="ms"     delta="↓ Live"    color={C.green} icon="◎" spark={sparkC} />
        <KPICard label="ACTIVE NODES" value={kpi.activeNodes} unit="online" delta="→ From DB" color={C.amber} icon="⬡" spark={sparkD} />
      </div>

      <div className="grid-3">
        <Card>
          <SectionTitle text="System Health" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Gauge value={health.cpu}     color={C.blue}  label="CPU"     />
            <Gauge value={health.memory}  color={C.teal}  label="Memory"  />
            <Gauge value={health.disk}    color={C.green} label="Disk"    />
            <Gauge value={health.network} color={C.amber} label="Network" />
          </div>
        </Card>

        <Card>
          <SectionTitle text="Messages · Weekly" />
          {bars.length > 0 && <BarChart data={bars} color={C.blue} />}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { l: 'Total',     v: messages.stats?.total,     c: C.blue  },
              { l: 'Delivered', v: messages.stats?.delivered, c: C.green },
              { l: 'Failed',    v: messages.stats?.failed,    c: C.red   },
              { l: 'Avg/hr',    v: messages.stats?.avgPerHr,  c: C.teal  },
            ].map(x => (
              <div key={x.l} style={{
                background: '#111F38', borderRadius: 8,
                padding: '8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: x.c }}>{x.v}</div>
                <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionTitle text="System Alerts" />
            <span style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 20,
              background: `${C.amber}18`, border: `1px solid ${C.amber}44`,
              color: C.amber, fontWeight: 700,
            }}>{alerts.filter(a => a.level === 'warning').length} WARNING</span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8,
              padding: '6px 0', borderBottom: `1px solid ${C.border}22`,
            }}>
              <span style={{ fontSize: 8, color: C.muted, paddingTop: 2, minWidth: 36 }}>
                {new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </span>
              <div style={{ width: 2, borderRadius: 1, background: ac(a.level), flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: ac(a.level), lineHeight: 1.4 }}>{a.message}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SectionTitle text="Node Status · All Components" />
        <div className="grid-2">
          {nodes.devices?.map((d, i) => (
            <NodeRow
              key={i}
              icon={typeIcon[d.type] || '📡'}
              name={d.name}
              type={d.type}
              status={d.status}
              value={`${d.msgPerSec} msg/s`}
              proto={d.type === 'Gateway' ? 'MQTT' : 'LORA'}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <SectionTitle text="Live MQTT Feed" />
          <span style={{
            fontSize:9, padding:'2px 8px', borderRadius:20,
            background:`${C.green}18`, border:`1px solid ${C.green}44`,
            color:C.green, fontWeight:700,
          }}>● LIVE</span>
        </div>
        {mqttMessages.length === 0 ? (
          <div style={{ fontSize:11, color:C.muted, textAlign:'center', padding:20 }}>
            No MQTT messages yet — run simulate to see live data
          </div>
        ) : (
          <div className="grid-2">
            {mqttMessages.slice(0,8).map((m, i) => {
              let data = {}
              try { data = JSON.parse(m.payload) } catch(e) {}
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'8px 0', borderBottom:`1px solid ${C.border}33`,
                }}>
                  <span style={{ fontSize:16 }}>📡</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.blue }}>
                      {data.deviceId || m.topic}
                    </div>
                    <div style={{ fontSize:9, color:C.muted }}>
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {data.temperature && (
                    <span style={{ fontSize:10, color:C.amber, fontWeight:700 }}>
                      {data.temperature}°C
                    </span>
                  )}
                  {data.humidity && (
                    <span style={{ fontSize:10, color:C.teal, fontWeight:700 }}>
                      {data.humidity}%
                    </span>
                  )}
                  {data.battery && (
                    <span style={{ fontSize:10, color:C.green, fontWeight:700 }}>
                      🔋{data.battery}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

    </div>
  )
}