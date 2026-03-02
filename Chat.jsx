import { useState, useEffect, useRef } from 'react'
import { fmt } from './useLivePrice'

const Msg = ({ m }) => (
  <div style={{
    display: 'flex', gap: 10, marginBottom: 14,
    flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
    animation: 'fadeUp 0.25s ease'
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: m.role === 'user' ? '#1e1e1e' : '#141414',
      border: `1px solid ${m.role === 'user' ? '#2a2a2a' : '#202020'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
    }}>
      {m.role === 'user' ? '👤' : '◈'}
    </div>
    <div style={{
      maxWidth: '78%', padding: '10px 14px',
      borderRadius: m.role === 'user' ? '14px 3px 14px 14px' : '3px 14px 14px 14px',
      background: m.role === 'user' ? '#131313' : '#0f0f0f',
      border: `1px solid ${m.role === 'user' ? '#202020' : '#1a1a1a'}`,
      fontSize: 13, lineHeight: 1.65, color: '#888', whiteSpace: 'pre-wrap'
    }}>
      {m.content}
    </div>
  </div>
)

const CHIPS = ['Current setup?', 'Good entry now?', 'Key levels today', 'Risk on this trade?', '1H trend?', 'When to exit?']

export default function Chat({ priceData, settings }) {
  const { price, change, changeP, high, low } = priceData
  const up = change >= 0

  const entry = price ? parseFloat((price - 4).toFixed(2))  : null
  const sl    = price ? parseFloat((price - 14).toFixed(2)) : null
  const tp1   = price ? parseFloat((price + 14).toFixed(2)) : null
  const tp2   = price ? parseFloat((price + 29).toFixed(2)) : null
  const rr    = entry && sl && tp2 ? ((tp2 - entry) / (entry - sl)).toFixed(1) : '—'

  const [messages, setMessages] = useState([{
    role: 'ai',
    content: 'TEX online. Monitoring XAUUSD across 1H, 15m and 5m. Ask me about the current setup, price action, key levels, or anything Gold.'
  }])
  const [input,    setInput]    = useState('')
  const [thinking, setThinking] = useState(false)
  const chatRef = useRef()

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, thinking])

  const send = async (text) => {
    const txt = text || input.trim()
    if (!txt || thinking) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: txt }])
    setThinking(true)

    const sys = `You are TEX, a precision AI trading assistant for XAUUSD (Gold/USD). You specialize in 1H, 15m and 5m timeframe analysis.

Live data:
Price: $${fmt(price)} (${up ? '+' : ''}${changeP}% today)
Day High: $${fmt(high)} | Day Low: $${fmt(low)}
Signal: BUY | Confidence: 78% | Pattern: Bull Flag | RSI: 41.2
Entry: $${fmt(entry)} | SL: $${fmt(sl)} | TP1: $${fmt(tp1)} | TP2: $${fmt(tp2)} | R/R: 1:${rr}

Be direct, precise and concise. Use real price levels. No fluff. Mobile-friendly responses — keep them tight.`

    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: sys,
          messages: [
            ...messages.filter((_, i) => i > 0).map(m => ({
              role: m.role === 'ai' ? 'assistant' : 'user', content: m.content
            })),
            { role: 'user', content: txt }
          ]
        })
      })
      const data  = await res.json()
      const reply = data.content?.map(b => b.text || '').join('') || 'Unable to respond.'
      setMessages(m => [...m, { role: 'ai', content: reply }])
    } catch {
      setMessages(m => [...m, { role: 'ai', content: 'Connection error. Check your internet connection.' }])
    }
    setThinking(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid #131313',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#383838', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 9, color: '#353535', letterSpacing: 3 }}>TEX AI  ·  XAUUSD</span>
        {price && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#3a3a3a', fontFamily: 'monospace' }}>
            ${fmt(price)}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.map((m, i) => <Msg key={i} m={m} />)}
        {thinking && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#141414', border: '1px solid #202020',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
            }}>◈</div>
            <div style={{
              padding: '12px 16px', borderRadius: '3px 14px 14px 14px',
              background: '#0f0f0f', border: '1px solid #1a1a1a',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#383838',
                  animation: `pulse 1s ease ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick chips */}
      <div style={{ padding: '6px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {CHIPS.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            padding: '6px 12px', background: '#0f0f0f',
            border: '1px solid #1c1c1c', borderRadius: 20, whiteSpace: 'nowrap',
            fontSize: 11, color: '#404040', fontFamily: 'inherit', cursor: 'pointer'
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: 8, padding: '10px 14px',
          background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 12
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask TEX about XAUUSD..."
            style={{
              flex: 1, background: 'none', border: 'none',
              fontFamily: 'inherit', fontSize: 13, color: '#777',
              outline: 'none'
            }}
          />
          <button onClick={() => send()} disabled={thinking} style={{
            padding: '6px 16px', background: '#141414',
            border: '1px solid #222', borderRadius: 8,
            color: '#4a4a4a', fontFamily: 'inherit', fontSize: 11,
            cursor: thinking ? 'not-allowed' : 'pointer', letterSpacing: 1
          }}>SEND</button>
        </div>
      </div>
    </div>
  )
}
