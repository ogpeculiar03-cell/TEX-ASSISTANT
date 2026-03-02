import { useLivePrice, getSession, fmt } from './useLivePrice'

const Sparkline = ({ history, up }) => {
  if (!history.length) return null
  const W = window.innerWidth - 48, H = 52
  const prices = history.map(h => h.price)
  const min    = Math.min(...prices)
  const max    = Math.max(...prices)
  const range  = max - min || 1
  const pt     = (p, i) => `${(i / (prices.length - 1)) * W},${H - ((p - min) / range) * H}`
  const line   = prices.map(pt).join(' ')
  const fill   = prices.map(pt).join(' ') + ` ${W},${H} 0,${H}`
  const c      = up ? '#b0b0b0' : '#606060'
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c} stopOpacity="0.12" />
          <stop offset="100%" stopColor={c} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#sg)" />
      <polyline points={line} fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

const RSIBar = ({ value }) => (
  <div>
    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`, height: '100%', borderRadius: 2, transition: 'width 0.6s',
        background: value < 30 ? '#aaa' : value > 70 ? '#555' : '#777'
      }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: '#333' }}>
      <span>30</span><span>NEUTRAL</span><span>70</span>
    </div>
  </div>
)

const SignalBadge = ({ signal }) => {
  const cfg = {
    'STRONG BUY':  { border: '#555', text: '#ddd', dot: '#aaa' },
    'BUY':         { border: '#444', text: '#bbb', dot: '#888' },
    'WATCH':       { border: '#333', text: '#666', dot: '#444' },
    'SELL':        { border: '#2a2a2a', text: '#555', dot: '#383838' },
    'STRONG SELL': { border: '#252525', text: '#444', dot: '#303030' },
  }[signal] || { border: '#333', text: '#666', dot: '#444' }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 13px', borderRadius: 4,
      background: '#111', border: `1px solid ${cfg.border}`
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: cfg.text }}>{signal}</span>
    </div>
  )
}

const Stat = ({ label, value, sub }) => (
  <div style={{ padding: '12px 14px', background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 6 }}>
    <div style={{ fontSize: 9, color: '#353535', letterSpacing: 2, marginBottom: 5 }}>{label}</div>
    <div style={{ fontSize: 15, color: '#c0c0c0', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: '#3e3e3e', marginTop: 3 }}>{sub}</div>}
  </div>
)

export default function Trade({ settings }) {
  const apiKey  = settings.apiKey
  const { price, change, changeP, high, low, history, loading, error, lastUp } = useLivePrice(apiKey)
  const up      = change >= 0
  const session = getSession()

  const signal     = 'BUY'
  const rsi        = 41.2
  const confidence = 78
  const pattern    = 'Bull Flag'

  const entry = price ? parseFloat((price - 4).toFixed(2))  : null
  const sl    = price ? parseFloat((price - 14).toFixed(2)) : null
  const tp1   = price ? parseFloat((price + 14).toFixed(2)) : null
  const tp2   = price ? parseFloat((price + 29).toFixed(2)) : null
  const rr    = entry && sl && tp2 ? ((tp2 - entry) / (entry - sl)).toFixed(1) : '—'

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 9, color: '#333', letterSpacing: 3, animation: 'blink 1.5s infinite' }}>CONNECTING TO XAUUSD...</div>
    </div>
  )

  if (error) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <div style={{ fontSize: 12, color: '#555' }}>⚠ {error}</div>
      <div style={{ fontSize: 11, color: '#333', textAlign: 'center', lineHeight: 1.8 }}>
        Go to Settings → enter your<br />Twelve Data API key
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

      {/* Price hero */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #131313' }}>
        <div style={{ fontSize: 9, color: '#353535', letterSpacing: 3, marginBottom: 8 }}>XAU / USD  ·  SPOT</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 44, color: '#d0d0d0', letterSpacing: 2, lineHeight: 1 }}>
                {fmt(price)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: up ? '#999' : '#555', marginTop: 4 }}>
              {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({up ? '+' : ''}{changeP}%)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <SignalBadge signal={signal} />
            <div style={{ fontSize: 9, color: '#353535', marginTop: 6 }}>{session} · 5m</div>
          </div>
        </div>
        <Sparkline history={history} up={up} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: '#3e3e3e' }}>
          <span>L <span style={{ color: '#555' }}>${fmt(low)}</span></span>
          <span style={{ fontSize: 9, letterSpacing: 1 }}>DAY RANGE</span>
          <span>H <span style={{ color: '#777' }}>${fmt(high)}</span></span>
        </div>
        {lastUp && <div style={{ fontSize: 9, color: '#2a2a2a', marginTop: 6 }}>Updated {lastUp.toLocaleTimeString()}</div>}
      </div>

      {/* Trade levels */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #131313' }}>
        <div style={{ fontSize: 9, color: '#353535', letterSpacing: 2, marginBottom: 10 }}>ACTIVE SETUP · 5m</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
          <Stat label="ENTRY" value={`$${fmt(entry)}`} sub="5m signal" />
          <Stat label="TP1"   value={`$${fmt(tp1)}`}   sub="Partial close" />
          <Stat label="TP2"   value={`$${fmt(tp2)}`}   sub="Full target" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Stat label="STOP LOSS"  value={`$${fmt(sl)}`} />
          <Stat label="R/R RATIO"  value={`1:${rr}`} />
          <Stat label="CONFIDENCE" value={`${confidence}%`} sub={pattern} />
        </div>
      </div>

      {/* Indicators */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #131313' }}>
        <div style={{ fontSize: 9, color: '#353535', letterSpacing: 2, marginBottom: 12 }}>INDICATORS · 1H</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#444' }}>RSI (14)</span>
            <span style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{rsi}</span>
          </div>
          <RSIBar value={rsi} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'PATTERN',   value: pattern },
            { label: 'VOLUME',    value: 'Above Avg' },
            { label: 'EMA 20/50', value: 'Bullish Stack' },
            { label: 'MACD',      value: 'Bullish Cross' },
          ].map(it => (
            <div key={it.label} style={{ padding: '8px 12px', background: '#0d0d0d', border: '1px solid #191919', borderRadius: 4 }}>
              <div style={{ fontSize: 9, color: '#303030', letterSpacing: 1, marginBottom: 3 }}>{it.label}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{it.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MTF */}
      <div style={{ padding: '14px 20px' }}>
        <div style={{ fontSize: 9, color: '#353535', letterSpacing: 2, marginBottom: 10 }}>TIMEFRAME ALIGNMENT</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ tf: '1H', trend: 'BULL' }, { tf: '15m', trend: 'BULL' }, { tf: '5m', trend: 'BULL' }].map(it => (
            <div key={it.tf} style={{
              flex: 1, padding: 12, textAlign: 'center',
              background: '#0d0d0d', border: '1px solid #181818', borderRadius: 6
            }}>
              <div style={{ fontSize: 9, color: '#303030', letterSpacing: 2, marginBottom: 6 }}>{it.tf}</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>▲ {it.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
