import { useEffect, useRef } from 'react'

const A4_W = 794  // px — A4 at 96 dpi

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    display: 'flex', flexDirection: 'column',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  },
  toolbar: {
    background: '#f8d200',
    borderBottom: '1px solid #d4b400',
    padding: '10px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
    zIndex: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  viewer: {
    flex: 1,
    overflowY: 'auto',
    background: '#e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px 48px',
    height: '100vh',
    boxSizing: 'border-box',
  },
  paper: {
    width: A4_W,
    maxWidth: '100%',
    background: '#ffffff',
    color: '#1e293b',
    padding: 0,
    boxShadow: '0 2px 16px rgba(0,0,0,0.15), 0 0 0 1px #d1d5db',
    minHeight: 1123,
    boxSizing: 'border-box',
    marginBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  // legacy alias kept so nothing below breaks
  modal: {},
  header: {},
  body: {},
  closeBtn: {
    background: 'transparent', border: '1px solid #b8a000',
    color: '#1a1a1a', cursor: 'pointer', borderRadius: 8,
    padding: '6px 14px', fontSize: 12,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  dlBtn: {
    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    border: '1px solid #3b82f6',
    color: '#fff', cursor: 'pointer', borderRadius: 8,
    padding: '8px 18px', fontSize: 12,
    fontFamily: 'inherit', fontWeight: 700,
    boxShadow: '0 0 14px #2563eb44',
    display: 'flex', alignItems: 'center', gap: 7,
    transition: 'all 0.2s',
  },
  h1: { fontSize: 20, fontWeight: 900, color: '#E2E8F0', margin: 0 },
  subtitle: { fontSize: 10, color: '#0ea5e9', letterSpacing: '.15em', marginTop: 2 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 11, fontWeight: 900, color: '#1d4ed8',
    letterSpacing: '.12em', textTransform: 'uppercase',
    borderBottom: '1px solid #cbd5e1', paddingBottom: 8, marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  h3: { fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8, marginTop: 16 },
  p: { fontSize: 11, lineHeight: 1.8, color: '#475569', margin: '0 0 10px' },
  ul: { margin: '0 0 10px', paddingLeft: 18 },
  li: { fontSize: 11, lineHeight: 1.8, color: '#475569', marginBottom: 2 },
  badge: (color) => ({
    display: 'inline-block', fontSize: 9, padding: '2px 8px',
    borderRadius: 10, background: `${color}18`,
    border: `1px solid ${color}44`, color: color,
    fontWeight: 700, marginRight: 5, marginBottom: 5,
  }),
  chip: {
    display: 'inline-block', fontSize: 9, padding: '3px 10px',
    borderRadius: 6, background: '#ffffff',
    border: '1px solid #cbd5e1', color: '#475569',
    marginRight: 5, marginBottom: 5,
  },
  table: {
    width: '100%', borderCollapse: 'collapse',
    fontSize: 11, marginBottom: 10,
    background: '#ffffff',
  },
  th: {
    textAlign: 'left', padding: '7px 12px',
    background: '#ffffff', color: '#1d4ed8',
    borderBottom: '2px solid #1d4ed8', fontWeight: 700,
    fontSize: 10, letterSpacing: '.08em',
  },
  td: {
    padding: '7px 12px', color: '#475569',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    verticalAlign: 'top',
  },
  infoBox: {
    background: '#ffffff', border: '1px solid #bfdbfe',
    borderLeft: '3px solid #3b82f6',
    borderRadius: 8, padding: '12px 16px', marginBottom: 14,
  },
  warnBox: {
    background: '#ffffff', border: '1px solid #fde68a',
    borderLeft: '3px solid #f59e0b',
    borderRadius: 8, padding: '12px 16px', marginBottom: 14,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  card: {
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '14px',
  },
  cardTitle: { fontSize: 10, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 },
}

const PAGE_COLORS = [
  null,
  { main: '#f8d200', bg: '#fffef0', tc: '#1a1a1a', label: 'COVER · TABLE OF CONTENTS' },
  { main: '#3b82f6', bg: '#f0f6ff', tc: '#ffffff', label: 'OVERVIEW · AUTHENTICATION' },
  { main: '#10b981', bg: '#f0fdf8', tc: '#ffffff', label: 'DASHBOARD' },
  { main: '#8b5cf6', bg: '#f6f3ff', tc: '#ffffff', label: 'DEVICES · NETWORK · DATA ENGINE' },
  { main: '#f59e0b', bg: '#fffcf0', tc: '#1a1a1a', label: 'API MONITOR · ARCHITECTURE · SETTINGS' },
  { main: '#6366f1', bg: '#f0f1ff', tc: '#ffffff', label: 'TECHNOLOGY STACK' },
  { main: '#0ea5e9', bg: '#f0faff', tc: '#ffffff', label: 'API REFERENCE' },
  { main: '#ef4444', bg: '#fff5f5', tc: '#ffffff', label: 'USER ROLES & PERMISSIONS' },
]

function Page({ n, total, children, onClose, onDownload }) {
  const c = PAGE_COLORS[n]
  const isFirst = n === 1

  const barStyle = {
    background: c.main,
    padding: '12px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
    flexShrink: 0,
  }

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: 'rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: '#fff',
      }}>M</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.tc }}>MAEService 2.0 — Handbook</div>
        <div style={{ fontSize: 8, color: c.tc, opacity: 0.75, letterSpacing: '.14em' }}>{c.label}</div>
      </div>
    </div>
  )

  return (
    <div style={{ ...S.paper, background: c.bg }}>

      {/* ── Top Bar ── */}
      <div style={barStyle}>
        {logo}
        {isFirst && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={S.dlBtn} onClick={onDownload}>⬇ Download PDF</button>
            <button
              style={{ ...S.closeBtn, color: c.tc, borderColor: `${c.tc}66` }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              onClick={onClose}
            >✕ Close</button>
          </div>
        )}
      </div>

      {/* ── Page Content ── */}
      <div style={{ flex: 1, padding: '40px 72px' }}>
        {children}
      </div>

      {/* ── Bottom Bar ── */}
      <div style={barStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: '#fff',
          }}>M</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.tc }}>MAEService 2.0 — Handbook</div>
            <div style={{ fontSize: 8, color: c.tc, opacity: 0.75, letterSpacing: '.14em' }}>
              MAEService 2.0 · Platform Handbook · Confidential
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={S.dlBtn} onClick={onDownload}>⬇ Download PDF</button>
          <span style={{
            fontSize: 9, fontWeight: 700, color: c.tc,
            background: 'rgba(0,0,0,0.2)', borderRadius: 10,
            padding: '2px 10px', letterSpacing: '.05em',
          }}>{n} / {total}</span>
        </div>
      </div>

    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div style={S.section}>
      <div style={S.sectionTitle}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoBox({ children }) {
  return <div style={S.infoBox}><p style={{ ...S.p, margin: 0, color: '#1e40af' }}>{children}</p></div>
}

function Row({ label, value, desc }) {
  return (
    <tr>
      <td style={{ ...S.td, color: '#1d4ed8', whiteSpace: 'nowrap', fontWeight: 700 }}>{label}</td>
      <td style={{ ...S.td, color: '#0369a1', fontFamily: 'monospace' }}>{value}</td>
      <td style={S.td}>{desc}</td>
    </tr>
  )
}

export default function Handbook({ onClose }) {
  const printRef = useRef()

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDownload = () => {
    const style = document.createElement('style')
    style.id = '__handbook_print__'
    style.textContent = `
      @media print {
        @page { size: A4; margin: 15mm; }
        body > * { display: none !important; }
        #handbook-print-root { display: block !important; }
        #handbook-print-root {
          background: #fff; color: #111;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 10pt; line-height: 1.6;
        }
        .hb-page { break-after: page; page-break-after: always; padding-bottom: 8mm; }
        .hb-page:last-child { break-after: auto; page-break-after: auto; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `
    document.head.appendChild(style)
    const root = document.createElement('div')
    root.id = 'handbook-print-root'
    root.style.display = 'none'
    root.innerHTML = buildPrintHTML()
    document.body.appendChild(root)
    window.print()
    setTimeout(() => {
      document.head.removeChild(style)
      document.body.removeChild(root)
    }, 1000)
  }

  return (
    <>
      <div style={S.overlay}>

        {/* ─── Viewer ─── */}
        <div style={S.viewer} ref={printRef}>

          {/* ══ PAGE 1 — Cover + TOC ══ */}
          <Page n={1} total={8} onClose={onClose} onDownload={handleDownload}>

            {/* Cover */}
            <div style={{ borderBottom: '2px solid #f8d200', paddingBottom: 24, marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10,
                  background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 900, color: '#fff', flexShrink: 0,
                }}>M</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>MAEService 2.0</div>
                  <div style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 700, letterSpacing: '.06em' }}>PLATFORM HANDBOOK</div>
                </div>
              </div>
              <p style={{ ...S.p, color:'#475569', marginBottom:12 }}>
                This handbook is the official technical and operational reference for the MAEService 2.0 platform. It covers every module, the full API surface, authentication, technology stack, and user access controls. Intended for operators, developers, and system administrators.
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[['IoT Ready','#10b981'],['LoRaWAN','#3b82f6'],['MQTT 5.0','#10b981'],['REST API','#0ea5e9'],['JWT Auth','#8b5cf6'],['Cloud Hosted','#f59e0b']].map(([l,c])=>(
                  <span key={l} style={S.badge(c)}>{l}</span>
                ))}
              </div>
            </div>

            {/* Platform at a Glance */}
            <div style={{ ...S.grid2, marginBottom:20 }}>
              {[
                { v:'6', l:'Dashboard modules', c:'#3b82f6' },
                { v:'12', l:'REST API endpoints', c:'#10b981' },
                { v:'3', l:'User roles / access levels', c:'#8b5cf6' },
                { v:'100', l:'Max MQTT messages in memory', c:'#f59e0b' },
              ].map(x=>(
                <div key={x.l} style={{ ...S.card, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:28, fontWeight:900, color:x.c, fontFamily:'monospace', lineHeight:1 }}>{x.v}</div>
                  <div style={{ fontSize:10, color:'#64748b' }}>{x.l}</div>
                </div>
              ))}
            </div>

            <Section icon="◈" title="Table of Contents">
              <div style={S.grid2}>
                {[['1','Project Overview','#3b82f6'],['2','Authentication','#0ea5e9'],['3','Dashboard','#10b981'],['4','Devices','#8b5cf6'],['5','Network','#f59e0b'],['6','Data Engine','#ef4444'],['7','API Monitor','#0ea5e9'],['8','Architecture','#10b981'],['9','Settings','#64748b'],['10','Tech Stack','#3b82f6'],['11','API Reference','#0ea5e9'],['12','User Roles','#f59e0b']].map(([n,label,color]) => (
                  <div key={n} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:6, background:'#ffffff', border:'1px solid #e2e8f0' }}>
                    <span style={{ ...S.badge(color), margin:0 }}>{n}</span>
                    <span style={{ fontSize:11, color:'#475569' }}>{label}</span>
                  </div>
                ))}
              </div>
            </Section>
          </Page>

          {/* ══ PAGE 2 — Overview + Auth ══ */}
          <Page n={2} total={8} onDownload={handleDownload}>
            <Section icon="◉" title="1 · Project Overview">
              <InfoBox>MAEService 2.0 is a real-time IoT monitoring and management platform for industrial and enterprise environments. It delivers live visibility into connected devices, MQTT telemetry streams, LoRaWAN gateways, and system health — all from a single responsive dashboard accessible from any browser.</InfoBox>
              <p style={S.p}>The platform is built on a <strong style={{ color:'#1d4ed8' }}>client-server architecture</strong>. A React 19 SPA communicates with a .NET 10 REST API over HTTPS. The backend continuously ingests MQTT messages from a HiveMQ broker, persists telemetry records to SQL Server (or an in-memory store for development), and exposes versioned REST endpoints under <code style={{ color:'#0369a1' }}>/api/v2</code>. The frontend polls these endpoints every 3 seconds for live data updates without WebSocket overhead.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Frontend Layer</div>
                  <ul style={S.ul}>
                    <li style={S.li}>React 19 SPA — component-based UI with hooks</li>
                    <li style={S.li}>Vite — sub-second HMR dev server, optimized production builds</li>
                    <li style={S.li}>React Router v7 — client-side routing, route guards</li>
                    <li style={S.li}>Axios — HTTP client with request/response interceptors</li>
                    <li style={S.li}>Pure CSS-in-JS — no third-party component library</li>
                  </ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Backend Layer</div>
                  <ul style={S.ul}>
                    <li style={S.li}>.NET 10 ASP.NET Core — REST API + background services</li>
                    <li style={S.li}>JWT Bearer auth — HS256 signed tokens, 24h expiry</li>
                    <li style={S.li}>Entity Framework Core — SQL Server + InMemory providers</li>
                    <li style={S.li}>MQTTnet 5.1 — connects to HiveMQ broker, pub/sub</li>
                    <li style={S.li}>OpenAPI — auto-generated Swagger documentation</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section icon="🔐" title="2 · Authentication">
              <p style={S.p}>All API routes and frontend pages are protected by JWT authentication. On first load, the app reads <code style={{ color:'#0369a1' }}>localStorage</code> for a cached token. If none is found, the user is redirected to the login page. After a successful login, the token, username, and role are saved to localStorage and rehydrated on every page refresh — no re-login required until the token expires.</p>
              <div style={S.warnBox}><p style={{ ...S.p, margin:0, color:'#92400e' }}>⚠ The credentials below are demo accounts for testing only. Replace the JWT secret key and remove default accounts before any production deployment.</p></div>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Username</th><th style={S.th}>Password</th><th style={S.th}>Role</th><th style={S.th}>Access Level</th></tr></thead>
                <tbody>
                  <Row label="admin"    value="admin123"    desc="Full read/write access to all modules and admin panel" />
                  <Row label="operator" value="operator123" desc="Read access to all views + device control actions" />
                  <Row label="viewer"   value="viewer123"   desc="Read-only access — dashboard and reports only" />
                </tbody>
              </table>
              <p style={S.p}>The backend signs tokens using HMAC-SHA256 (<strong>HS256</strong>) with a configurable secret set in <code style={{ color:'#0369a1' }}>appsettings.json → Jwt:Key</code>. Token expiry is 24 hours. All protected endpoints return <code style={{ color:'#0369a1' }}>401 Unauthorized</code> if the token is absent or invalid.</p>
            </Section>
          </Page>

          {/* ══ PAGE 3 — Dashboard ══ */}
          <Page n={3} total={8} onDownload={handleDownload}>
            <Section icon="◈" title="3 · Dashboard">
              <InfoBox>The Dashboard is the main landing page after login. It auto-refreshes every 3 seconds by polling six REST endpoints in parallel and renders all live data without requiring a page reload. All widgets update in-place so operators can monitor continuously without interruption.</InfoBox>

              <h3 style={S.h3}>3.1 KPI Cards</h3>
              <p style={S.p}>Four cards across the top row show the most critical platform metrics at a glance. Each card includes a <strong>sparkline trend chart</strong> (SVG line + area gradient) built from the last 20 data points, so you can see whether a metric is rising or falling without needing a separate chart view.</p>
              <table style={S.table}>
                <thead><tr><th style={S.th}>KPI</th><th style={S.th}>Unit</th><th style={S.th}>Source</th><th style={S.th}>Notes</th></tr></thead>
                <tbody>
                  <Row label="MQTT Rate"    value="msg/s"  desc="dashboard/kpi → mqttRate"    />
                  <Row label="API Requests" value="req/s"  desc="dashboard/kpi → apiRequests" />
                  <Row label="Avg Latency"  value="ms"     desc="dashboard/kpi → avgLatency"  />
                  <Row label="Active Nodes" value="count"  desc="dashboard/kpi → activeNodes" />
                </tbody>
              </table>

              <h3 style={S.h3}>3.2 System Health Gauges</h3>
              <p style={S.p}>Four SVG arc-progress gauges display server-side resource utilization. The arc fill color transitions <span style={{ color:'#10b981', fontWeight:700 }}>green</span> (0–60%) → <span style={{ color:'#f59e0b', fontWeight:700 }}>amber</span> (60–80%) → <span style={{ color:'#ef4444', fontWeight:700 }}>red</span> (80–100%). Values are read from <code style={{ color:'#0369a1' }}>GET /api/v2/dashboard/health</code>.</p>
              <div style={S.grid2}>
                {[['CPU','Current processor load across all cores'],['Memory','RAM consumption of the API process'],['Disk','Storage usage on the host volume'],['Network','Outbound bandwidth utilization %']].map(([g,d])=>(
                  <div key={g} style={{ ...S.card, padding:'8px 12px' }}>
                    <div style={S.cardTitle}>{g}</div>
                    <p style={{ ...S.p, margin:0, fontSize:10 }}>{d}</p>
                  </div>
                ))}
              </div>

              <h3 style={S.h3}>3.3 Weekly Message Bar Chart</h3>
              <p style={S.p}>An SVG bar chart rendering daily message counts for the current ISO week (Mon–Sun). Below the chart, four summary stats are shown: <strong>Total</strong> messages ingested, <strong>Delivered</strong> (processed successfully), <strong>Failed</strong> (parse or write errors), and <strong>Average</strong> messages per hour. Source: <code style={{ color:'#0369a1' }}>GET /api/v2/dashboard/messages</code>.</p>

              <h3 style={S.h3}>3.4 System Alerts</h3>
              <p style={S.p}>A live feed of the latest 10 platform alerts, newest first. Each row shows a timestamp, description, and a color-coded severity badge: <span style={S.badge('#ef4444')}>critical</span><span style={S.badge('#f59e0b')}>warning</span><span style={S.badge('#10b981')}>info</span><span style={S.badge('#3b82f6')}>success</span>. Source: <code style={{ color:'#0369a1' }}>GET /api/v2/dashboard/alerts</code>.</p>

              <h3 style={S.h3}>3.5 Node Status Grid</h3>
              <p style={S.p}>A 2-column grid of compact cards — one per registered device or gateway. Each card shows the node name, current status badge, live message rate (msg/s), and the protocol label (<span style={S.badge('#10b981')}>MQTT</span> or <span style={S.badge('#3b82f6')}>LoRaWAN</span>). Source: <code style={{ color:'#0369a1' }}>GET /api/v2/dashboard/nodes</code>.</p>

              <h3 style={S.h3}>3.6 Live MQTT Feed</h3>
              <p style={S.p}>A scrolling table of the most recent raw MQTT payloads received by the broker. Columns: <strong>Device ID</strong>, <strong>Timestamp</strong>, <strong>Temperature (°C)</strong>, <strong>Humidity (%)</strong>, <strong>Battery (%)</strong>. Up to 100 records are held in server memory and returned by <code style={{ color:'#0369a1' }}>GET /api/v2/mqtt/messages</code>. Oldest records are evicted as new ones arrive.</p>
            </Section>
          </Page>

          {/* ══ PAGE 4 — Devices, Network, Data Engine ══ */}
          <Page n={4} total={8} onDownload={handleDownload}>
            <Section icon="⬡" title="4 · Devices">
              <InfoBox>The Devices page is the full inventory of all registered IoT endpoints. Devices are auto-created by the backend MqttService the first time a previously unknown device ID appears in an incoming MQTT message — no manual registration required.</InfoBox>
              <p style={S.p}>The list view shows each device with status badges, last-seen timestamps, live message rate, and protocol label. Operators can click any device to see its detailed telemetry history. Source: <code style={{ color:'#0369a1' }}>GET /api/v2/devices</code>.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Device Record Fields</div>
                  <ul style={S.ul}>{['Device ID — unique identifier from MQTT topic','Name / Label — human-readable alias','Status badge — online / warning / offline','Protocol — MQTT or LoRaWAN','Last seen — ISO timestamp of last message','Messages/s — rolling throughput rate','Signal strength — RSSI (LoRaWAN only)'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Status Thresholds</div>
                  <ul style={S.ul}>
                    <li style={{ ...S.li, color:'#10b981', fontWeight:600 }}>Online — message received within last 30 s</li>
                    <li style={{ ...S.li, color:'#f59e0b', fontWeight:600 }}>Warning — no message for 30 s–5 min, or RSSI below –110 dBm</li>
                    <li style={{ ...S.li, color:'#ef4444', fontWeight:600 }}>Offline — silent for more than 5 minutes</li>
                  </ul>
                  <p style={{ ...S.p, margin:'10px 0 0', fontSize:10 }}>Status is re-evaluated on every 3-second poll cycle. Devices transition states automatically as messages arrive or stop.</p>
                </div>
              </div>
            </Section>

            <Section icon="◎" title="5 · Network">
              <InfoBox>The Network page provides a topology view of all LoRaWAN gateways and their downstream sensor nodes. It helps administrators identify coverage gaps, signal degradation, and gateway outages at a glance.</InfoBox>
              <p style={S.p}>Each gateway is displayed as a card showing its IP address, geographic region, number of connected devices, signal quality score (%), and current uptime. Devices that drop below acceptable signal thresholds are highlighted. Source: <code style={{ color:'#0369a1' }}>GET /api/v2/network</code>.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Gateway Card Fields</div>
                  <ul style={S.ul}>{['Gateway ID & Name','IP Address / Hostname','Geographic Region','Connected device count','Signal Quality % (avg RSSI)','Uptime (days : hours)','Connectivity status badge'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Signal Quality Ranges</div>
                  <ul style={S.ul}>
                    <li style={{ ...S.li, color:'#10b981' }}>Excellent — RSSI above –90 dBm</li>
                    <li style={{ ...S.li, color:'#0ea5e9' }}>Good — –90 to –100 dBm</li>
                    <li style={{ ...S.li, color:'#f59e0b' }}>Fair — –100 to –110 dBm</li>
                    <li style={{ ...S.li, color:'#ef4444' }}>Poor — below –110 dBm</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section icon="◉" title="6 · Data Engine">
              <InfoBox>The Data Engine page visualizes the MQTT ingest pipeline — the real-time path data takes from the broker into persistent storage. It exposes pipeline health metrics: ingest rate, queue depth, error rate, and storage consumption.</InfoBox>
              <p style={S.p}>The backend <strong style={{ color:'#1d4ed8' }}>MqttService</strong> runs as a hosted background service. It maintains a persistent connection to the HiveMQ broker, subscribes to wildcard topics, and processes each message through a parse → validate → persist pipeline. Up to 100 records are cached in memory for the live feed.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Subscribed MQTT Topics</div>
                  <ul style={S.ul}>{['mae/devices/+/telemetry','mae/gateways/+/status','mae/sensors/+/data','sensors/+/data'].map(t=><li key={t} style={{ ...S.li, color:'#0369a1', fontFamily:'monospace', fontSize:10 }}>{t}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Pipeline Stages</div>
                  <ul style={S.ul}>{['1. Receive — broker delivers message','2. Parse — JSON payload deserialized','3. Validate — required fields checked','4. Auto-register — new device IDs added','5. Persist — EF Core writes to SQL Server','6. Cache — stored in memory ring buffer'].map(s=><li key={s} style={S.li}>{s}</li>)}</ul>
                </div>
              </div>
            </Section>
          </Page>

          {/* ══ PAGE 5 — API Monitor, Architecture, Settings ══ */}
          <Page n={5} total={8} onDownload={handleDownload}>
            <Section icon="⊞" title="7 · API Monitor">
              <InfoBox>The API Monitor page provides a live view of backend endpoint performance. It is designed to surface latency regressions, error spikes, and traffic anomalies before they escalate into user-visible incidents.</InfoBox>
              <p style={S.p}>Metrics are polled from <code style={{ color:'#0369a1' }}>GET /api/v2/monitor/stats</code> on the same 3-second cycle as the Dashboard. The page shows an aggregate summary at the top and a per-endpoint breakdown table below.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Aggregate Metrics</div>
                  <ul style={S.ul}>{['Total requests per second (system-wide)','Average response time (p50 latency, ms)','95th-percentile latency (p95, ms)','Global error rate (4xx + 5xx responses %)','Active concurrent connections'].map(m=><li key={m} style={S.li}>{m}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Per-Endpoint Breakdown</div>
                  <ul style={S.ul}>{['HTTP method + path','Request count (last 60 s)','Average latency (ms)','Success rate (%)','Last called timestamp','Status code distribution'].map(m=><li key={m} style={S.li}>{m}</li>)}</ul>
                </div>
              </div>
            </Section>

            <Section icon="⬙" title="8 · Architecture">
              <InfoBox>The Architecture page is a static informational schematic of the entire MAEService 2.0 system — from physical edge sensors through the LoRaWAN radio network, cloud broker, backend API, and up to the browser-based frontend.</InfoBox>
              <p style={S.p}>This view is primarily intended for onboarding new developers and operators. It shows every major component and the direction of data flow, helping teams reason about where a problem might originate when debugging end-to-end issues.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>End-to-End Data Flow</div>
                  <ul style={S.ul}>{['1. MAE Sensor device (temperature / humidity / battery)','2. LoRaWAN radio transmission to nearest gateway','3. Gateway forwards payload to HiveMQ MQTT broker (TLS)','4. .NET MqttService receives and parses JSON message','5. EF Core writes TelemetryRecord to SQL Server','6. REST API serves data to React frontend via Axios','7. Browser renders live dashboard — refresh every 3 s'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Deployment Topology</div>
                  <ul style={S.ul}>{['React SPA → Netlify CDN (global edge)','ASP.NET Core API → Docker container','Database → Azure SQL or local SQL Server','MQTT Broker → HiveMQ Cloud (managed)','CORS origins → Netlify domain + localhost','Secrets → environment variables / Azure Key Vault'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
              </div>
            </Section>

            <Section icon="✦" title="9 · Settings">
              <p style={S.p}>The Settings page is accessible only to users with the <strong style={{ color:'#ef4444' }}>Admin</strong> role. It provides a UI for configuring platform behavior without requiring a redeployment. Changes take effect immediately and are persisted via <code style={{ color:'#0369a1' }}>POST /api/v2/settings</code>.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Configurable Parameters</div>
                  <ul style={S.ul}>{['MQTT broker host & port','MQTT username / password / TLS toggle','Dashboard polling interval (seconds)','Alert severity thresholds (CPU, memory)','Data retention period (days)','Notification email addresses'].map(p=><li key={p} style={S.li}>{p}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Access Control</div>
                  <ul style={S.ul}>
                    <li style={{ ...S.li, color:'#10b981' }}>Admin — can view and modify all settings</li>
                    <li style={{ ...S.li, color:'#ef4444' }}>Operator — settings page hidden from navigation</li>
                    <li style={{ ...S.li, color:'#ef4444' }}>Viewer — settings page hidden from navigation</li>
                  </ul>
                  <p style={{ ...S.p, margin:'8px 0 0', fontSize:10 }}>Unauthorized POST requests to /api/v2/settings return 403 Forbidden regardless of token validity.</p>
                </div>
              </div>
            </Section>
          </Page>

          {/* ══ PAGE 6 — Tech Stack ══ */}
          <Page n={6} total={8} onDownload={handleDownload}>
            <Section icon="⚙" title="10 · Technology Stack">
              <h3 style={S.h3}>Frontend</h3>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Library / Tool</th><th style={S.th}>Version</th><th style={S.th}>Purpose</th></tr></thead>
                <tbody>
                  <Row label="React"               value="19.2.0" desc="Core UI library — component tree, hooks, state management" />
                  <Row label="React DOM"            value="19.2.0" desc="Renders React components to the browser DOM" />
                  <Row label="React Router DOM"     value="7.13.1" desc="Client-side routing (SPA navigation, protected routes)" />
                  <Row label="Axios"                value="1.13.6" desc="HTTP client for REST API calls with interceptors" />
                  <Row label="Vite"                 value="7.3.1"  desc="Build tool and HMR dev server" />
                  <Row label="@vitejs/plugin-react" value="5.1.1"  desc="Babel-based React fast-refresh for Vite" />
                  <Row label="ESLint"               value="9.39.1" desc="Static code analysis and style enforcement" />
                </tbody>
              </table>
              <h3 style={S.h3}>Backend</h3>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Library / Tool</th><th style={S.th}>Version</th><th style={S.th}>Purpose</th></tr></thead>
                <tbody>
                  <Row label=".NET / ASP.NET Core"                          value="10.0"   desc="Web framework hosting the REST API and background services" />
                  <Row label="AspNetCore.Authentication.JwtBearer"           value="10.0.5" desc="JWT Bearer token middleware for endpoint authorization" />
                  <Row label="AspNetCore.OpenApi"                            value="10.0.3" desc="Auto-generates OpenAPI (Swagger) spec from controllers" />
                  <Row label="EntityFrameworkCore.SqlServer"                 value="10.0.5" desc="ORM for SQL Server database access" />
                  <Row label="EntityFrameworkCore.InMemory"                  value="10.0.5" desc="In-memory database provider for development / testing" />
                  <Row label="MQTTnet"                                       value="5.1.0"  desc="MQTT client — connects to HiveMQ broker, pub/sub" />
                </tbody>
              </table>
              <h3 style={S.h3}>Languages</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {[['JavaScript (JSX)','#f7df1e'],['C#','#9b4f96'],['HTML5','#e34f26'],['CSS-in-JS','#264de4'],['SQL','#f29111'],['JSON','#3b82f6']].map(([l,c])=><span key={l} style={S.badge(c)}>{l}</span>)}
              </div>
              <h3 style={S.h3}>Protocols &amp; Standards</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {['MQTT 5.0','LoRaWAN 1.0','REST / HTTP 1.1','JWT (RFC 7519)','CORS','WebSocket (via MQTT)','OpenAPI 3.x'].map(p=><span key={p} style={S.chip}>{p}</span>)}
              </div>
              <h3 style={S.h3}>Infrastructure &amp; DevOps</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {['Docker','Netlify (CDN)','Azure SQL / SQL Server','HiveMQ Cloud','GitHub Actions (CI)','Vite Preview'].map(p=><span key={p} style={S.chip}>{p}</span>)}
              </div>
            </Section>
          </Page>

          {/* ══ PAGE 7 — API Reference ══ */}
          <Page n={7} total={8} onDownload={handleDownload}>
            <Section icon="⊞" title="11 · API Reference">
              <InfoBox>All endpoints are versioned under <strong>/api/v2</strong> and require a valid JWT in the <strong>Authorization: Bearer &lt;token&gt;</strong> header (except /auth/login).</InfoBox>
              <h3 style={S.h3}>Authentication</h3>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Method</th><th style={S.th}>Path</th><th style={S.th}>Description</th></tr></thead>
                <tbody>
                  <Row label="POST" value="/api/v2/auth/login"   desc="Authenticate user, receive JWT token" />
                  <Row label="POST" value="/api/v2/auth/validate" desc="Validate an existing token" />
                </tbody>
              </table>
              <h3 style={S.h3}>Dashboard</h3>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Method</th><th style={S.th}>Path</th><th style={S.th}>Description</th></tr></thead>
                <tbody>
                  <Row label="GET" value="/api/v2/dashboard/kpi"      desc="MQTT rate, API req/s, latency, active nodes" />
                  <Row label="GET" value="/api/v2/dashboard/health"   desc="CPU, memory, disk, network percentages" />
                  <Row label="GET" value="/api/v2/dashboard/alerts"   desc="Latest 10 system alerts" />
                  <Row label="GET" value="/api/v2/dashboard/nodes"    desc="All devices and gateways with summary" />
                  <Row label="GET" value="/api/v2/dashboard/messages" desc="Weekly message count breakdown" />
                </tbody>
              </table>
              <h3 style={S.h3}>Devices &amp; MQTT</h3>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Method</th><th style={S.th}>Path</th><th style={S.th}>Description</th></tr></thead>
                <tbody>
                  <Row label="GET"    value="/api/v2/devices"       desc="List all registered devices" />
                  <Row label="GET"    value="/api/v2/devices/{id}"  desc="Get single device details" />
                  <Row label="PUT"    value="/api/v2/devices/{id}"  desc="Update device metadata" />
                  <Row label="DELETE" value="/api/v2/devices/{id}"  desc="Remove device from registry" />
                  <Row label="GET"    value="/api/v2/mqtt/messages" desc="Latest MQTT messages (max 100)" />
                </tbody>
              </table>
            </Section>
          </Page>

          {/* ══ PAGE 8 — Roles + Footer ══ */}
          <Page n={8} total={8} onDownload={handleDownload}>
            <Section icon="👤" title="12 · User Roles &amp; Permissions">
              <InfoBox>MAEService 2.0 uses Role-Based Access Control (RBAC). Every authenticated user is assigned exactly one role. The role is embedded in the JWT claims and validated on the backend for every protected API call — client-side navigation guards alone are not the security boundary.</InfoBox>

              <h3 style={S.h3}>12.1 Permission Matrix</h3>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Role</th>
                    <th style={S.th}>Dashboard</th>
                    <th style={S.th}>Devices</th>
                    <th style={S.th}>Network</th>
                    <th style={S.th}>Settings</th>
                    <th style={S.th}>Admin Panel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...S.td, color:'#ef4444', fontWeight:700 }}>Admin</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Full</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read + Write + Delete</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Full</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Full</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ User management</td>
                  </tr>
                  <tr>
                    <td style={{ ...S.td, color:'#f59e0b', fontWeight:700 }}>Operator</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read + Control</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ Hidden</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ No access</td>
                  </tr>
                  <tr>
                    <td style={{ ...S.td, color:'#3b82f6', fontWeight:700 }}>Viewer</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read only</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ View only</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ View only</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ Hidden</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ No access</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={S.h3}>12.2 Role Assignment</h3>
              <p style={S.p}>Roles are assigned at account creation time by an Admin user. The role string is stored in the user record and included in the JWT payload on every successful login. To change a user's role, an Admin must update the account — the user's existing token remains valid with the old role until it expires (24 hours).</p>

              <h3 style={S.h3}>12.3 Security Best Practices</h3>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Before Going to Production</div>
                  <ul style={S.ul}>{['Replace Jwt:Key with a 256-bit random secret','Remove all default demo accounts','Enable HTTPS-only in ASP.NET Core','Set SameSite=Strict on auth cookies if used','Configure CORS to only allow known origins'].map(p=><li key={p} style={S.li}>{p}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Runtime Protections</div>
                  <ul style={S.ul}>{['All API endpoints validate JWT on every request','Role claims verified server-side, not client-side','Token expiry enforced — no sliding sessions','401 returned for invalid/expired tokens','403 returned for insufficient role'].map(p=><li key={p} style={S.li}>{p}</li>)}</ul>
                </div>
              </div>

              <div style={{ marginTop:24, padding:'12px 16px', background:'#f8fafc', borderRadius:8, borderTop:'2px solid #ef4444', textAlign:'center' }}>
                <p style={{ ...S.p, margin:0, fontSize:10, color:'#64748b' }}>
                  MAEService 2.0 · Platform Handbook · Confidential · {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
                </p>
              </div>
            </Section>
          </Page>

        </div>{/* /viewer */}
      </div>{/* /overlay */}

      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  )
}

const PRINT_COLORS = [
  { main: '#f8d200', tc: '#1a1a1a', label: 'COVER · TABLE OF CONTENTS' },
  { main: '#3b82f6', tc: '#ffffff', label: 'OVERVIEW · AUTHENTICATION' },
  { main: '#10b981', tc: '#ffffff', label: 'DASHBOARD' },
  { main: '#8b5cf6', tc: '#ffffff', label: 'DEVICES · NETWORK · DATA ENGINE' },
  { main: '#f59e0b', tc: '#1a1a1a', label: 'API MONITOR · ARCHITECTURE · SETTINGS' },
  { main: '#6366f1', tc: '#ffffff', label: 'TECHNOLOGY STACK' },
  { main: '#0ea5e9', tc: '#ffffff', label: 'API REFERENCE' },
  { main: '#ef4444', tc: '#ffffff', label: 'USER ROLES & PERMISSIONS' },
]

function pBar(idx, pageNum, total) {
  const c = PRINT_COLORS[idx]
  return `<div style="background:${c.main};padding:9px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:22px;height:22px;border-radius:5px;background:rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;line-height:22px;text-align:center;">M</div>
      <span style="font-size:11px;font-weight:700;color:${c.tc};">MAEService 2.0 — Handbook</span>
      <span style="font-size:8px;color:${c.tc};opacity:0.75;letter-spacing:.12em;">${c.label}</span>
    </div>
    <span style="font-size:9px;font-weight:700;color:${c.tc};background:rgba(0,0,0,0.18);border-radius:10px;padding:2px 9px;">${pageNum} / ${total}</span>
  </div>`
}

function pSection(title, content) {
  return `<div style="margin-bottom:20px;">
    <h2 style="font-size:13px;color:#1d4ed8;border-bottom:2px solid #1d4ed8;padding-bottom:5px;margin:0 0 10px;">${title}</h2>
    <div style="font-size:10.5px;line-height:1.75;color:#333;">${content}</div>
  </div>`
}

function pTable(headers, rows) {
  const ths = headers.map(h => `<th style="padding:5px 9px;text-align:left;border:1px solid #ddd;background:#f3f4f6;font-size:9.5px;">${h}</th>`).join('')
  const trs = rows.map(cells => `<tr>${cells.map(c => `<td style="padding:5px 9px;border:1px solid #ddd;font-size:9.5px;">${c}</td>`).join('')}</tr>`).join('')
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:12px;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`
}

function buildPrintHTML() {
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const T = 8

  return `
  <!-- PAGE 1: Cover + TOC -->
  <div class="hb-page">
    ${pBar(0, 1, T)}
    <div style="text-align:center;border-bottom:3px solid #f8d200;padding-bottom:22px;margin-bottom:28px;">
      <div style="display:inline-block;width:52px;height:52px;border-radius:10px;background:#1d4ed8;color:#fff;font-size:28px;font-weight:900;line-height:52px;text-align:center;margin-bottom:10px;">M</div>
      <h1 style="margin:0;font-size:22px;color:#0f172a;">MAEService 2.0 — Platform Handbook</h1>
      <p style="margin:4px 0 0;font-size:10px;color:#1d4ed8;letter-spacing:.15em;">FULL PLATFORM DOCUMENTATION &amp; TECHNICAL REFERENCE</p>
      <p style="margin:6px 0 0;font-size:9px;color:#666;">Generated ${date}</p>
    </div>
    ${pSection('Table of Contents', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${[['1','Project Overview','#3b82f6'],['2','Authentication','#0ea5e9'],['3','Dashboard','#10b981'],['4','Devices','#8b5cf6'],['5','Network','#f59e0b'],['6','Data Engine','#ef4444'],['7','API Monitor','#0ea5e9'],['8','Architecture','#10b981'],['9','Settings','#64748b'],['10','Tech Stack','#3b82f6'],['11','API Reference','#0ea5e9'],['12','User Roles','#f59e0b']]
          .map(([n,l,c]) => `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;"><span style="background:${c}22;border:1px solid ${c}55;color:${c};font-weight:700;font-size:9px;padding:1px 7px;border-radius:10px;">${n}</span><span style="font-size:10px;color:#475569;">${l}</span></div>`).join('')}
      </div>
    `)}
  </div>

  <!-- PAGE 2: Overview + Auth -->
  <div class="hb-page">
    ${pBar(1, 2, T)}
    ${pSection('1 · Project Overview', `
      <p style="background:#eff6ff;border-left:3px solid #3b82f6;padding:10px 14px;border-radius:6px;color:#1e40af;margin-bottom:12px;">MAEService 2.0 is a real-time IoT monitoring and management platform for industrial and enterprise environments — live visibility into connected devices, MQTT telemetry streams, LoRaWAN gateways, and system health.</p>
      <p>Architecture: React 19 SPA frontend + .NET 10 ASP.NET Core REST API. Data flows from physical sensors through LoRaWAN gateways and an MQTT broker into the backend database, rendered live in the browser with a 3-second polling interval.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Frontend</strong><p style="margin:6px 0 0;font-size:10px;">React 19 SPA · Vite · React Router v7 · Axios · Custom CSS-in-JS (no component library)</p></div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Backend</strong><p style="margin:6px 0 0;font-size:10px;">.NET 10 ASP.NET Core · JWT auth · Entity Framework Core · MQTTnet for broker connectivity</p></div>
      </div>
    `)}
    ${pSection('2 · Authentication', `
      <p>All routes are protected. On first load the app checks localStorage for a saved JWT. If absent, the user is redirected to the Login page. The token, username, and role are stored in localStorage and reloaded on refresh.</p>
      <p style="background:#fffbeb;border-left:3px solid #f59e0b;padding:8px 14px;border-radius:6px;color:#92400e;margin-bottom:12px;">⚠ Demo credentials — for testing only. Change before production deployment.</p>
      ${pTable(['Username','Password','Role','Permissions'],[
        ['admin','admin123','Admin','Full read/write access to all modules'],
        ['operator','operator123','Operator','Read access + device control'],
        ['viewer','viewer123','Viewer','Read-only access to dashboard and reports'],
      ])}
      <p>The backend issues a signed JWT (HS256, 24-hour expiry). Key is set in <code>appsettings.json → Jwt:Key</code>.</p>
    `)}
  </div>

  <!-- PAGE 3: Dashboard -->
  <div class="hb-page">
    ${pBar(2, 3, T)}
    ${pSection('3 · Dashboard', `
      <p style="background:#f0fdf4;border-left:3px solid #10b981;padding:10px 14px;border-radius:6px;color:#065f46;margin-bottom:12px;">The Dashboard is the landing page after login. It auto-refreshes every 3 seconds by polling six REST endpoints and renders live KPIs, health gauges, alert feeds, node status, and the raw MQTT message stream.</p>
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 6px;">3.1 KPI Cards</h3>
      <p>Four cards display the most critical real-time metrics, each with a sparkline trend chart (SVG line + area fill).</p>
      ${pTable(['KPI','Unit','Source endpoint'],[
        ['MQTT Rate','msg/s','GET /api/v2/dashboard/kpi → mqttRate'],
        ['API Requests','req/s','GET /api/v2/dashboard/kpi → apiRequests'],
        ['Avg Latency','ms','GET /api/v2/dashboard/kpi → avgLatency'],
        ['Active Nodes','count','GET /api/v2/dashboard/kpi → activeNodes'],
      ])}
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 6px;">3.2 System Health Gauges</h3>
      <p>SVG arc-progress gauges for CPU, Memory, Disk, and Network utilization. Color transitions green → amber → red. Source: <code>GET /api/v2/dashboard/health</code>.</p>
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 6px;">3.3 Weekly Bar Chart</h3>
      <p>SVG bar chart of daily message counts for the current week. Summary stats: Total, Delivered, Failed, Average per hour.</p>
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 6px;">3.4 System Alerts</h3>
      <p>Live feed of the latest 10 alerts with timestamp and severity: <strong>critical</strong>, <strong>warning</strong>, <strong>info</strong>, <strong>success</strong>.</p>
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 6px;">3.5 Node Status Grid</h3>
      <p>2-column card grid of all registered devices and gateways: online/offline status, msg/s rate, and protocol badge (MQTT or LoRaWAN).</p>
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 6px;">3.6 Live MQTT Feed</h3>
      <p>Scrolling table of raw broker messages: Device ID, timestamp, temperature (°C), humidity (%), battery (%). Source: <code>GET /api/v2/mqtt/messages</code>.</p>
    `)}
  </div>

  <!-- PAGE 4: Devices, Network, Data Engine -->
  <div class="hb-page">
    ${pBar(3, 4, T)}
    ${pSection('4 · Devices', `
      <p style="background:#f5f3ff;border-left:3px solid #8b5cf6;padding:10px 14px;border-radius:6px;color:#4c1d95;margin-bottom:12px;">Full inventory of all IoT endpoints. Devices are auto-created by the MQTT service when a new device ID first appears in an incoming message.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Device Fields</strong><ul style="margin:6px 0 0;padding-left:16px;font-size:10px;line-height:1.8;color:#475569;"><li>Device ID (unique)</li><li>Name / Label</li><li>Status (online/offline/warning)</li><li>Protocol (MQTT/LoRaWAN)</li><li>Last seen timestamp</li><li>Messages per second</li></ul></div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Status Definitions</strong><ul style="margin:6px 0 0;padding-left:16px;font-size:10px;line-height:1.8;"><li style="color:#10b981;">Online — active in last 30s</li><li style="color:#f59e0b;">Warning — delayed or weak signal</li><li style="color:#ef4444;">Offline — no messages 5+ min</li></ul></div>
      </div>
    `)}
    ${pSection('5 · Network', `
      <p>Topology view of LoRaWAN gateways and downstream devices. Shows gateway health, connected device count, signal quality, region, and uptime statistics. Source: <code>GET /api/v2/network</code>.</p>
    `)}
    ${pSection('6 · Data Engine', `
      <p>Visualizes the MQTT ingest pipeline. The backend MqttService subscribes to MQTT topics, parses JSON payloads, and writes TelemetryRecord entities to the database. Up to 100 recent messages are kept in memory.</p>
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Subscribed MQTT Topics</strong><ul style="margin:6px 0 0;padding-left:16px;font-size:10px;line-height:1.8;font-family:monospace;color:#0369a1;"><li>mae/devices/+/telemetry</li><li>mae/gateways/+/status</li><li>mae/sensors/+/data</li><li>sensors/+/data</li></ul></div>
    `)}
  </div>

  <!-- PAGE 5: API Monitor, Architecture, Settings -->
  <div class="hb-page">
    ${pBar(4, 5, T)}
    ${pSection('7 · API Monitor', `
      <p>Live view of backend endpoint performance: request volume, average response times, error rates, and per-endpoint breakdowns. Useful for diagnosing latency spikes. Metrics polled from <code>GET /api/v2/monitor/stats</code>.</p>
    `)}
    ${pSection('8 · Architecture', `
      <p>Visual schematic of the full system — from physical sensors, through LoRaWAN gateways and the MQTT broker, up to the .NET API and React frontend. Helps operators and new team members understand data flow.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Data Flow</strong><ul style="margin:6px 0 0;padding-left:16px;font-size:10px;line-height:1.8;color:#475569;"><li>Sensor → LoRaWAN gateway</li><li>Gateway → MQTT broker (HiveMQ)</li><li>Broker → .NET MqttService</li><li>MqttService → SQL Server / EF Core</li><li>API → React frontend (Axios)</li><li>React → Browser (Vite SPA)</li></ul></div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;"><strong style="font-size:10px;color:#1d4ed8;">Deployment</strong><ul style="margin:6px 0 0;padding-left:16px;font-size:10px;line-height:1.8;color:#475569;"><li>Frontend: Netlify CDN</li><li>Backend: Docker container</li><li>Database: Azure SQL / local SQL Server</li><li>MQTT Broker: HiveMQ Cloud</li><li>CORS: Netlify + localhost origins</li></ul></div>
      </div>
    `)}
    ${pSection('9 · Settings', `
      <p>Admin-only page for configuring platform parameters: MQTT broker address, polling intervals, alert thresholds, and notification preferences. Changes persist via <code>POST /api/v2/settings</code> without restarting the application.</p>
    `)}
  </div>

  <!-- PAGE 6: Technology Stack -->
  <div class="hb-page">
    ${pBar(5, 6, T)}
    ${pSection('10 · Technology Stack', `
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:0 0 8px;">Frontend</h3>
      ${pTable(['Library / Tool','Version','Purpose'],[
        ['React','19.2.0','Core UI library — component tree, hooks, state management'],
        ['React DOM','19.2.0','Renders React components to the browser DOM'],
        ['React Router DOM','7.13.1','Client-side routing, SPA navigation, protected routes'],
        ['Axios','1.13.6','HTTP client for REST API calls with interceptors'],
        ['Vite','7.3.1','Build tool and HMR dev server'],
        ['@vitejs/plugin-react','5.1.1','Babel-based React fast-refresh for Vite'],
        ['ESLint','9.39.1','Static code analysis and style enforcement'],
      ])}
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 8px;">Backend</h3>
      ${pTable(['Library / Tool','Version','Purpose'],[
        ['.NET / ASP.NET Core','10.0','Web framework hosting the REST API and background services'],
        ['JwtBearer','10.0.5','JWT Bearer token middleware for endpoint authorization'],
        ['AspNetCore.OpenApi','10.0.3','Auto-generates OpenAPI (Swagger) spec from controllers'],
        ['EF Core SqlServer','10.0.5','ORM for SQL Server database access'],
        ['EF Core InMemory','10.0.5','In-memory database provider for development / testing'],
        ['MQTTnet','5.1.0','MQTT client — connects to HiveMQ broker, pub/sub'],
      ])}
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 8px;">Languages &amp; Protocols</h3>
      <p><strong>Languages:</strong> JavaScript (JSX) · C# · HTML5 · CSS-in-JS · SQL · JSON</p>
      <p><strong>Protocols:</strong> MQTT 5.0 · LoRaWAN 1.0 · REST/HTTP · JWT (RFC 7519) · CORS · OpenAPI 3.x</p>
      <p><strong>Infrastructure:</strong> Docker · Netlify CDN · Azure SQL / SQL Server · HiveMQ Cloud · GitHub Actions</p>
    `)}
  </div>

  <!-- PAGE 7: API Reference -->
  <div class="hb-page">
    ${pBar(6, 7, T)}
    ${pSection('11 · API Reference', `
      <p style="background:#f0f9ff;border-left:3px solid #0ea5e9;padding:10px 14px;border-radius:6px;color:#0c4a6e;margin-bottom:12px;">All endpoints versioned under <strong>/api/v2</strong>. Require <code>Authorization: Bearer &lt;token&gt;</code> header — except <code>/auth/login</code>.</p>
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:0 0 8px;">Authentication</h3>
      ${pTable(['Method','Path','Description'],[
        ['POST','/api/v2/auth/login','Authenticate user, receive JWT token'],
        ['POST','/api/v2/auth/validate','Validate an existing token'],
      ])}
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 8px;">Dashboard</h3>
      ${pTable(['Method','Path','Description'],[
        ['GET','/api/v2/dashboard/kpi','MQTT rate, API req/s, latency, active nodes'],
        ['GET','/api/v2/dashboard/health','CPU, memory, disk, network percentages'],
        ['GET','/api/v2/dashboard/alerts','Latest 10 system alerts'],
        ['GET','/api/v2/dashboard/nodes','All devices and gateways with summary'],
        ['GET','/api/v2/dashboard/messages','Weekly message count breakdown'],
      ])}
      <h3 style="font-size:11px;font-weight:700;color:#334155;margin:14px 0 8px;">Devices &amp; MQTT</h3>
      ${pTable(['Method','Path','Description'],[
        ['GET','/api/v2/devices','List all registered devices'],
        ['GET','/api/v2/devices/{id}','Get single device details'],
        ['PUT','/api/v2/devices/{id}','Update device metadata'],
        ['DELETE','/api/v2/devices/{id}','Remove device from registry'],
        ['GET','/api/v2/mqtt/messages','Latest MQTT messages (max 100)'],
      ])}
    `)}
  </div>

  <!-- PAGE 8: User Roles -->
  <div class="hb-page">
    ${pBar(7, 8, T)}
    ${pSection('12 · User Roles &amp; Permissions', `
      ${pTable(['Role','Dashboard','Devices','Settings','Admin'],[
        ['Admin','✓ Read + Write','✓ Read + Write','✓ Full access','✓ User management'],
        ['Operator','✓ Read','✓ Control','✗ No access','✗ No access'],
        ['Viewer','✓ Read only','✓ View only','✗ No access','✗ No access'],
      ])}
    `)}
    <div style="text-align:center;margin-top:40px;padding-top:16px;border-top:2px solid #ef4444;font-size:9px;color:#999;">
      MAEService 2.0 · Platform Handbook · Confidential · Generated ${date}
    </div>
  </div>
  `
}
