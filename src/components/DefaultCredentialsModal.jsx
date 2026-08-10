import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

/* §5 — set the credential a connection falls back to when a user has no
   personal mapping. Deliberately explicit about who it exposes access to. */

const SETS = [
  { id: 'cs-linux', name: 'Linux estate — svc-ops', kind: 'SSH key', scope: '38 targets' },
  { id: 'cs-win', name: 'Windows admin — svc-join', kind: 'Password', scope: '12 targets' },
  { id: 'cs-db', name: 'Database — pamadmin', kind: 'Password', scope: '9 targets' },
]

export default function DefaultCredentialsModal({ target = 'BTSPAMDEMO01', onClose, onSave }) {
  const { toast } = useApp()
  const [mode, setMode] = useState('set') // set | none
  const [chosen, setChosen] = useState(SETS[0].id)
  const [ack, setAck] = useState(false)

  const save = () => {
    if (mode === 'set' && !ack) { toast('warn', 'Confirm the exposure', 'Acknowledge who this grants access to before saving.'); return }
    const label = mode === 'none' ? 'No default credential' : SETS.find((s) => s.id === chosen).name
    onSave?.(mode === 'none' ? null : chosen)
    toast('ok', 'Default credential updated', `${target} → ${label} (demo).`)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.45)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(520px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="keyRound" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Default credential</div>
                <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{target}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div style={{ fontSize: '12.75px', color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 16 }}>
            Used when a user opens this target and has no credential of their own mapped to it.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
            {[['set', 'Use a credential set', 'Everyone permitted on this target connects as that account.'], ['none', 'No default', 'Users without a personal mapping are refused at connect.']].map(([id, t, s]) => (
              <label key={id} style={{ display: 'flex', gap: 11, padding: '12px 13px', border: `1px solid ${mode === id ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', background: mode === id ? 'var(--accent-bg)' : 'var(--surface)' }}>
                <input type="radio" name="defcred" checked={mode === id} onChange={() => setMode(id)} style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
                <span><span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{t}</span>
                  <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{s}</span></span>
              </label>
            ))}
          </div>

          {mode === 'set' && (
            <>
              <div className="field" style={{ marginBottom: 14 }}>
                <label>CREDENTIAL SET</label>
                <select className="sel" value={chosen} onChange={(e) => setChosen(e.target.value)}>
                  {SETS.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.kind} · {s.scope}</option>)}
                </select>
              </div>
              <div className="hrow" style={{ gap: 11, alignItems: 'flex-start', padding: '12px 13px', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)', marginBottom: 14 }}>
                <Icon name="warnTri" size={16} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
                <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
                  A shared default weakens attribution — the recording still identifies the human, but the target sees one account.
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
                <input type="checkbox" checked={ack} onChange={() => setAck((v) => !v)} style={{ accentColor: 'var(--accent)', marginTop: 2, width: 15, height: 15, flex: 'none' }} />
                I understand every permitted user will connect using this account.
              </label>
            </>
          )}

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" onClick={save}><Icon name="check" />Save default</button>
          </div>
        </div>
      </div>
    </div>
  )
}
