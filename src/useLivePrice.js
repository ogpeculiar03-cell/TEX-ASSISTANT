import { useState, useEffect } from 'react'

const SYMBOL = 'XAU/USD'

export const useLivePrice = (apiKey) => {
  const [price,   setPrice]   = useState(null)
  const [change,  setChange]  = useState(0)
  const [changeP, setChangeP] = useState(0)
  const [high,    setHigh]    = useState(null)
  const [low,     setLow]     = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [lastUp,  setLastUp]  = useState(null)

  const fetchHistory = async () => {
    if (!apiKey) return
    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${SYMBOL}&interval=5min&outputsize=60&apikey=${apiKey}`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.values) {
        setHistory(data.values.reverse().map(c => ({
          time:  new Date(c.datetime).getTime(),
          price: parseFloat(c.close)
        })))
      }
    } catch {}
  }

  const fetchQuote = async () => {
    if (!apiKey) {
      setError('No API key — add it in Settings')
      setLoading(false)
      return
    }
    try {
      const url  = `https://api.twelvedata.com/quote?symbol=${SYMBOL}&apikey=${apiKey}`
      const res  = await fetch(url)
      const data = await res.json()
      if (data.code) throw new Error(data.message || 'API error')
      const p   = parseFloat(data.close)
      const o   = parseFloat(data.open)
      const chg = parseFloat((p - o).toFixed(2))
      const pct = parseFloat(((chg / o) * 100).toFixed(3))
      setPrice(p)
      setChange(chg)
      setChangeP(pct)
      setHigh(parseFloat(data.high))
      setLow(parseFloat(data.low))
      setLastUp(new Date())
      setHistory(h => [...h, { time: Date.now(), price: p }].slice(-60))
      setLoading(false)
      setError(null)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!apiKey) {
      setError('No API key — add it in Settings')
      setLoading(false)
      return
    }
    fetchHistory()
    fetchQuote()
    const iv = setInterval(fetchQuote, 60000)
    return () => clearInterval(iv)
  }, [apiKey])

  return { price, change, changeP, high, low, history, loading, error, lastUp }
}

export const getSession = () => {
  const h = new Date().getUTCHours()
  if (h >= 8  && h < 13) return 'London'
  if (h >= 13 && h < 17) return 'London / NY Overlap'
  if (h >= 17 && h < 21) return 'New York'
  return 'Asian / Off Session'
}

export const fmt = n => n != null
  ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : '—'
