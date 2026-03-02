import { useState } from 'react'

const Row = ({ label, sub, children }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', borderBottom: '1px solid #111'
  }}>
    <div>
      <div style={{ fontSize: 13, color: '#777' }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#383838', marginTop: 3 }}>{sub}</div>}
    </div>
    {children}
  </div>
)

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
    background: value ? '#444' : '#1a1a1a',
    border: `1px solid ${value ? '#555' : '#252525'}`,
    position: 'relative', transition: 'all 0.2s'
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: value ? '#bbb' : '#383838',
      position: 'absolute', top: 2,
      left: value ? 22 : 2, transition: 'all 0.2s'
    }} />
  </div>
)

const SectionHeader = ({ title }) => (
  <div style={{ padding: '20px 20px 8px', fontSize: 9, color: '#353535', letterSpacing: 3 }}>
    {title}
  </div>
)

export default function Settings({ settings, onUpdate }) {
  const [apiKey,    setApiKey]    = useState(settings.apiKey || '')
  const [showKey,   setShowKey]   = useState(false)
  const [saved,     setSaved]     = useState(false)

  const saveKey = () => {
    onUpdate({ ...settings, apiKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #131313' }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: '#888', letterSpacing: 4 }}>SETTINGS</div>
        <div style={{ fontSize: 10, color: '#333', marginTop: 4 }}>TEX Sniper System v1.0</div>
      </div>

      {/* API Key */}
      <SectionHeader title="DATA SOURCE" />
      <div style={{ margin: '0 20px 4px', padding: 16, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8 }}>
        <div style={{ fontSize: 10, color: '#353535', letterSpacing: 2, marginBottom: 10 }}>TWELVE DATA API KEY</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Paste your API key here"
            style={{
              flex: 1, padding: '10px 12px',
              background: '#111', border: '1px solid #222', borderRadius: 6,
              color: '#888', fontFamily: 'inherit', fontSize: 12, outline: 'none'
            }}
          />
          <button onClick={() => setShowKey(!showKey)} style={{
            padding: '10px 12px', background: '#111', border: '1px solid #222',
            borderRadius: 6, color: '#555', cursor: 'pointer', fontSize: 14
          }}>{showKey ? '🙈' : '👁'}</button>
        </div>
        <button onClick={saveKey} style={{
          width: '100%', padding: '10px', background: saved ? '#1a1a1a' : '#141414',
          border: `1px solid ${saved ? '#333' : '#222'}`, borderRadius: 6,
          color: saved ? '#888' : '#555', fontFamily: 'inherit', fontSize: 11,
          letterSpacing: 2, cursor: 'pointer', transition: 'all 0.2s'
        }}>
          {saved ? '✓ SAVED' : 'SAVE KEY'}
        </button>
        <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 10, lineHeight: 1.7 }}>
          Free key at twelvedata.com — 800 requests/day included.<br />
          TEX refreshes price every 60 seconds (~24 requests/day).
        </div>
      </div>

      {/* Instrument */}
      <SectionHeader title="INSTRUMENT" />
      <div style={{ margin: '0 20px 4px', padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#777' }}>XAUUSD</div>
            <div style={{ fontSize: 10, color: '#383838', marginTop: 2 }}>Gold / US Dollar · Active</div>
          </div>
          <div style={{ fontSize: 10, color: '#444', padding: '4px 10px', border: '1px solid #252525', borderRadius: 4 }}>ACTIVE</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: '#2a2a2a' }}>
          More instruments (BTCUSD, US30, BTCXAU) coming in v2.0
        </div>
      </div>

      {/* Risk */}
      <SectionHeader title="RISK MANAGEMENT" />
      <div style={{ background: '#0a0a0a', border: '1px solid #141414', margin: '0 20px', borderRadius: 8, overflow: 'hidden' }}>
        <Row label="Default Lot Size" sub="Per trade execution">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => onUpdate({ ...settings, lotSize: Math.max(0.01, (settings.lotSize || 5) - 0.5) })} style={btnStyle}>−</button>
            <span style={{ fontSize: 13, color: '#777', minWidth: 36, textAlign: 'center' }}>{(settings.lotSize || 5).toFixed(2)}</span>
            <button onClick={() => onUpdate({ ...settings, lotSize: (settings.lotSize || 5) + 0.5 })} style={btnStyle}>+</button>
          </div>
        </Row>
        <Row label="Max Positions" sub="Simultaneous open trades">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => onUpdate({ ...settings, maxPos: Math.max(1, (settings.maxPos || 10) - 1) })} style={btnStyle}>−</button>
            <span style={{ fontSize: 13, color: '#777', minWidth: 24, textAlign: 'center' }}>{settings.maxPos || 10}</span>
            <button onClick={() => onUpdate({ ...settings, maxPos: Math.min(20, (settings.maxPos || 10) + 1) })} style={btnStyle}>+</button>
          </div>
        </Row>
      </div>

      {/* Session */}
      <SectionHeader title="SESSION FILTER" />
      <div style={{ background: '#0a0a0a', border: '1px solid #141414', margin: '0 20px', borderRadius: 8, overflow: 'hidden' }}>
        <Row label="London Session" sub="08:00 – 16:00 UTC">
          <Toggle value={settings.london !== false} onChange={v => onUpdate({ ...settings, london: v })} />
        </Row>
        <Row label="New York Session" sub="13:00 – 21:00 UTC">
          <Toggle value={settings.newYork !== false} onChange={v => onUpdate({ ...settings, newYork: v })} />
        </Row>
        <Row label="Asian Session" sub="00:00 – 08:00 UTC — low volume">
          <Toggle value={settings.asian === true} onChange={v => onUpdate({ ...settings, asian: v })} />
        </Row>
      </div>

      {/* Display */}
      <SectionHeader title="DISPLAY" />
      <div style={{ background: '#0a0a0a', border: '1px solid #141414', margin: '0 20px', borderRadius: 8, overflow: 'hidden' }}>
        <Row label="Show MTF Panel" sub="1H · 15m · 5m alignment">
          <Toggle value={settings.showMTF !== false} onChange={v => onUpdate({ ...settings, showMTF: v })} />
        </Row>
        <Row label="Show Trade Levels" sub="Entry · SL · TP1 · TP2">
          <Toggle value={settings.showLevels !== false} onChange={v => onUpdate({ ...settings, showLevels: v })} />
        </Row>
        <Row label="Show Indicators" sub="RSI · Pattern · EMA · MACD">
          <Toggle value={settings.showIndicators !== false} onChange={v => onUpdate({ ...settings, showIndicators: v })} />
        </Row>
      </div>

      {/* About */}
      <SectionHeader title="ABOUT" />
      <div style={{ margin: '0 20px', padding: 16, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8 }}>
        {[
          { label: 'Version',    value: '1.0.0' },
          { label: 'Instrument', value: 'XAUUSD' },
          { label: 'Strategy',   value: 'S&R + MTF Confluence' },
          { label: 'Timeframes', value: '1H · 15m · 5m' },
          { label: 'Sessions',   value: 'London · New York' },
          { label: 'Data',       value: 'Twelve Data API' },
        ].map(it => (
          <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#383838' }}>{it.label}</span>
            <span style={{ fontSize: 11, color: '#666' }}>{it.value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', textAlign: 'center', fontSize: 9, color: '#222', letterSpacing: 1 }}>
        TEX SNIPER SYSTEM · NOT FINANCIAL ADVICE
      </div>
    </div>
  )
}

const btnStyle = {
  width: 28, height: 28, background: '#141414',
  border: '1px solid #222', borderRadius: 6,
  color: '#555', cursor: 'pointer', fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}
