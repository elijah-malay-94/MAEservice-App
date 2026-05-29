const items = [
  '● MQTT 127 msg/s',
  '● Gateway EU-868: Online',
  '● API 344 rps',
  '● Latency 17ms',
  '● Storage 42.3 GB',
  '● Data Engine: Running',
  '● FTP Sync: OK',
  '● 24 Devices Active',
]

export default function Ticker() {
  return (
    <div style={{
      height: 24,
      background: 'rgba(37,99,235,0.1)',
      borderBottom: '1px solid #1A2D50',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* LIVE badge */}
      <div style={{
        background: '#2563eb',
        padding: '0 12px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontSize: 9,
        fontWeight: 800,
        color: '#f0e8e8',
        flexShrink: 0,
        letterSpacing: '0.1em',
      }}>LIVE</div>

      {/* Scrolling text */}
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div style={{
          display: 'inline-flex',
          gap: 40,
          fontSize: 9,
          color: '#60a5fa',
          whiteSpace: 'nowrap',
          animation: 'ticker 20s linear infinite',
          paddingLeft: 20,
        }}>
          {[...items, ...items].map((t, i) => (
            <span key={i} style={{ opacity: 0.8 }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}