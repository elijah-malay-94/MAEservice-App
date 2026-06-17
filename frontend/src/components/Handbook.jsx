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
        body > * { display: none !important; }
        #handbook-print-root { display: block !important; }
        #handbook-print-root {
          position: fixed; inset: 0; z-index: 99999;
          background: #fff; color: #111;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          padding: 32px; overflow: visible;
          font-size: 10pt; line-height: 1.6;
        }
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
            <div style={{ borderBottom: '2px solid #f8d200', paddingBottom: 24, marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
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
              <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#64748b', flexWrap: 'wrap' }}>
                <span>IoT · LoRaWAN · MQTT · Cloud</span>
                <span>·</span>
                <span>Full Platform Documentation &amp; Technical Reference</span>
                <span>·</span>
                <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
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
              <InfoBox>MAEService 2.0 is a real-time IoT monitoring and management platform designed for industrial and enterprise environments. It provides live visibility into connected devices, MQTT telemetry streams, LoRaWAN gateways, and system health — all from a single responsive dashboard.</InfoBox>
              <p style={S.p}>The platform follows a <strong style={{ color:'#1d4ed8' }}>client-server architecture</strong>: a React frontend communicates with a .NET 10 REST API over HTTPS. The backend ingests MQTT messages from a public broker (HiveMQ), persists records to SQL Server or an in-memory store, and exposes versioned REST endpoints under <code style={{ color:'#0369a1' }}>/api/v2</code>.</p>
              <div style={S.grid2}>
                <div style={S.card}><div style={S.cardTitle}>Frontend</div><p style={{ ...S.p, margin:0 }}>React 19 SPA with Vite build tooling, React Router v7 for client-side routing, and Axios for HTTP. All UI is custom CSS-in-JS — no component library.</p></div>
                <div style={S.card}><div style={S.cardTitle}>Backend</div><p style={{ ...S.p, margin:0 }}>.NET 10 ASP.NET Core Web API with JWT authentication, Entity Framework Core, and MQTTnet for broker connectivity.</p></div>
              </div>
            </Section>

            <Section icon="🔐" title="2 · Authentication">
              <p style={S.p}>All routes are protected. On first load the app checks <code style={{ color:'#0369a1' }}>localStorage</code> for a saved JWT token. If absent the user is redirected to the Login page. Upon successful login the token, username, and role are stored in localStorage and reloaded on refresh.</p>
              <div style={S.warnBox}><p style={{ ...S.p, margin:0, color:'#92400e' }}>⚠ Demo credentials — for testing only. Change before production deployment.</p></div>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Username</th><th style={S.th}>Password</th><th style={S.th}>Role</th><th style={S.th}>Permissions</th></tr></thead>
                <tbody>
                  <Row label="admin"    value="admin123"    desc="Full read/write access to all modules" />
                  <Row label="operator" value="operator123" desc="Read access + device control" />
                  <Row label="viewer"   value="viewer123"   desc="Read-only access to dashboard and reports" />
                </tbody>
              </table>
              <p style={S.p}>The backend issues a signed JWT (HS256) with a 24-hour expiry. The secret key is configured in <code style={{ color:'#0369a1' }}>appsettings.json</code> under <code style={{ color:'#0369a1' }}>Jwt:Key</code>.</p>
            </Section>
          </Page>

          {/* ══ PAGE 3 — Dashboard ══ */}
          <Page n={3} total={8} onDownload={handleDownload}>
            <Section icon="◈" title="3 · Dashboard">
              <InfoBox>The Dashboard is the landing page after login. It auto-refreshes every 3 seconds by polling six REST endpoints and renders live KPIs, health gauges, alert feeds, node status, and the raw MQTT message stream.</InfoBox>
              <h3 style={S.h3}>3.1 KPI Cards</h3>
              <p style={S.p}>Four cards at the top display the most critical real-time metrics. Each includes a sparkline chart (SVG line + area fill) showing recent trend data.</p>
              <table style={S.table}>
                <thead><tr><th style={S.th}>KPI</th><th style={S.th}>Unit</th><th style={S.th}>Source endpoint</th></tr></thead>
                <tbody>
                  <Row label="MQTT Rate"    value="msg/s"  desc="GET /api/v2/dashboard/kpi → mqttRate" />
                  <Row label="API Requests" value="req/s"  desc="GET /api/v2/dashboard/kpi → apiRequests" />
                  <Row label="Avg Latency"  value="ms"     desc="GET /api/v2/dashboard/kpi → avgLatency" />
                  <Row label="Active Nodes" value="count"  desc="GET /api/v2/dashboard/kpi → activeNodes" />
                </tbody>
              </table>
              <h3 style={S.h3}>3.2 System Health Gauges</h3>
              <p style={S.p}>SVG arc-progress gauges for CPU, Memory, Disk, and Network utilization. Color transitions from green → amber → red. Data from <code style={{ color:'#0369a1' }}>GET /api/v2/dashboard/health</code>.</p>
              <h3 style={S.h3}>3.3 Weekly Message Bar Chart</h3>
              <p style={S.p}>An SVG bar chart showing daily message counts for the current week. Includes summary stats: Total, Delivered, Failed, and Average per hour.</p>
              <h3 style={S.h3}>3.4 System Alerts</h3>
              <p style={S.p}>A live feed showing the latest 10 alerts with timestamp and severity. Levels: <span style={S.badge('#ef4444')}>critical</span><span style={S.badge('#f59e0b')}>warning</span><span style={S.badge('#10b981')}>info</span><span style={S.badge('#3b82f6')}>success</span></p>
              <h3 style={S.h3}>3.5 Node Status Grid</h3>
              <p style={S.p}>A 2-column card grid of all registered devices and gateways with online/offline status, msg/s rate, and protocol badge (MQTT or LoRaWAN).</p>
              <h3 style={S.h3}>3.6 Live MQTT Feed</h3>
              <p style={S.p}>Scrolling table of raw broker messages: Device ID, timestamp, temperature (°C), humidity (%), battery (%). Source: <code style={{ color:'#0369a1' }}>GET /api/v2/mqtt/messages</code>.</p>
            </Section>
          </Page>

          {/* ══ PAGE 4 — Devices, Network, Data Engine ══ */}
          <Page n={4} total={8} onDownload={handleDownload}>
            <Section icon="⬡" title="4 · Devices">
              <InfoBox>Full inventory of all IoT endpoints. Devices are auto-created by the MQTT service when a new device ID is first seen in an incoming message.</InfoBox>
              <p style={S.p}>Features: device listing with status badges, last-seen timestamps, protocol labeling, and telemetry summary. Source: <code style={{ color:'#0369a1' }}>GET /api/v2/devices</code>.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Device Fields</div>
                  <ul style={S.ul}>{['Device ID (unique)','Name / Label','Status (online/offline/warning)','Protocol (MQTT/LoRaWAN)','Last seen timestamp','Messages per second','Signal strength'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Status Definitions</div>
                  <ul style={S.ul}>
                    <li style={{ ...S.li, color:'#10b981' }}>Online — active communication in last 30s</li>
                    <li style={{ ...S.li, color:'#f59e0b' }}>Warning — delayed messages or weak signal</li>
                    <li style={{ ...S.li, color:'#ef4444' }}>Offline — no messages for 5 min+</li>
                  </ul>
                </div>
              </div>
            </Section>
            <Section icon="◎" title="5 · Network">
              <InfoBox>Topology view of LoRaWAN gateways and downstream devices. Shows gateway health, connected device counts, signal quality, and uptime statistics.</InfoBox>
              <p style={S.p}>Source: <code style={{ color:'#0369a1' }}>GET /api/v2/network</code>. Each gateway card shows its IP, region, device count, and connectivity status.</p>
            </Section>
            <Section icon="◉" title="6 · Data Engine">
              <InfoBox>Exposes the pipeline that processes raw MQTT payloads into structured telemetry records. Shows ingest rate, queue depth, error rate, and storage consumption.</InfoBox>
              <p style={S.p}>The backend <strong style={{ color:'#1d4ed8' }}>MqttService</strong> subscribes to MQTT topics, parses JSON payloads, and writes <code style={{ color:'#0369a1' }}>TelemetryRecord</code> entities to the database. Up to 100 recent messages are kept in memory.</p>
              <div style={S.card}>
                <div style={S.cardTitle}>Subscribed MQTT Topics</div>
                <ul style={S.ul}>{['mae/devices/+/telemetry','mae/gateways/+/status','mae/sensors/+/data','sensors/+/data'].map(t=><li key={t} style={{ ...S.li, color:'#0369a1', fontFamily:'monospace' }}>{t}</li>)}</ul>
              </div>
            </Section>
          </Page>

          {/* ══ PAGE 5 — API Monitor, Architecture, Settings ══ */}
          <Page n={5} total={8} onDownload={handleDownload}>
            <Section icon="⊞" title="7 · API Monitor">
              <InfoBox>Live view of backend endpoint performance: request volume, average response times, error rates, and per-endpoint breakdowns.</InfoBox>
              <p style={S.p}>Useful for diagnosing latency spikes before they impact users. Metrics are polled from <code style={{ color:'#0369a1' }}>GET /api/v2/monitor/stats</code>.</p>
            </Section>
            <Section icon="⬙" title="8 · Architecture">
              <InfoBox>Visual schematic of the full system — from physical sensors, through LoRaWAN gateways and the MQTT broker, up to the .NET API and React frontend.</InfoBox>
              <p style={S.p}>A static informational view helping operators and new team members understand how data flows through the platform.</p>
              <div style={S.grid2}>
                <div style={S.card}>
                  <div style={S.cardTitle}>Data Flow</div>
                  <ul style={S.ul}>{['Sensor → LoRaWAN gateway','Gateway → MQTT broker (HiveMQ)','Broker → .NET MqttService','MqttService → SQL Server / EF Core','API → React frontend (Axios)','React → Browser (Vite SPA)'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Deployment</div>
                  <ul style={S.ul}>{['Frontend hosted on Netlify (CDN)','Backend containerized via Docker','Database: Azure SQL or local SQL Server','MQTT Broker: HiveMQ Cloud or self-hosted','CORS configured for Netlify + localhost'].map(f=><li key={f} style={S.li}>{f}</li>)}</ul>
                </div>
              </div>
            </Section>
            <Section icon="✦" title="9 · Settings">
              <p style={S.p}>The Settings page allows authorized users (Admin role) to configure platform parameters such as MQTT broker address, polling intervals, alert thresholds, and notification preferences.</p>
              <p style={S.p}>Changes are persisted via <code style={{ color:'#0369a1' }}>POST /api/v2/settings</code> and take effect without restarting the application.</p>
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
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Role</th>
                    <th style={S.th}>Dashboard</th>
                    <th style={S.th}>Devices</th>
                    <th style={S.th}>Settings</th>
                    <th style={S.th}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ ...S.td, color:'#ef4444', fontWeight:700 }}>Admin</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read + Write</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read + Write</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Full access</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ User management</td>
                  </tr>
                  <tr>
                    <td style={{ ...S.td, color:'#f59e0b', fontWeight:700 }}>Operator</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Control</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ No access</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ No access</td>
                  </tr>
                  <tr>
                    <td style={{ ...S.td, color:'#3b82f6', fontWeight:700 }}>Viewer</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ Read only</td>
                    <td style={{ ...S.td, color:'#10b981' }}>✓ View only</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ No access</td>
                    <td style={{ ...S.td, color:'#ef4444' }}>✗ No access</td>
                  </tr>
                </tbody>
              </table>
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

function buildPrintHTML() {
  return `
  <div style="font-family:'JetBrains Mono',monospace;color:#111;max-width:800px;margin:0 auto;padding:20px">
    <div style="text-align:center;border-bottom:3px solid #1d4ed8;padding-bottom:20px;margin-bottom:28px">
      <div style="display:inline-block;width:50px;height:50px;border-radius:10px;background:#1d4ed8;color:#fff;font-size:26px;font-weight:900;line-height:50px;text-align:center;margin-bottom:10px">M</div>
      <h1 style="margin:0;font-size:22px;color:#111">MAEService 2.0 — Platform Handbook</h1>
      <p style="margin:4px 0 0;font-size:11px;color:#1d4ed8;letter-spacing:.15em">FULL PLATFORM DOCUMENTATION &amp; TECHNICAL REFERENCE</p>
      <p style="margin:6px 0 0;font-size:10px;color:#666">Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
    ${printSection('1. Project Overview', `
      <p>MAEService 2.0 is a real-time IoT monitoring and management platform designed for industrial and enterprise environments. It provides live visibility into connected devices, MQTT telemetry streams, LoRaWAN gateways, and system health.</p>
      <p>Architecture: React 19 SPA frontend + .NET 10 ASP.NET Core REST API. Data flows from physical sensors through LoRaWAN gateways and an MQTT broker into the backend database, then rendered live in the browser with a 3-second polling interval.</p>
    `)}
    ${printSection('2. Authentication', `
      <p>All routes are JWT-protected. The backend issues signed tokens (HS256, 24h expiry).</p>
      <table style="width:100%;border-collapse:collapse;font-size:10px">
        <tr style="background:#f3f4f6"><th style="padding:6px 10px;text-align:left;border:1px solid #ddd">User</th><th style="padding:6px 10px;text-align:left;border:1px solid #ddd">Password</th><th style="padding:6px 10px;text-align:left;border:1px solid #ddd">Role</th></tr>
        <tr><td style="padding:5px 10px;border:1px solid #ddd">admin</td><td style="padding:5px 10px;border:1px solid #ddd">admin123</td><td style="padding:5px 10px;border:1px solid #ddd">Full access</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #ddd">operator</td><td style="padding:5px 10px;border:1px solid #ddd">operator123</td><td style="padding:5px 10px;border:1px solid #ddd">Device control</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #ddd">viewer</td><td style="padding:5px 10px;border:1px solid #ddd">viewer123</td><td style="padding:5px 10px;border:1px solid #ddd">Read only</td></tr>
      </table>
    `)}
    ${printSection('3. Dashboard', `
      <p><strong>KPI Cards:</strong> MQTT Rate (msg/s), API Requests (req/s), Avg Latency (ms), Active Nodes — each with sparkline trend chart. Auto-refreshes every 3 seconds.</p>
      <p><strong>System Health Gauges:</strong> SVG arc gauges for CPU, Memory, Disk, and Network utilization.</p>
      <p><strong>Weekly Bar Chart:</strong> Daily message counts for the current week with Total/Delivered/Failed/Avg summary.</p>
      <p><strong>System Alerts:</strong> Live feed of latest 10 alerts, color-coded by severity (critical/warning/info/success).</p>
      <p><strong>Node Status:</strong> 2-column grid of all devices and gateways with protocol badges (MQTT/LoRaWAN).</p>
      <p><strong>Live MQTT Feed:</strong> Scrolling table of raw messages with device ID, temperature, humidity, battery %.</p>
    `)}
    ${printSection('4. Devices', `
      <p>Full inventory of all IoT endpoints. Devices are auto-registered when first seen in MQTT messages. Shows: Device ID, name, status (online/warning/offline), protocol, last-seen timestamp, and messages per second.</p>
    `)}
    ${printSection('5. Network', `
      <p>Topology view of LoRaWAN gateways and their downstream sensors. Shows gateway health, connected device count, signal quality, region, and uptime. Source: GET /api/v2/network.</p>
    `)}
    ${printSection('6. Data Engine', `
      <p>Visualizes the MQTT ingest pipeline. The backend MqttService background worker subscribes to topics (mae/devices/+/telemetry, mae/gateways/+/status, mae/sensors/+/data), parses JSON payloads, and writes TelemetryRecord entities to the database. Keeps 100 recent messages in memory.</p>
    `)}
    ${printSection('7. API Monitor', `
      <p>Live view of backend endpoint performance: request volume, average response times, and error rates per endpoint. Helps diagnose latency spikes before they impact users.</p>
    `)}
    ${printSection('8. Architecture', `
      <p>Static schematic of the full system data flow: Sensor → LoRaWAN gateway → HiveMQ broker → .NET MqttService → SQL Server/EF Core → REST API → React frontend (Netlify CDN).</p>
    `)}
    ${printSection('9. Settings', `
      <p>Admin-only configuration for MQTT broker address, polling intervals, alert thresholds, and notifications. Changes persist via POST /api/v2/settings without application restart.</p>
    `)}
    ${printSection('10. Technology Stack', `
      <p><strong>Frontend:</strong> React 19.2 · React DOM 19.2 · React Router DOM 7.13 · Axios 1.13 · Vite 7.3 · ESLint 9.39</p>
      <p><strong>Backend:</strong> .NET 10 / ASP.NET Core · JWT Bearer 10.0.5 · Entity Framework Core 10.0.5 (SQL Server + InMemory) · MQTTnet 5.1</p>
      <p><strong>Languages:</strong> JavaScript (JSX) · C# · HTML5 · CSS-in-JS · SQL · JSON</p>
      <p><strong>Protocols:</strong> MQTT 5.0 · LoRaWAN 1.0 · REST/HTTP · JWT (RFC 7519) · OpenAPI 3.x · CORS</p>
      <p><strong>Infrastructure:</strong> Docker · Netlify CDN · Azure SQL / SQL Server · HiveMQ Cloud</p>
    `)}
    ${printSection('11. API Reference (Base: /api/v2)', `
      <table style="width:100%;border-collapse:collapse;font-size:10px">
        <tr style="background:#f3f4f6">
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Method</th>
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Path</th>
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Description</th>
        </tr>
        ${[
          ['POST','auth/login','Authenticate user, get JWT'],
          ['GET','dashboard/kpi','MQTT rate, API req/s, latency, active nodes'],
          ['GET','dashboard/health','CPU, memory, disk, network %'],
          ['GET','dashboard/alerts','Latest 10 system alerts'],
          ['GET','dashboard/nodes','All devices and gateways'],
          ['GET','dashboard/messages','Weekly message breakdown'],
          ['GET','devices','List all devices'],
          ['GET','devices/{id}','Single device details'],
          ['PUT','devices/{id}','Update device metadata'],
          ['DELETE','devices/{id}','Remove device'],
          ['GET','mqtt/messages','Latest 100 MQTT messages'],
        ].map(([m,p,d]) => `<tr><td style="padding:5px 10px;border:1px solid #ddd;font-weight:700;color:#1d4ed8">${m}</td><td style="padding:5px 10px;border:1px solid #ddd;font-family:monospace">/api/v2/${p}</td><td style="padding:5px 10px;border:1px solid #ddd">${d}</td></tr>`).join('')}
      </table>
    `)}
    ${printSection('12. User Roles', `
      <table style="width:100%;border-collapse:collapse;font-size:10px">
        <tr style="background:#f3f4f6">
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Role</th>
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Dashboard</th>
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Devices</th>
          <th style="padding:5px 10px;border:1px solid #ddd;text-align:left">Settings</th>
        </tr>
        <tr><td style="padding:5px 10px;border:1px solid #ddd;font-weight:700">Admin</td><td style="padding:5px 10px;border:1px solid #ddd">Read + Write</td><td style="padding:5px 10px;border:1px solid #ddd">Read + Write</td><td style="padding:5px 10px;border:1px solid #ddd">Full access</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #ddd;font-weight:700">Operator</td><td style="padding:5px 10px;border:1px solid #ddd">Read</td><td style="padding:5px 10px;border:1px solid #ddd">Control</td><td style="padding:5px 10px;border:1px solid #ddd">No access</td></tr>
        <tr><td style="padding:5px 10px;border:1px solid #ddd;font-weight:700">Viewer</td><td style="padding:5px 10px;border:1px solid #ddd">Read only</td><td style="padding:5px 10px;border:1px solid #ddd">View only</td><td style="padding:5px 10px;border:1px solid #ddd">No access</td></tr>
      </table>
    `)}
    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:2px solid #1d4ed8;font-size:9px;color:#999">
      MAEService 2.0 · Platform Handbook · Confidential · Generated ${new Date().toLocaleDateString('en-GB')}
    </div>
  </div>
  `
}

function printSection(title, content) {
  return `
    <div style="margin-bottom:24px;page-break-inside:avoid">
      <h2 style="font-size:14px;color:#1d4ed8;border-bottom:2px solid #1d4ed8;padding-bottom:6px;margin-bottom:12px">${title}</h2>
      <div style="font-size:11px;line-height:1.7;color:#333">${content}</div>
    </div>
  `
}
