import { useState, useEffect } from 'react'
import Trade from './Trade'
import Chat from './Chat'
import Settings from './Settings'
import { useLivePrice, getSession, fmt } from './useLivePrice'

// ── Bottom nav icons ──────────────────────────────────────────────────────────
const TradeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#aaa' : '#3a3a3a'} strokeWidth="1.8">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
)

const ChatIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#aaa' : '#3a3a3a'} strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const SettingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#aaa' : '#3a3a3a'} strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const TABS = [
  { id: 'trade',    label: 'Trade',    Icon: TradeIcon    },
  { id: 'chat',     label: 'TEX AI',   Icon: ChatIcon     },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
]

const DEFAULT_SETTINGS = {
  apiKey:         '6e506c44abd140d7a0b93dd88f9a7e64',
  lotSize:        5,
  maxPos:         10,
  london:         true,
  newYork:        true,
  asian:          false,
  showMTF:        true,
  showLevels:     true,
  showIndicators: true,
}

export default function App() {
  const [tab,      setTab]      = useState('trade')
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tex_settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [clock, setClock] = useState(new Date())

  const priceData = useLivePrice(settings.apiKey)

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const updateSettings = (next) => {
    setSettings(next)
    try { localStorage.setItem('tex_settings', JSON.stringify(next)) } catch {}
  }

  const { price, change } = priceData
  const up = change >= 0

  return (
    <div style={{
      height: '100dvh', background: '#090909',
      fontFamily: "'IBM Plex Mono', monospace",
      display: 'flex', flexDirection: 'column',
      color: '#888', overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { -webkit-tap-highlight-color: transparent; }
        input, button { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 2px; height: 2px; }
        ::-webkit-scrollbar-thumb { background: #252525; border-radius: 2px; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, padding: '0 20px',
        borderBottom: '1px solid #131313',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, background: '#090909'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: '#b0b0b0', letterSpacing: 5 }}>TEX</div>
          <div style={{ width: 1, height: 16, background: '#1e1e1e' }} />
          <div style={{ fontSize: 9, color: '#303030', letterSpacing: 2 }}>XAUUSD</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {price && (
            <div style={{ fontSize: 11, color: up ? '#666' : '#444', fontFamily: 'monospace' }}>
              {up ? '▲' : '▼'} ${fmt(price)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3a3a3a', animation: 'blink 2.5s infinite' }} />
            <span style={{ fontSize: 9, color: '#303030', letterSpacing: 1 }}>
              {clock.toUTCString().slice(17, 25)} UTC
            </span>
          </div>
        </div>
      </div>

      {/* ── Screen content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'trade'    && <Trade    settings={settings} />}
        {tab === 'chat'     && <Chat     priceData={priceData} settings={settings} />}
        {tab === 'settings' && <Settings settings={settings} onUpdate={updateSettings} />}
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        height: 64, display: 'flex',
        borderTop: '1px solid #131313',
        background: '#090909', flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              borderTop: `2px solid ${active ? '#444' : 'transparent'}`,
              transition: 'all 0.15s'
            }}>
              <Icon active={active} />
              <span style={{ fontSize: 9, color: active ? '#888' : '#353535', letterSpacing: 1 }}>
                {label.toUpperCase()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
