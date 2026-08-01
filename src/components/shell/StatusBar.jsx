import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext.jsx'

export default function StatusBar() {
  const { go, toast } = useApp()
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().slice(11, 19))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="statusbar" id="statusbar">
      <span className="sb-it sb-btn" onClick={() => toast('ok', 'Platform health', 'All 14 services operational. Last incident: 27 days ago.')}>
        <span className="sb-dot ok" /><b>All systems operational</b>
      </span>
      <span className="sb-it sb-optional">Cluster <b>eu-central-1a</b></span>
      <span className="sb-it sb-optional sb-btn" onClick={() => go('directory')}>Directory sync <b className="num">2 min ago</b></span>
      <span className="sb-it sb-optional sb-btn" onClick={() => go('audit')}>Events <b className="num">2.4M/day</b></span>
      <span className="sb-it sb-optional">Auth latency <b className="num">142 ms p95</b></span>
      <span className="sb-spacer" />
      <span className="sb-it sb-optional">TLS 1.3 · AES-256-GCM</span>
      <span className="sb-it sb-optional">Tenant <b className="mono">meridian-prod</b></span>
      <span className="sb-it">Tanflow Cloud <b className="mono">v6.2.1</b></span>
      <span className="sb-it"><b className="mono num">{clock}</b>&nbsp;UTC</span>
      <span className="sb-it"><span className="sb-dot ok" />Connected</span>
    </footer>
  )
}
