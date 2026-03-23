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
  const id = `nw${color.replace('#','')}`
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

function LiveChart({ data, color }) {
  const w = 600, h = 60
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 8) - 4}`
  ).join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#lcGrad)"/>
      <polyline points={pts} fill="none" stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Network() {
  const [status,    setStatus]    = useState({ signalStrength:-72, packetLoss:0.8, gatewayUptime:99.5, bandwidth:2.4, protocols:[] })
  const [gateways,  setGateways]  = useState([])
  const [events,    setEvents]    = useState([])
  const [chartData, setChartData] = useState(Array.from({length:20}, ()=>2.2))
  const [sparkA,    setSparkA]    = useState(Array.from({length:14}, ()=>-72))
  const [sparkB,    setSparkB]    = useState(Array.from({length:14}, ()=>0.8))
  const [sparkC,    setSparkC]    = useState(Array.from({length:14}, ()=>99.5))
  const [sparkD,    setSparkD]    = useState(Array.from({length:14}, ()=>2.4))

  const fetchAll = async () => {
    try {
      const [statusRes, gatewaysRes, eventsRes] = await Promise.all([
        axios.get(`${API}/network/status`),
        axios.get(`${API}/network/gateways`),
        axios.get(`${API}/network/events`),
      ])
      setStatus(statusRes.data)
      setGateways(gatewaysRes.data)
      setEvents(eventsRes.data)
      setChartData(p => [...p.slice(1), statusRes.data.bandwidth])
      setSparkA(p => [...p.slice(1), statusRes.data.signalStrength])
      setSparkB(p => [...p.slice(1), statusRes.data.packetLoss])
      setSparkC(p => [...p.slice(1), statusRes.data.gatewayUptime])
      setSparkD(p => [...p.slice(1), statusRes.data.bandwidth])
    } catch (err) {
      console.error('Network API error:', err)
    }
  }

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 3000)
    return () => clearInterval(id)
  }, [])

  const ec = t => t === 'warning' ? C.amber : t === 'success' ? C.green : C.teal

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="grid-4">
        <KPICard label="SIGNAL STRENGTH" value={status.signalStrength} unit="dBm"  delta="Live" color={C.blue}  spark={sparkA} />
        <KPICard label="PACKET LOSS"     value={status.packetLoss}     unit="%"    delta="Live" color={C.amber} spark={sparkB} />
        <KPICard label="GATEWAY UPTIME"  value={status.gatewayUptime}  unit="%"    delta="Live" color={C.green} spark={sparkC} />
        <KPICard label="BANDWIDTH"       value={status.bandwidth}      unit="Mbps" delta="Live" color={C.teal}  spark={sparkD} />
      </div>

      <div className="grid-2">
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
            <SectionTitle text="Live Bandwidth" />
            <div style={{ display:'flex', gap:20 }}>
              {[
                { l:'Now',  v:`${chartData[chartData.length-1].toFixed(1)} Mbps` },
                { l:'Peak', v:'3.2 Mbps' },
                { l:'Avg',  v:'2.4 Mbps' },
              ].map(x => (
                <div key={x.l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.blue }}>{x.v}</div>
                  <div style={{ fontSize:8, color:C.muted }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>
          <LiveChart data={chartData} color={C.blue} />
          <div style={{ marginTop:16 }}>
            <SectionTitle text="Protocol Distribution" />
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {status.protocols?.map(p => (
                <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:10, color:C.muted, minWidth:40 }}>{p.name}</span>
                  <div style={{ flex:1, height:8, background:C.border, borderRadius:4 }}>
                    <div style={{
                      width:`${p.percent}%`, height:'100%',
                      background:`linear-gradient(to right, ${C.blue}, ${C.teal})`,
                      borderRadius:4, transition:'width 0.6s ease',
                    }}/>
                  </div>
                  <span style={{ fontSize:10, color:C.blue, fontWeight:700, minWidth:30, textAlign:'right' }}>{p.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle text="Connection Events" />
          {events.map((e, i) => (
            <div key={i} style={{
              display:'flex', gap:8, padding:'7px 0',
              borderBottom:`1px solid ${C.border}22`,
            }}>
              <span style={{ fontSize:8, color:C.muted, paddingTop:2, minWidth:36 }}>{e.time}</span>
              <div style={{ width:2, borderRadius:1, background:ec(e.type), flexShrink:0 }}/>
              <span style={{ fontSize:10, color:ec(e.type), lineHeight:1.4 }}>{e.msg}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SectionTitle text="Gateway Status · All 7 Continents" />
        <div className="grid-4">
          {gateways.map((g, i) => {
            const sc = g.status === 'online' ? C.green : g.status === 'warning' ? C.amber : C.red
            return (
              <div key={i} style={{
                background:'#111F38', border:`1px solid ${sc}44`,
                borderRadius:10, padding:'14px 16px',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{
                  position:'absolute', top:0, left:0, right:0, height:2,
                  background:`linear-gradient(to right, ${sc}, transparent)`,
                }}/>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{g.gatewayId}</span>
                  <span style={{
                    width:8, height:8, borderRadius:'50%',
                    background:sc, boxShadow:`0 0 6px ${sc}`,
                    display:'inline-block', marginTop:3,
                  }}/>
                </div>
                <div style={{ fontSize:9, color:C.muted, marginBottom:10 }}>🌍 {g.region}</div>
                {[
                  { l:'Devices', v: g.status === 'offline' ? '—' : g.deviceCount },
                  { l:'Uptime',  v: g.uptime },
                  { l:'RSSI',    v: g.rssi   },
                ].map(x => (
                  <div key={x.l} style={{
                    display:'flex', justifyContent:'space-between',
                    padding:'5px 0', borderBottom:`1px solid ${C.border}33`, fontSize:10,
                  }}>
                    <span style={{ color:C.muted }}>{x.l}</span>
                    <span style={{ color:C.text, fontWeight:600 }}>{x.v}</span>
                  </div>
                ))}
                <div style={{
                  marginTop:10, textAlign:'center', padding:'4px 0', borderRadius:6,
                  background:`${sc}18`, border:`1px solid ${sc}33`,
                  fontSize:9, fontWeight:700, color:sc,
                  textTransform:'uppercase', letterSpacing:'.08em',
                }}>{g.status}</div>
              </div>
            )
          })}
        </div>
      </Card>

    </div>
  )
}