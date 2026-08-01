import { useState } from 'react'
import { fmt } from '../../lib/format.js'
import { useTooltip, TipContent } from './Tooltip.jsx'

export const SEQ = ['#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab']

// ── Sparkline ───────────────────────────────────────────────────────────────
export function Sparkline({ data, w = 92, h = 30, color = 'var(--s1)', fill = true }) {
  const mx = Math.max(...data), mn = Math.min(...data), rg = mx - mn || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * (w - 6) + 3, h - 4 - ((v - mn) / rg) * (h - 10)])
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')
  const [ex, ey] = pts[pts.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {fill && <path d={`${line} L${w - 3} ${h - 2} L3 ${h - 2}Z`} fill={color} opacity=".09" />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="4" fill={color} stroke="var(--surface)" strokeWidth="2" />
    </svg>
  )
}

// ── Area chart (multi-series, hover crosshair) ───────────────────────────────
export function AreaChart({ series, labels, h = 210, yFmt = (v) => fmt(v), xEvery = 3 }) {
  const { showTip, hideTip } = useTooltip()
  const [hover, setHover] = useState(null)
  const w = 760, padL = 46, padR = 14, padT = 14, padB = 26, iw = w - padL - padR, ih = h - padT - padB
  const all = series.flatMap((s) => s.data)
  const mx = Math.max(...all) * 1.12, mn = 0, rg = mx - mn || 1, n = labels.length
  const X = (i) => padL + (i / (n - 1)) * iw
  const Y = (v) => padT + ih - ((v - mn) / rg) * ih
  const ticks = 4
  const cw = iw / (n - 1)

  const grid = []
  for (let t = 0; t <= ticks; t++) {
    const v = mn + (rg * t / ticks), y = Y(v)
    grid.push(
      <g key={t}>
        <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--grid)" strokeWidth="1" />
        <text x={padL - 8} y={y + 3.5} textAnchor="end" className="axis-t">{yFmt(Math.round(v))}</text>
      </g>
    )
  }

  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${w} ${h}`} role="img">
        {grid}
        <line x1={padL} y1={padT + ih} x2={w - padR} y2={padT + ih} stroke="var(--axis)" strokeWidth="1" />
        {series.map((s, si) => {
          const line = s.data.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('')
          return (
            <g key={si}>
              <path d={`${line} L${X(n - 1)} ${padT + ih} L${padL} ${padT + ih}Z`} fill={s.color} opacity=".08" />
              <path d={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={X(n - 1)} cy={Y(s.data[n - 1])} r="4" fill={s.color} stroke="var(--surface)" strokeWidth="2" />
            </g>
          )
        })}
        {labels.map((l, i) => (i % xEvery === 0 ? (
          <text key={i} x={X(i)} y={h - 7} textAnchor="middle" className="axis-t">{l}</text>
        ) : null))}
        {hover !== null && (
          <line x1={X(hover)} y1={padT} x2={X(hover)} y2={padT + ih} stroke="var(--accent)" strokeWidth="1" opacity=".4" />
        )}
        {labels.map((l, i) => (
          <rect
            key={i} x={X(i) - cw / 2} y={padT} width={cw} height={ih} fill="transparent"
            onMouseMove={(e) => { setHover(i); showTip(e.clientX, e.clientY, <TipContent title={l} rows={series.map((s) => ({ c: s.color, n: s.name, v: yFmt(s.data[i]) }))} />) }}
            onMouseLeave={() => { setHover(null); hideTip() }}
          />
        ))}
      </svg>
    </div>
  )
}

// ── Bar chart (single series, hover) ─────────────────────────────────────────
export function BarChart({ labels, values, h = 190, color = 'var(--s1)', yFmt = (v) => fmt(v), xEvery = 1, name = 'Value' }) {
  const { showTip, hideTip } = useTooltip()
  const w = 760, padL = 44, padR = 10, padT = 12, padB = 26, iw = w - padL - padR, ih = h - padT - padB, n = values.length
  const mx = Math.max(...values) * 1.15 || 1
  const slot = iw / n, bw = Math.min(24, slot * 0.62)
  const ticks = 3
  const grid = []
  for (let t = 0; t <= ticks; t++) {
    const v = mx * t / ticks, y = padT + ih - (v / mx) * ih
    grid.push(
      <g key={t}>
        <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="var(--grid)" strokeWidth="1" />
        <text x={padL - 8} y={y + 3.5} textAnchor="end" className="axis-t">{yFmt(Math.round(v))}</text>
      </g>
    )
  }
  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${w} ${h}`} role="img">
        {grid}
        <line x1={padL} y1={padT + ih} x2={w - padR} y2={padT + ih} stroke="var(--axis)" strokeWidth="1" />
        {values.map((v, i) => {
          const x = padL + slot * i + (slot - bw) / 2, bh = Math.max(2, (v / mx) * ih), y = padT + ih - bh, r = Math.min(4, bh)
          const d = `M${x} ${padT + ih} v-${(bh - r).toFixed(1)} q0 -${r} ${r} -${r} h${(bw - 2 * r).toFixed(1)} q${r} 0 ${r} ${r} v${(bh - r).toFixed(1)}Z`
          return (
            <path
              key={i} d={d} fill={color} style={{ cursor: 'pointer' }}
              onMouseMove={(e) => showTip(e.clientX, e.clientY, <TipContent title={labels[i]} rows={[{ c: color, n: name, v: yFmt(v) }]} />)}
              onMouseLeave={hideTip}
            />
          )
        })}
        {labels.map((l, i) => (i % xEvery === 0 ? (
          <text key={i} x={padL + slot * i + slot / 2} y={h - 7} textAnchor="middle" className="axis-t">{l}</text>
        ) : null))}
      </svg>
    </div>
  )
}

// ── Ring gauge ───────────────────────────────────────────────────────────────
export function RingGauge({ pct, size = 110, color = 'var(--accent)', track = 'var(--accent-bg-2)', label = '', cap = '' }) {
  const r = (size - 14) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100)
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="rg-val"><div className="rg-num">{label || pct}</div>{cap && <div className="rg-cap">{cap}</div>}</div>
    </div>
  )
}

// ── Segmented bar ────────────────────────────────────────────────────────────
export function SegBar({ segs, h = 10 }) {
  const { showTip, hideTip } = useTooltip()
  const total = segs.reduce((a, s) => a + s.v, 0)
  return (
    <div style={{ display: 'flex', gap: 2, height: h, borderRadius: 4, overflow: 'hidden' }}>
      {segs.map((s, i) => {
        const wp = (s.v / total) * 100
        return (
          <div
            key={i} style={{ width: `${wp}%`, background: s.c, borderRadius: 3 }}
            onMouseMove={(e) => showTip(e.clientX, e.clientY, <TipContent title={s.n} rows={[{ c: s.c, n: 'Share', v: `${s.v} (${Math.round(wp)}%)` }]} />)}
            onMouseLeave={hideTip}
          />
        )
      })}
    </div>
  )
}

// ── Heatmap ──────────────────────────────────────────────────────────────────
export function Heatmap({ rows, cols, data, cell = 21, gap = 3, fmtV = (v) => v }) {
  const { showTip, hideTip } = useTooltip()
  const padL = 34, padT = 6, padB = 20
  const w = padL + cols.length * (cell + gap), hh = padT + rows.length * (cell + gap) + padB
  const mx = Math.max(...data.flat()) || 1
  return (
    <div className="chart-box" style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${hh}`} style={{ minWidth: w * 0.85 }}>
        {rows.map((rl, r) => (
          <g key={r}>
            <text x={padL - 8} y={padT + r * (cell + gap) + cell / 2 + 3.5} textAnchor="end" className="axis-t">{rl}</text>
            {cols.map((cl, c) => {
              const v = data[r][c], idx = Math.min(SEQ.length - 1, Math.floor((v / mx) * (SEQ.length - 1)))
              return (
                <rect
                  key={c} className="heat-cell" x={padL + c * (cell + gap)} y={padT + r * (cell + gap)} width={cell} height={cell} rx="4"
                  fill={v === 0 ? '#EEF1F6' : SEQ[idx]}
                  onMouseMove={(e) => showTip(e.clientX, e.clientY, <TipContent title={`${rl} · ${cl}`} rows={[{ c: SEQ[7], n: 'Authentications', v: fmtV(v) }]} />)}
                  onMouseLeave={hideTip}
                />
              )
            })}
          </g>
        ))}
        {cols.map((cl, c) => (c % 3 === 0 ? (
          <text key={c} x={padL + c * (cell + gap) + cell / 2} y={hh - 5} textAnchor="middle" className="axis-t">{cl}</text>
        ) : null))}
      </svg>
    </div>
  )
}
