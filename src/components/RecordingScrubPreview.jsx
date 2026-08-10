import { useRef, useState } from 'react'
import Icon from './Icon.jsx'

/* §4 — filmstrip scrubber used to pick an export range.
   Bespoke SVG/divs, no vendor CSS. Values are seconds. */

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
// Deterministic activity band so the strip reads as "where things happened".
const density = (i, n) => 0.25 + 0.75 * Math.abs(Math.sin((i / n) * 7.3) * Math.cos(i * 1.7))

export default function RecordingScrubPreview({ duration = 662, range, onChange, marks = [], frames = 12 }) {
  const barRef = useRef(null)
  const [drag, setDrag] = useState(null) // 'from' | 'to' | null
  const [from, to] = range

  const posFromEvent = (e) => {
    const r = barRef.current?.getBoundingClientRect()
    if (!r) return 0
    const p = (e.clientX - r.left) / r.width
    return Math.max(0, Math.min(duration, Math.round(p * duration)))
  }
  const startDrag = (which) => (e) => {
    e.preventDefault(); e.stopPropagation()
    setDrag(which)
    const move = (ev) => {
      const v = posFromEvent(ev)
      onChange(which === 'from' ? [Math.min(v, to - 5), to] : [from, Math.max(v, from + 5)])
    }
    const end = () => { setDrag(null); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', end)
  }

  const pct = (v) => `${(v / duration) * 100}%`

  return (
    <div>
      {/* filmstrip */}
      <div style={{ display: 'flex', gap: 2, height: 46, borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--line)' }}>
        {Array.from({ length: frames }).map((_, i) => {
          const t = (i / frames) * duration
          const inRange = t >= from && t <= to
          return (
            <div key={i} style={{ flex: 1, position: 'relative', background: inRange ? '#12203A' : '#1A2338', opacity: inRange ? 1 : .4, display: 'flex', alignItems: 'flex-end', padding: 3 }}>
              <div style={{ width: '100%', height: `${density(i, frames) * 70}%`, background: inRange ? 'rgba(122,162,247,.5)' : 'rgba(140,150,170,.3)', borderRadius: 1 }} />
            </div>
          )
        })}
      </div>

      {/* range bar */}
      <div ref={barRef} style={{ position: 'relative', height: 30, marginTop: 8, cursor: 'pointer' }}
        onClick={(e) => { const v = posFromEvent(e); const closer = Math.abs(v - from) < Math.abs(v - to) ? 'from' : 'to'; onChange(closer === 'from' ? [Math.min(v, to - 5), to] : [from, Math.max(v, from + 5)]) }}>
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 5, borderRadius: 3, background: 'var(--surface-3)', border: '1px solid var(--line)' }} />
        <div style={{ position: 'absolute', top: 12, left: pct(from), width: `${((to - from) / duration) * 100}%`, height: 5, borderRadius: 3, background: 'var(--accent)' }} />

        {marks.map((m) => (
          <span key={m.at} title={`${fmt(m.at)} — ${m.label}`} style={{ position: 'absolute', top: 7, left: pct(m.at), width: 2, height: 15, marginLeft: -1, background: '#a78bfa', borderRadius: 1 }} />
        ))}

        {['from', 'to'].map((which) => (
          <span key={which} onMouseDown={startDrag(which)} role="slider" aria-label={`Range ${which}`}
            style={{ position: 'absolute', top: 6, left: pct(which === 'from' ? from : to), marginLeft: -8, width: 16, height: 17, borderRadius: 'var(--r-xs)', background: 'var(--surface)', border: `2px solid var(--accent)`, cursor: 'ew-resize', boxShadow: drag === which ? 'var(--sh-focus)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 2, height: 7, background: 'var(--accent)', borderRadius: 1 }} />
          </span>
        ))}
      </div>

      <div className="hrow" style={{ justifyContent: 'space-between', fontSize: '11.75px', color: 'var(--mut)' }}>
        <span className="hrow" style={{ gap: 6 }}><Icon name="clock" size={12} />From <b className="mono" style={{ color: 'var(--ink)' }}>{fmt(from)}</b></span>
        <span>Selection <b className="mono" style={{ color: 'var(--ink)' }}>{fmt(to - from)}</b> of {fmt(duration)}</span>
        <span className="hrow" style={{ gap: 6 }}>To <b className="mono" style={{ color: 'var(--ink)' }}>{fmt(to)}</b></span>
      </div>
    </div>
  )
}
