import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { REPORTS } from '../data/reports.js'

const FREQ = ['Daily', 'Weekly', 'Monthly', 'Every 4 hours', '1st of month']
const FORMATS = ['PDF', 'CSV', 'XLSX', 'PDF + CSV', 'CSV → SIEM', 'CSV → SFTP', 'PDF (signed)']
const WINDOWS = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Since last run']
const Field = ({ label, hint, children }) => (
  <div className="field"><label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{label}{hint && <span style={{ color: 'var(--mut)', fontWeight: 400 }}> {hint}</span>}</label>{children}</div>
)

export default function ScheduleModal({ report, onClose }) {
  const { toast } = useApp()
  const [f, setF] = useState({ report: report || REPORTS[2].name, freq: 'Weekly', time: '07:00', recipients: '', format: 'PDF', window: 'Last 7 days' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const save = () => { toast('ok', 'Schedule saved', `${f.report} — ${f.freq} at ${f.time}, delivered as ${f.format} (demo).`); onClose() }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="calendar" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>Schedule delivery</div><div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Generated on the server and delivered to named recipients — every run is audited.</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Report"><select className="sel" value={f.report} onChange={set('report')}>{REPORTS.map((r) => <option key={r.id}>{r.name}</option>)}</select></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Frequency"><select className="sel" value={f.freq} onChange={set('freq')}>{FREQ.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Delivery time"><input type="time" className="sel" value={f.time} onChange={set('time')} /></Field>
            </div>
            <Field label="Recipients" hint="comma separated — distribution lists allowed"><input className="inp" placeholder="soc-tier2@meridianbank.com, ciso@meridianbank.com" value={f.recipients} onChange={set('recipients')} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Format"><select className="sel" value={f.format} onChange={set('format')}>{FORMATS.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Window per run"><select className="sel" value={f.window} onChange={set('window')}>{WINDOWS.map((x) => <option key={x}>{x}</option>)}</select></Field>
            </div>
            <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)' }}>
              <Icon name="shieldCheck" size={16} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.5 }}>Delivered files are hash-stamped and the delivery itself is written to the audit log — recipient, format and payload digest.</div>
            </div>
          </div>

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" onClick={save}><Icon name="check" />Save schedule</button>
          </div>
        </div>
      </div>
    </div>
  )
}
