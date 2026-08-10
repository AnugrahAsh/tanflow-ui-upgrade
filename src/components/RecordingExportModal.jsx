import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import RecordingScrubPreview from './RecordingScrubPreview.jsx'

/* §4 — download/export a session recording. Evidence-grade by default:
   every export is itself an audited event and carries an integrity manifest. */

const FORMATS = [
  { id: 'mp4', icon: 'recordings', name: 'MP4 video', desc: 'Plays anywhere. Largest file.', rate: 1.9 },
  { id: 'webm', icon: 'recordings', name: 'WebM video', desc: 'Smaller, modern browsers.', rate: 1.1 },
  { id: 'cast', icon: 'commands', name: 'Asciicast', desc: 'Text-native, searchable, tiny.', rate: 0.02 },
  { id: 'pdf', icon: 'reports', name: 'PDF report', desc: 'Key frames, commands and policy hits.', rate: 0.35 },
]
const DELIVERY = [
  ['download', 'download', 'Download to this device'],
  ['upload', 'sftp', 'Push to evidence SFTP'],
  ['integrations', 'siem', 'Send to SIEM (Splunk)'],
]
const MARKS = [{ at: 53, label: 'login' }, { at: 212, label: 'window opened' }, { at: 397, label: 'config change' }, { at: 556, label: 'file transfer' }, { at: 636, label: 'logout' }]
const DURATION = 662
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

const Section = ({ title, sub, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>{title}</div>
    {sub && <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 3 }}>{sub}</div>}
    <div style={{ marginTop: 10 }}>{children}</div>
  </div>
)

const SwitchRow = ({ on, onClick, title, sub, locked }) => (
  <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
    <div style={{ minWidth: 0 }}>
      <div className="hrow" style={{ gap: 7 }}>
        <span style={{ fontSize: '12.75px', fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
        {locked && <span className="tag" style={{ color: 'var(--mut)' }}><Icon name="lock" size={9} />Policy</span>}
      </div>
      <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 1 }}>{sub}</div>
    </div>
    <span className={`toggle ${on ? 'on' : ''}`} style={locked ? { opacity: .55, cursor: 'not-allowed' } : undefined} onClick={locked ? undefined : onClick} role="switch" aria-checked={on} />
  </div>
)

export default function RecordingExportModal({ rec, onClose }) {
  const { toast } = useApp()
  const [format, setFormat] = useState('mp4')
  const [scope, setScope] = useState('full') // full | range | marks
  const [range, setRange] = useState([0, DURATION])
  const [delivery, setDelivery] = useState('download')
  const [opts, setOpts] = useState({ mask: true, blurClip: true, watermark: true, keystrokes: false, manifest: true })
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const f = FORMATS.find((x) => x.id === format)
  const seconds = scope === 'full' ? DURATION : scope === 'range' ? range[1] - range[0] : 140
  const sizeMb = Math.max(0.1, seconds * f.rate / 10).toFixed(1)
  const ok = reason.trim().length >= 4

  const run = () => {
    if (!ok) { toast('warn', 'Reason required', 'Exports are evidence — record why you need this copy.'); return }
    setBusy(true)
    setTimeout(() => {
      toast('ok', 'Export queued', `${f.name} · ${fmt(seconds)} · ${sizeMb} MB — ${delivery === 'download' ? 'download will start' : 'delivery in progress'} (demo).`)
      onClose()
    }, 900)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.5)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(680px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          {/* header */}
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="download" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Export recording</div>
                <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{rec?.recId || 'RC-77149'} · {rec?.conn || 'BTSPAMDEMO01'} · {fmt(DURATION)}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <Section title="Format">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 9 }}>
              {FORMATS.map((x) => {
                const on = x.id === format
                return (
                  <button key={x.id} onClick={() => setFormat(x.id)} style={{ textAlign: 'left', padding: '11px 12px', borderRadius: 'var(--r-sm)', background: on ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`, cursor: 'pointer' }}>
                    <span className="hrow" style={{ gap: 8 }}>
                      <Icon name={x.icon} size={14} style={{ color: on ? 'var(--accent)' : 'var(--mut)' }} />
                      <span style={{ fontSize: '12.75px', fontWeight: 650, color: 'var(--ink)' }}>{x.name}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: '11.25px', color: 'var(--mut)', marginTop: 3 }}>{x.desc}</span>
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title="What to include">
            <div style={{ display: 'inline-flex', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 12 }}>
              {[['full', 'Whole session'], ['range', 'Time range'], ['marks', 'Bookmarks only']].map(([id, label], i) => (
                <button key={id} onClick={() => setScope(id)} style={{ padding: '7px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', background: scope === id ? 'var(--accent-bg)' : 'transparent', color: scope === id ? 'var(--accent)' : 'var(--ink-2)', borderRight: i < 2 ? '1px solid var(--line-2)' : 'none' }}>{label}</button>
              ))}
            </div>
            {scope === 'range' && <RecordingScrubPreview duration={DURATION} range={range} onChange={setRange} marks={MARKS} />}
            {scope === 'marks' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {MARKS.map((m) => <span key={m.at} className="tag tag-acc">{fmt(m.at)} {m.label}</span>)}
              </div>
            )}
            {scope === 'full' && <div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Everything from connect to disconnect, including idle time.</div>}
          </Section>

          <Section title="Redaction" sub="Applied to the exported copy — the original recording is never altered.">
            <SwitchRow on={opts.mask} onClick={() => setOpts((o) => ({ ...o, mask: !o.mask }))} title="Mask credential reveals" sub="Vault reveals and password prompts are blacked out." locked />
            <SwitchRow on={opts.blurClip} onClick={() => setOpts((o) => ({ ...o, blurClip: !o.blurClip }))} title="Blur clipboard content" sub="Anything copied in or out is obscured." />
            <SwitchRow on={opts.keystrokes} onClick={() => setOpts((o) => ({ ...o, keystrokes: !o.keystrokes }))} title="Include keystroke log" sub="Adds the typed-input stream alongside the video." />
            <SwitchRow on={opts.watermark} onClick={() => setOpts((o) => ({ ...o, watermark: !o.watermark }))} title="Watermark with your identity" sub="Your email and the export time are burned into every frame." />
            <SwitchRow on={opts.manifest} onClick={() => setOpts((o) => ({ ...o, manifest: !o.manifest }))} title="Attach integrity manifest" sub="SHA-256 chain proving the export matches the sealed original." locked />
          </Section>

          <Section title="Delivery">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DELIVERY.map(([ic, id, label]) => (
                <button key={id} onClick={() => setDelivery(id)} className="hrow" style={{ gap: 8, padding: '9px 12px', borderRadius: 'var(--r-sm)', fontSize: '12.5px', fontWeight: 600, background: delivery === id ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${delivery === id ? 'var(--accent)' : 'var(--line-2)'}`, color: delivery === id ? 'var(--accent)' : 'var(--ink-2)', cursor: 'pointer' }}>
                  <Icon name={ic} size={14} />{label}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Reason for export" sub="Required — exports of privileged sessions are themselves audited.">
            <input className="inp" placeholder="e.g. INC-59912 evidence pack for Risk & Audit" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Section>

          {/* summary */}
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', flexWrap: 'wrap' }}>
            <span className="hrow" style={{ gap: 9, fontSize: '12.25px', color: 'var(--ink-2)' }}>
              <Icon name="shieldCheck" size={15} style={{ color: 'var(--accent)', flex: 'none' }} />
              {f.name} · {fmt(seconds)} · about <b style={{ color: 'var(--ink)' }}>{sizeMb} MB</b>
            </span>
            <span style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Logged as an export event against your identity</span>
          </div>

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={busy || !ok} style={!ok || busy ? { opacity: .55, cursor: 'not-allowed' } : undefined} onClick={run}>
              <Icon name="download" />{busy ? 'Preparing…' : 'Export recording'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
