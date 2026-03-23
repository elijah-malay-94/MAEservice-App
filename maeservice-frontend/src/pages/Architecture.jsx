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

function ArchBox({ x, y, w, h, label, sub, color, glow }) {
  return (
    <g>
      {glow && <rect x={x-4} y={y-4} width={w+8} height={h+8} rx="10" fill={color} opacity="0.08"/>}
      <rect x={x} y={y} width={w} height={h} rx="7" fill="#111F38" stroke={color} strokeWidth="1.2" strokeOpacity="0.7"/>
      <text x={x+w/2} y={sub ? y+h/2-6 : y+h/2+4} textAnchor="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="monospace">{label}</text>
      {sub && <text x={x+w/2} y={y+h/2+10} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">{sub}</text>}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, color, label, dashed }) {
  const dx = x2-x1, dy = y2-y1
  const len = Math.sqrt(dx*dx+dy*dy)
  const ux = dx/len, uy = dy/len
  const ex = x2 - ux*6, ey = y2 - uy*6
  const mx = (x1+x2)/2, my = (y1+y2)/2
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth="1.4" strokeOpacity="0.8" strokeDasharray={dashed ? '5,3' : 'none'}/>
      <polygon points={`${x2},${y2} ${x2-ux*7+uy*4},${y2-uy*7-ux*4} ${x2-ux*7-uy*4},${y2-uy*7+ux*4}`} fill={color} opacity="0.8"/>
      {label && <text x={mx} y={my-5} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" opacity="0.9">{label}</text>}
    </g>
  )
}

export default function Architecture() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <Card>
        <SectionTitle text="MAEService 2.0 · High Level Design" />
        <div className="grid-arch" style={{ marginBottom: 10 }}>
          {[
            { l:'FIELD LAYER',       c:C.muted },
            { l:'MAE SERVICE CLOUD', c:C.blue  },
            { l:'CUSTOMER',          c:C.muted },
          ].map(z => (
            <div key={z.l} style={{
              textAlign:'center', fontSize:8, fontWeight:700, color:z.c,
              letterSpacing:'.1em', borderBottom:`1px solid ${z.c}33`, paddingBottom:6,
            }}>{z.l}</div>
          ))}
        </div>
        <div style={{ overflowX:'auto' }}>
          <svg width="100%" viewBox="0 0 820 280" style={{ minWidth: 360 }}>
            <rect x="258" y="8" width="340" height="264" rx="12" fill={`${C.blue}05`} stroke={C.blue} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="6,4"/>
            <ArchBox x={10}  y={20}  w={110} h={34} label="LoRaWAN"      sub="Sensor 1"    color={C.blue}  />
            <ArchBox x={10}  y={74}  w={110} h={34} label="LoRaWAN"      sub="Sensor 2"    color={C.blue}  />
            <ArchBox x={10}  y={128} w={110} h={34} label="MAE Device"   sub="Rugged HW"   color={C.amber} glow />
            <ArchBox x={10}  y={182} w={110} h={34} label="PC / Tablet"  sub="User"        color={C.muted} />
            <ArchBox x={148} y={47}  w={96}  h={34} label="LoRaWAN"      sub="Gateway"     color={C.blue}  glow />
            <ArchBox x={272} y={18}  w={148} h={34} label="Network Server" sub="LoRaWAN NS" color={C.blue}  glow />
            <ArchBox x={272} y={72}  w={68}  h={32} label="Storage"      sub=""            color={C.teal}  />
            <ArchBox x={352} y={72}  w={68}  h={32} label="Backend API"  sub=""            color={C.green} glow />
            <ArchBox x={272} y={116} w={68}  h={32} label="Data Engine"  sub=""            color={C.amber} glow />
            <ArchBox x={352} y={116} w={68}  h={32} label="Web GUI"      sub=""            color={C.purple}/>
            <ArchBox x={272} y={162} w={148} h={32} label="Message Broker" sub="MQTT"      color={C.teal}  />
            <ArchBox x={272} y={210} w={148} h={32} label="Auth / Security" sub="JWT · TLS" color={C.red}  />
            <ArchBox x={652} y={18}  w={130} h={32} label="Customer FTP"    sub="Storage"    color={C.muted} />
            <ArchBox x={652} y={70}  w={130} h={32} label="Customer APP"    sub="Backend API" color={C.muted} />
            <ArchBox x={652} y={122} w={130} h={32} label="Customer Portal" sub="Web App"    color={C.muted} />
            <Arrow x1={120} y1={37}  x2={148} y2={60}  color={C.blue}   label="BLE"   />
            <Arrow x1={120} y1={91}  x2={148} y2={64}  color={C.blue}   dashed        />
            <Arrow x1={244} y1={64}  x2={272} y2={35}  color={C.blue}   label="MQTT"  />
            <Arrow x1={120} y1={145} x2={352} y2={88}  color={C.amber}  label="HTTPS" dashed />
            <Arrow x1={120} y1={199} x2={352} y2={132} color={C.purple} label="Web"   dashed />
            <Arrow x1={346} y1={52}  x2={306} y2={72}  color={C.teal}   label=""      />
            <Arrow x1={346} y1={52}  x2={386} y2={72}  color={C.green}  label=""      />
            <Arrow x1={420} y1={88}  x2={652} y2={34}  color={C.amber}  label="FTP"   />
            <Arrow x1={420} y1={88}  x2={652} y2={86}  color={C.green}  label="REST"  />
            <Arrow x1={420} y1={132} x2={652} y2={138} color={C.purple} label="WS"    />
            <Arrow x1={346} y1={162} x2={306} y2={148} color={C.teal}   label=""      />
            <Arrow x1={346} y1={162} x2={386} y2={148} color={C.teal}   label=""      />
          </svg>
        </div>
      </Card>

      <div className="grid-3">
        {[
          { icon:'📡', title:'Field Layer',       color:C.blue,  items:['LoRaWAN sensors transmit telemetry','MAE Device rugged hardware node','Bluetooth links field units','PC / Tablet for local access','Protocols: LoRa, BLE, HTTPS'] },
          { icon:'☁️', title:'MAE Service Cloud', color:C.teal,  items:['Network Server receives all data','Backend API handles all requests','Data Engine processes streams','Storage layer persists all records','Web GUI serves the dashboard'] },
          { icon:'📤', title:'Customer Delivery', color:C.green, items:['Customer FTP via MQTT sync','Customer APP via REST API','Customer Portal via WebSocket','Auth secured by JWT + TLS 1.3','Fully isolated per customer'] },
        ].map((layer, i) => (
          <Card key={i} style={{ border:`1px solid ${layer.color}33` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <span style={{ fontSize:22 }}>{layer.icon}</span>
              <span style={{ fontSize:13, fontWeight:800, color:layer.color }}>{layer.title}</span>
            </div>
            {layer.items.map((item, j) => (
              <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:layer.color, marginTop:4, flexShrink:0, boxShadow:`0 0 4px ${layer.color}` }}/>
                <span style={{ fontSize:10, color:C.muted, lineHeight:1.5 }}>{item}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle text="Protocol Legend" />
        <div style={{ display:'flex', gap:30, flexWrap:'wrap' }}>
          {[
            { l:'MQTT / LoRaWAN', c:C.blue   },
            { l:'HTTPS',          c:C.amber  },
            { l:'REST API',       c:C.green  },
            { l:'WebSocket',      c:C.purple },
            { l:'FTP',            c:C.teal   },
            { l:'Bluetooth BLE',  c:C.blue   },
            { l:'JWT / TLS',      c:C.red    },
          ].map(x => (
            <div key={x.l} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:2, background:x.c, boxShadow:`0 0 4px ${x.c}`, borderRadius:1 }}/>
              <span style={{ fontSize:10, color:C.muted }}>{x.l}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}