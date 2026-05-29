import { useState } from 'react'

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

function SectionTitle({ text, color }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: color || C.muted,
      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
    }}>{text}</div>
  )
}

function InfoRow({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: `1px solid ${C.border}33`, fontSize: 11,
    }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: color || C.text, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 36, height: 20, borderRadius: 10,
      background: on ? C.blue : C.border,
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.3s', flexShrink: 0,
      boxShadow: on ? `0 0 8px ${C.blue}66` : 'none',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: on ? 19 : 3, transition: 'left 0.3s',
      }}/>
    </div>
  )
}

function ToggleRow({ label, sub, on, onChange }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: `1px solid ${C.border}33`,
    }}>
      <div>
        <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

function StatusDot({ status }) {
  const c = status === 'connected' ? C.green : status === 'warning' ? C.amber : C.red
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:c, boxShadow:`0 0 5px ${c}`, display:'inline-block' }}/>
      <span style={{ fontSize:10, color:c, fontWeight:600, textTransform:'capitalize' }}>{status}</span>
    </div>
  )
}

export default function Settings() {
  const [notifs, setNotifs] = useState({ email:true, slack:true, webhook:true, sms:false, desktop:true })
  const [security, setSecurity] = useState({ tls:true, jwt:true, rateLimit:true, ipFilter:false, audit:true })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="grid-2">
        <Card>
          <SectionTitle text="Platform Info" color={C.blue} />
          <InfoRow label="Product"     value="MAEService 2.0"          />
          <InfoRow label="Version"     value="v2.0.1"  color={C.blue}  />
          <InfoRow label="Build"       value="20250309"                />
          <InfoRow label="Environment" value="Production" color={C.green} />
          <InfoRow label="Runtime"     value="Node.js 20 LTS"          />
          <InfoRow label="Frontend"    value="React 18 + Vite 5"       />
          <InfoRow label="Uptime"      value="14d 6h 22m" color={C.green} />
          <InfoRow label="Last Deploy" value="2025-03-09 08:14 UTC"    />
        </Card>

        <Card>
          <SectionTitle text="Connections" color={C.teal} />
          {[
            { l:'MQTT Broker',   s:'connected' },
            { l:'FTP Server',    s:'connected' },
            { l:'Customer APP',  s:'connected' },
            { l:'Data Engine',   s:'connected' },
            { l:'Webhook',       s:'connected' },
            { l:'Customer FTP',  s:'connected' },
            { l:'Storage Layer', s:'connected' },
            { l:'Auth Service',  s:'warning'   },
          ].map((x, i) => (
            <div key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'9px 0', borderBottom:`1px solid ${C.border}33`, fontSize:11,
            }}>
              <span style={{ color:C.muted }}>{x.l}</span>
              <StatusDot status={x.s} />
            </div>
          ))}
        </Card>
      </div>

      <div className="grid-2">
        <Card>
          <SectionTitle text="Security" color={C.red} />
          <ToggleRow label="TLS 1.3"           sub="Encrypt all connections"         on={security.tls}       onChange={v => setSecurity(s => ({...s, tls:v}))}       />
          <ToggleRow label="JWT Authentication" sub="Token based auth on all routes"  on={security.jwt}       onChange={v => setSecurity(s => ({...s, jwt:v}))}       />
          <ToggleRow label="Rate Limiting"      sub="Max 1000 req/min per client"     on={security.rateLimit} onChange={v => setSecurity(s => ({...s, rateLimit:v}))} />
          <ToggleRow label="IP Allowlist"       sub="Restrict access by IP range"     on={security.ipFilter}  onChange={v => setSecurity(s => ({...s, ipFilter:v}))}  />
          <ToggleRow label="Audit Logging"      sub="Log all admin actions"           on={security.audit}     onChange={v => setSecurity(s => ({...s, audit:v}))}     />
          <div style={{ marginTop:14 }}>
            <InfoRow label="API Keys Active" value="4"       color={C.blue}  />
            <InfoRow label="Last Audit"      value="Today"   color={C.green} />
            <InfoRow label="Failed Logins"   value="0 today" color={C.green} />
          </div>
        </Card>

        <Card>
          <SectionTitle text="Notifications" color={C.amber} />
          <ToggleRow label="Email Alerts"  sub="Critical system alerts via email"      on={notifs.email}   onChange={v => setNotifs(n => ({...n, email:v}))}   />
          <ToggleRow label="Slack"         sub="Post alerts to #mae-alerts channel"    on={notifs.slack}   onChange={v => setNotifs(n => ({...n, slack:v}))}   />
          <ToggleRow label="Webhook"       sub="POST to custom endpoint on events"     on={notifs.webhook} onChange={v => setNotifs(n => ({...n, webhook:v}))} />
          <ToggleRow label="SMS Alerts"    sub="Critical alerts via SMS"               on={notifs.sms}     onChange={v => setNotifs(n => ({...n, sms:v}))}     />
          <ToggleRow label="Desktop Push"  sub="Browser push notifications"            on={notifs.desktop} onChange={v => setNotifs(n => ({...n, desktop:v}))} />
          <div style={{ marginTop:14 }}>
            <InfoRow label="Alert Threshold" value="CPU > 80%"     color={C.amber} />
            <InfoRow label="Quiet Hours"     value="00:00 – 06:00"                 />
            <InfoRow label="Last Alert"      value="12:41 today"   color={C.amber} />
          </div>
        </Card>
      </div>

      <div className="grid-3">
        <Card>
          <SectionTitle text="API Keys" color={C.purple} />
          {[
            { name:'Production Key', last:'••••a3f2', used:'2 min ago',  c:C.green },
            { name:'Staging Key',    last:'••••b7c1', used:'1 hr ago',   c:C.green },
            { name:'Read Only Key',  last:'••••d9e4', used:'3 days ago', c:C.muted },
            { name:'Webhook Key',    last:'••••f1a8', used:'Just now',   c:C.green },
          ].map((k, i) => (
            <div key={i} style={{ padding:'10px 0', borderBottom:`1px solid ${C.border}33` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:11, fontWeight:600, color:C.text }}>{k.name}</span>
                <span style={{ fontSize:8, padding:'1px 7px', borderRadius:10, background:`${C.purple}18`, border:`1px solid ${C.purple}33`, color:C.purple }}>ACTIVE</span>
              </div>
              <div style={{ fontSize:9, color:C.muted }}>{k.last}</div>
              <div style={{ fontSize:9, color:k.c, marginTop:2 }}>Used {k.used}</div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle text="Storage" color={C.teal} />
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <div style={{ fontSize:32, fontWeight:900, color:C.teal }}>42.3</div>
            <div style={{ fontSize:10, color:C.muted }}>GB used of 100 GB</div>
            <div style={{ marginTop:10, height:8, background:C.border, borderRadius:4, overflow:'hidden' }}>
              <div style={{ width:'42.3%', height:'100%', background:`linear-gradient(to right, ${C.teal}, ${C.blue})`, borderRadius:4, boxShadow:`0 0 8px ${C.teal}44` }}/>
            </div>
          </div>
          <InfoRow label="Messages stored"  value="1.24M"       color={C.blue}  />
          <InfoRow label="Retention policy" value="90 days"                     />
          <InfoRow label="Compression"      value="Enabled"     color={C.green} />
          <InfoRow label="Backup"           value="Daily 02:00"                 />
          <InfoRow label="Last backup"      value="Success ✓"   color={C.green} />
        </Card>

        <Card>
          <SectionTitle text="System Actions" color={C.red} />
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { l:'Restart Data Engine', c:C.amber,  icon:'🔄' },
              { l:'Clear Cache',         c:C.blue,   icon:'🗑️' },
              { l:'Export Logs',         c:C.teal,   icon:'📥' },
              { l:'Run Diagnostics',     c:C.green,  icon:'🔍' },
              { l:'Backup Now',          c:C.purple, icon:'💾' },
              { l:'Emergency Stop',      c:C.red,    icon:'🛑' },
            ].map((a, i) => (
              <button key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', borderRadius:8, cursor:'pointer',
                background:`${a.c}12`, border:`1px solid ${a.c}33`,
                color:a.c, fontSize:11, fontWeight:600,
                fontFamily:'inherit', textAlign:'left', transition:'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${a.c}22`}
                onMouseLeave={e => e.currentTarget.style.background = `${a.c}12`}
              >
                <span style={{ fontSize:14 }}>{a.icon}</span>{a.l}
              </button>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}