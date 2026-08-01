import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field, ConnectionTree } from './formKit.jsx'
import { USERS, GROUPS } from '../data/mockData.js'

// Lightweight team-member combobox (users + groups).
function TeamPicker() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const options = [
    ...GROUPS.slice(0, 5).map((g) => ({ id: 'g:' + g.n, label: g.n, kind: 'Group' })),
    ...USERS.slice(0, 10).map((u) => ({ id: u.id, label: u.name, kind: 'User' })),
  ]
  const chosen = new Set(selected.map((s) => s.id))
  const filtered = options.filter((o) => !chosen.has(o.id) && (!q || o.label.toLowerCase().includes(q.toLowerCase())))
  return (
    <div style={{ position: 'relative' }}>
      <div className="inp" style={{ height: 'auto', minHeight: 38, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', padding: '5px 8px', cursor: 'text' }} onClick={() => setOpen(true)}>
        {selected.map((s) => (
          <span key={s.id} className="tag tag-acc" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {s.label}<span style={{ cursor: 'pointer', display: 'inline-flex' }} onClick={(e) => { e.stopPropagation(); setSelected((p) => p.filter((x) => x.id !== s.id)) }}><Icon name="x" size={11} /></span>
          </span>
        ))}
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={selected.length ? '' : 'Search users and groups…'} style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'none', fontSize: '12.75px', color: 'var(--ink)' }} />
        <Icon name="chevD" size={14} style={{ color: 'var(--faint)', flex: 'none' }} />
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-lg)', zIndex: 20, maxHeight: 240, overflowY: 'auto', padding: 4 }}>
          {filtered.map((o) => (
            <button key={o.id} className="pal-it" onMouseDown={(e) => { e.preventDefault(); setSelected((p) => [...p, o]); setQ('') }} style={{ width: '100%' }}>
              <Icon name={o.kind === 'Group' ? 'groups' : 'user'} size={14} /><span>{o.label}</span><span className="pi-sub">{o.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CreateChangeRequest() {
  const { go, toast } = useApp()
  const [title, setTitle] = useState('')
  const [conns, setConns] = useState(() => new Set())
  const submit = () => { toast('ok', 'Change submitted', `${title || 'Change request'} sent for approval — ${conns.size} target(s) (demo).`); go('change-management') }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('change-management')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title="New Change Request" sub="Request time-bound access to a connection for yourself or your team. An approver must approve before access is granted." />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-pad">
          <Field label="TITLE"><input className="inp" placeholder="e.g. Patch DB server CR-1042" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>

          <div className="field" style={{ marginTop: 16 }}>
            <label>REASON (OPTIONAL)</label>
            <textarea className="inp" rows={3} style={{ height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 }} placeholder="Why is this access needed?" />
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>TARGET CONNECTIONS / GROUPS</div>
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginBottom: 10 }}>Browse the connection tree and tick what this change needs. Selecting a folder targets every connection inside it.</div>
            <ConnectionTree selected={conns} onToggle={(c) => setConns((p) => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n })} onClear={() => setConns(new Set())} />
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label>TEAM MEMBERS (OPTIONAL — YOU ARE ALWAYS INCLUDED)</label>
            <TeamPicker />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad">
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Access window</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
            <Field label="START"><input className="inp" type="datetime-local" defaultValue="2026-07-29T11:24" /></Field>
            <Field label="END"><input className="inp" type="datetime-local" defaultValue="2026-07-29T13:24" /></Field>
          </div>
          <div className="f-help" style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <Icon name="alerts" size={13} style={{ flex: 'none', marginTop: 1 }} />
            Members get full access to the targets for this window. Access is granted on approval and revoked automatically when the window ends or the change is closed.
          </div>
        </div>
      </div>

      <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn btn-sec" onClick={() => go('change-management')}>Cancel</button>
        <button className="btn btn-pri" onClick={submit}><Icon name="check" />Submit for approval</button>
      </div>
    </>
  )
}
