import { useState, useEffect } from 'react'
import Icon from '../Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import LicenseGraceChip from '../LicenseGraceChip.jsx'

const HEALTH = [
  ['CPU', '2%', 'load 0.00', 2],
  ['Memory', '16%', '1.3 GB / 7.7 GB', 16],
  ['Disk', '54%', '24 GB / 44 GB', 54],
]

function ServerHealth({ onOpen }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="sb-health" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <button className="sb-it sb-btn" aria-expanded={open} onClick={onOpen} title="Server health and configuration"><span className="sb-dot ok" /><b>Server health</b><Icon name="chevD" size={12} /></button>
      {open && <section className="server-health-pop" role="tooltip" aria-label="Server health details">
        <div className="shp-head"><div><div className="shp-title">Server health</div><div className="shp-sub">tanflow-prod-euc1-01 · healthy</div></div><span className="hrow" style={{ gap: 5, fontSize: '11px', color: 'var(--ok)', fontWeight: 650 }}><span className="sb-dot ok" />Online</span></div>
        <div className="shp-list">{HEALTH.map(([label, value, sub, pct]) => <div key={label} className="shp-metric"><div className="hrow" style={{ justifyContent: 'space-between', gap: 10 }}><span>{label}</span><b>{value}</b></div><div className="shp-meter"><i style={{ width: `${pct}%` }} /></div><span>{sub}</span></div>)}</div>
        <div className="shp-meta"><span>Uptime <b>102d 3h</b></span><span>AMD EPYC 9J14 · 8 vCPU</span></div>
        <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 12 }}><span style={{ fontSize: '11px', color: 'var(--mut)' }}>Updated just now</span><button className="link" style={{ fontSize: '11.5px' }} onClick={onOpen}>View diagnostics</button></div>
      </section>}
    </span>
  )
}

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
      <span className="sb-it sb-btn" onClick={() => toast('ok', 'Platform health', 'All 14 services operational. Last incident: 27 days ago.')}><span className="sb-dot ok" /><b>All systems operational</b></span>
      <ServerHealth onOpen={() => go('monitor')} />
      <span className="sb-it sb-optional">Cluster <b>eu-central-1a</b></span>
      <span className="sb-it sb-optional sb-btn" onClick={() => go('directory')}>Directory sync <b className="num">2 min ago</b></span>
      <span className="sb-it sb-optional sb-btn" onClick={() => go('audit')}>Events <b className="num">2.4M/day</b></span>
      <span className="sb-it sb-optional">Auth latency <b className="num">142 ms p95</b></span>
      <span className="sb-spacer" />
      <span className="sb-it sb-optional">TLS 1.3 · AES-256-GCM</span>
      <span className="sb-it sb-optional">Tenant <b className="mono">meridian-prod</b></span>
      <span className="sb-it">Tanflow Cloud <b className="mono">v6.2.1</b></span>
      <span className="sb-it"><b className="mono num">{clock}</b>&nbsp;UTC</span>
      <LicenseGraceChip />
      <span className="sb-it"><span className="sb-dot ok" />Connected</span>
    </footer>
  )
}
