import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const TERM = [
  { p: '$ sudo systemctl status payments-gw', out: false },
  { p: '● payments-gw.service — active (running) since Sun 06:14 UTC', out: true },
  { p: '$ tail -n2 /var/log/payments/replication.log', out: false },
  { p: '  WARN replica lag 42s on shard eu-2', out: true },
  { p: '$ kubectl rollout restart deploy/replication-agent -n payments', out: false },
  { p: 'deployment.apps/replication-agent restarted', out: true },
]

export default function ShadowModal({ session: s, onClose }) {
  const { toast } = useApp()
  const [tab, setTab] = useState('Clipboard')
  const [clip, setClip] = useState('WARN replica lag 42s on shard eu-2')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(920px, 97vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad" style={{ overflowY: 'auto' }}>
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="sessions" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div><div className="hrow" style={{ gap: 9 }}><span style={{ fontSize: 16, fontWeight: 700 }}>Shadowing {s.id}</span><span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Live · read-only</span></div>
                <div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{s.name} · <span className="mono">{s.acct}@{s.target}</span> · recorded &amp; watermarked</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
            {/* live terminal */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', padding: '14px 16px', minHeight: 240, fontFamily: 'var(--mono)', fontSize: '12.5px', lineHeight: 1.7 }}>
              {TERM.map((l, i) => (
                <div key={i} style={{ color: l.out ? '#1F9D57' : '#128A45', whiteSpace: 'pre-wrap' }}>{l.p}</div>
              ))}
              <div style={{ color: '#128A45' }}>$ <span style={{ display: 'inline-block', width: 8, height: 15, background: '#128A45', verticalAlign: 'middle', animation: 'none' }} /></div>
            </div>

            {/* side panel */}
            <div>
              <div className="tabs" style={{ marginBottom: 12 }}>
                {['Clipboard', 'Share', 'Files'].map((t) => (
                  <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</button>
                ))}
              </div>
              {tab === 'Clipboard' && (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--mut)', lineHeight: 1.5, marginBottom: 10 }}>Text copied inside the session lands here — DLP-scanned before it crosses the boundary.</div>
                  <textarea className="inp mono" value={clip} onChange={(e) => setClip(e.target.value)} rows={4} style={{ height: 'auto', padding: '9px 11px', resize: 'vertical', lineHeight: 1.5, fontSize: '12px' }} />
                  <button className="btn btn-sec btn-sm" style={{ marginTop: 10 }} onClick={() => { try { navigator.clipboard?.writeText(clip) } catch { /* ignore */ } toast('ok', 'Copied to local', 'DLP-scanned clipboard content copied (demo).') }}><Icon name="copy" size={13} />Copy to local</button>
                </>
              )}
              {tab === 'Share' && <div style={{ fontSize: '12.5px', color: 'var(--mut)', lineHeight: 1.6 }}>Generate a watermarked, time-boxed co-watch link for another approver. Every viewer is logged.</div>}
              {tab === 'Files' && <div style={{ fontSize: '12.5px', color: 'var(--mut)', lineHeight: 1.6 }}>No files transferred in this session. Uploads and downloads are blocked by the file-transfer policy.</div>}
            </div>
          </div>
        </div>

        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 7, fontSize: '12px', color: 'var(--mut)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />{s.watchers} watcher{s.watchers === 1 ? '' : 's'} · every keystroke indexed</span>
          <div className="hrow" style={{ gap: 8 }}>
            <button className="btn btn-sec" onClick={() => toast('warn', 'Input locked', `${s.id} keyboard frozen (demo).`)}><Icon name="lock" />Lock input</button>
            <button className="btn btn-danger" onClick={() => { toast('err', 'Session terminated', `${s.id} killed · credential rotated (demo).`); onClose() }}><Icon name="ban" />Terminate</button>
            <button className="btn btn-pri" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
