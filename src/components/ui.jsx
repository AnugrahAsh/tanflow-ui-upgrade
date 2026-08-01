import Icon from './Icon.jsx'
import { Delta } from './primitives.jsx'
import { Sparkline } from './charts/index.jsx'

// Page header with title, subtitle and right-aligned action slot.
export function PageHead({ title, sub, actions = null }) {
  return (
    <div className="page-h">
      <div className="ph-meta"><h1>{title}</h1><div className="ph-sub">{sub}</div></div>
      <div className="ph-actions">{actions}</div>
    </div>
  )
}

// KPI tile. foot may be a string or a React node.
export function KpiTile({ label, icon, val, unit, delta, goodUp = true, foot, spark, sparkColor = 'var(--s1)' }) {
  return (
    <div className="kpi">
      <div className="k-label">{icon && <Icon name={icon} size={13} />}{label}</div>
      <div className="k-val">{val}{unit && <span className="k-unit">{unit}</span>}</div>
      <div className="k-foot">{delta !== undefined && <Delta value={delta} goodUp={goodUp} />}{foot && <span>{foot}</span>}</div>
      {spark && <div className="k-spark"><Sparkline data={spark} color={sparkColor} /></div>}
    </div>
  )
}

// Card header: title, optional subtitle, optional right-aligned slot.
export function CardHeader({ title, sub, right = null }) {
  return (
    <div className="card-h">
      <div><div className="ch-t">{title}</div>{sub && <div className="ch-s">{sub}</div>}</div>
      <div className="ch-right">{right}</div>
    </div>
  )
}
