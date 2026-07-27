import { useState } from 'react'
import Icon from './Icon.jsx'
import { avColor, initials, STATUS_BDG, LOGO_IMG } from '../lib/format.js'

// Toggle switch (`.toggle` / `.on`). Fires onToggle(newState) after flipping.
export function Toggle({ defaultOn = false, onToggle }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <span
      className={`toggle ${on ? 'on' : ''}`}
      onClick={(e) => { e.stopPropagation(); const next = !on; setOn(next); onToggle?.(next) }}
    />
  )
}

// Coloured initials avatar. `color` overrides the name-derived colour.
export function Avatar({ name, cls = '', color }) {
  return (
    <span className={`av ${cls}`} style={{ background: color || avColor(name) }}>{initials(name)}</span>
  )
}

// Generic dot badge: <Badge tone="ok" label="Active" />
export function Badge({ tone, label, dot = true }) {
  return (
    <span className={`bdg bdg-${tone}`}>{dot && <span className="b-dot" />}{label}</span>
  )
}

// Status string -> tone-mapped badge.
export function StatusBadge({ status }) {
  const [tone, label] = STATUS_BDG[status] || ['mut', status]
  return <Badge tone={tone} label={label} />
}

const RISK_CLASS = { Low: 'rp-low', Medium: 'rp-med', High: 'rp-high', Critical: 'rp-crit' }
export function RiskPill({ risk }) {
  return (
    <span className={`risk-pill ${RISK_CLASS[risk]}`}><i />{risk}</span>
  )
}

const SEV_CLASS = { Critical: 'sev-crit', High: 'sev-high', Medium: 'sev-med', Low: 'sev-low' }
export function SevTag({ sev }) {
  return (
    <span className={`sev ${SEV_CLASS[sev]}`}><span className="sv-bar" />{sev}</span>
  )
}

// Delta chip with up/down arrow. goodUp=false inverts the good/bad colouring.
export function Delta({ value, goodUp = true }) {
  if (value === 0) return <span className="delta flat">0%</span>
  const up = value > 0
  const good = goodUp ? up : !up
  return (
    <span className={`delta ${good ? 'up' : 'down'}`}>
      <Icon name={up ? 'aUp' : 'aDown'} size={10} />{Math.abs(value)}%
    </span>
  )
}

// Chart legend row. items: [{ c, n, line }]
export function Legend({ items }) {
  return (
    <div className="legend">
      {items.map((i, idx) => (
        <span className="lg-it" key={idx}>
          <span className={i.line ? 'lg-ln' : 'lg-sw'} style={{ background: i.c }} />{i.n}
        </span>
      ))}
    </div>
  )
}

// Labelled meter bar. mood: '' | 'm-ok' | 'm-warn' | 'm-bad'
export function MeterRow({ label, val, pct, mood = '' }) {
  return (
    <div className="meter-row">
      <span className="m-label" title={label}>{label}</span>
      <div className={`meter ${mood}`}><i style={{ width: `${pct}%` }} /></div>
      <span className="m-val">{val}</span>
    </div>
  )
}

// Vendor logo tile: local brand SVG when available, else a lettered colour tile.
export function IntLogo({ item, size = 34 }) {
  const file = LOGO_IMG[item.logo]
  if (file) {
    return (
      <span className="int-logo img" style={{ width: size, height: size }}>
        <img src={`assets/logos/${file}.svg`} alt={item.n} loading="lazy" />
      </span>
    )
  }
  return (
    <span className="int-logo" style={{ width: size, height: size, fontSize: Math.round(size * 0.32), background: item.c }}>{item.logo}</span>
  )
}
