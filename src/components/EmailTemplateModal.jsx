import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

// Edit-email-template modal: subject, click-to-copy placeholders, a live HTML
// editor and an isolated live preview (iframe). Design-system tokens only.
export default function EmailTemplateModal({ template, onClose }) {
  const { toast } = useApp()
  const [subject, setSubject] = useState(template.subject)
  const [html, setHtml] = useState(template.html)
  const [active, setActive] = useState(template.active)

  const copy = (token) => {
    try { navigator.clipboard?.writeText(token) } catch { /* ignore */ }
    toast('ok', 'Copied', `${token} copied to clipboard.`)
  }
  const save = () => { toast('ok', 'Template saved', `${template.event} template updated (demo).`); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(940px, 97vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad" style={{ overflowY: 'auto' }}>
          {/* header */}
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="mail" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Edit: {template.event}</div>
                <div className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{template.code}</div>
              </div>
            </div>
            <div className="hrow" style={{ gap: 14 }}>
              <label className="hrow" style={{ gap: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' }}>Active</span>
                <span className={`toggle ${active ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setActive((v) => !v) }} />
              </label>
              <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
            </div>
          </div>

          {/* subject */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>SUBJECT</label>
            <input className="inp" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          {/* placeholders */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 8 }}>Placeholders — click to copy</div>
          <div className="hrow" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {template.placeholders.map((p) => (
              <button key={p} className="mono" onClick={() => copy(p)}
                style={{ fontSize: '11.5px', padding: '4px 9px', borderRadius: 6, border: '1px solid var(--line-2)', background: 'var(--surface-2)', color: 'var(--ink-2)', cursor: 'pointer' }}>{p}</button>
            ))}
          </div>

          {/* editor + preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>HTML editor</div>
              <textarea className="inp mono" value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false}
                style={{ height: 320, padding: 12, resize: 'vertical', lineHeight: 1.55, fontSize: '11.5px', whiteSpace: 'pre' }} />
            </div>
            <div>
              <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' }}>Live preview</span>
                <span className="hrow" style={{ gap: 6, fontSize: '11px', fontWeight: 600, color: 'var(--ok)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />Live</span>
              </div>
              <div style={{ height: 320, border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: '#fff' }}>
                <iframe title="preview" srcDoc={html} sandbox="" style={{ width: '100%', height: '100%', border: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
          <button className="btn btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn btn-pri" onClick={save}><Icon name="check" />Save Template</button>
        </div>
      </div>
    </div>
  )
}
