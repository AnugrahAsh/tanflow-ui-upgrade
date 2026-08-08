import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field, SubLabel, ConnectionTree } from './formKit.jsx'
import { USERS, GROUPS } from '../data/mockData.js'

const RECUR = ['Once', 'Daily', 'Weekly']

function SubjectItem({ label, sub, selected, onToggle }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: selected ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' }}>
      <input type="checkbox" checked={selected} onChange={onToggle} style={{ accentColor: 'var(--accent)', width: 15, height: 15, flex: 'none' }} />
      <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--ink)' }}>{label}</div>{sub && <div style={{ fontSize: '11px', color: selected ? 'var(--accent)' : 'var(--mut)', opacity: selected ? 0.8 : 1 }}>{sub}</div>}</div>
    </label>
  )
}

export default function CreateTimeBasedPolicy() {
  const { go, toast } = useApp()
  const edit = useLocation().state?.edit || null
  const editing = !!edit
  
  const [name, setName] = useState(edit?.name || '')
  const [recur, setRecur] = useState(edit?.recur && RECUR.includes(edit.recur) ? edit.recur : 'Daily')
  const [conns, setConns] = useState(() => new Set())
  const [subjects, setSubjects] = useState(() => new Set())
  const toggle = (setter) => (key) => setter((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const toggleConn = toggle(setConns)
  const toggleSubject = toggle(setSubjects)

  const create = () => { toast('ok', editing ? 'Schedule updated' : 'Policy created', `${name || 'New policy'} — ${conns.size} connection(s), ${subjects.size} subject(s) (demo).`); go('time-based-access') }

  return (
    <>
      <div className="card" style={{ position: 'sticky', top: 0, zIndex: 6, marginBottom: 16, boxShadow: 'var(--sh)' }}>
        <div className="hrow" style={{ gap: 14, padding: '12px 16px', flexWrap: 'wrap' }}>
          <button className="icon-btn" title="Back" onClick={() => go('time-based-access')}><Icon name="arrowLeft" size={16} /></button>
          <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Icon name="calendar" size={18} style={{ color: 'var(--mut)' }} />
          </span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="hrow" style={{ gap: 9, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{editing ? 'Edit Access Schedule' : 'Create Time-Based Policy'}</span>
              {editing && <span className="tag">Editing</span>}
            </div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>{editing ? 'Update when these subjects can reach these connections.' : 'Define when specific users or groups can reach specific connections.'}</div>
          </div>
          <div className="hrow" style={{ gap: 8, flex: 'none' }}>
            <button className="btn btn-sec" onClick={() => go('time-based-access')}>Cancel</button>
            <button className="btn btn-pri" onClick={create}><Icon name="check" />{editing ? 'Save changes' : 'Create Policy'}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 272px', gap: 16, alignItems: 'start' }}>
        <div>
          {/* Section: Essentials */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <SubLabel style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}><Icon name="alerts" size={13} />Policy metadata</SubLabel>
              <Field label="POLICY NAME" required>
                <input className="inp" placeholder="e.g. Weekend Server Access" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                <Field label="VALID FROM" required><input className="inp" type="date" /></Field>
                <Field label="VALID UNTIL"><input className="inp" type="date" /></Field>
              </div>
            </div>
          </div>

          {/* Section: Schedule */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <SubLabel style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}><Icon name="clock" size={13} />Schedule & restrictions</SubLabel>
              <div className="field">
                <label>RECURRENCE MODE<span style={{ color: 'var(--bad)' }}> *</span></label>
                <div className="seg" style={{ width: 'fit-content' }}>
                  {RECUR.map((r) => <button key={r} className={recur === r ? 'on' : ''} onClick={() => setRecur(r)}>{r}</button>)}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                <Field label="ACCESS OPENS"><input className="inp" type="time" defaultValue="09:00" /></Field>
                <Field label="ACCESS CLOSES"><input className="inp" type="time" defaultValue="18:00" /></Field>
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Session Timeout
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--faint)' }}><title>Optional limit within the access window.</title><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                </label>
                <div className="hrow" style={{ gap: 8 }}>
                  <input className="inp" type="number" min="0" defaultValue="0" style={{ width: 80 }} /><span style={{ fontSize: '12px', color: 'var(--mut)' }}>hrs</span>
                  <input className="inp" type="number" min="0" defaultValue="0" style={{ width: 80 }} /><span style={{ fontSize: '12px', color: 'var(--mut)' }}>mins</span>
                </div>
                <div className="f-help">Optional limit within access window.</div>
              </div>
            </div>
          </div>

          {/* Section: Subjects */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <SubLabel style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Icon name="users" size={13} />Apply to Subjects</SubLabel>
              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginBottom: 16 }}>Choose the users and groups this policy applies to.</div>
              
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--mut)', textTransform: 'uppercase', marginBottom: 10 }}>User Groups</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 18 }}>
                {GROUPS.slice(0, 6).map((g) => (
                  <SubjectItem key={g.n} label={g.n} sub={g.src} selected={subjects.has('g:' + g.n)} onToggle={() => toggleSubject('g:' + g.n)} />
                ))}
              </div>
              
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--mut)', textTransform: 'uppercase', marginBottom: 10 }}>Users</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {USERS.slice(0, 9).map((u) => (
                  <SubjectItem key={u.id} label={u.name} sub={u.email} selected={subjects.has(u.id)} onToggle={() => toggleSubject(u.id)} />
                ))}
              </div>
            </div>
          </div>

          {/* Section: Connections */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-pad">
              <SubLabel style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}><Icon name="server" size={13} />Scope of Connections</SubLabel>
              <ConnectionTree selected={conns} onToggle={toggleConn} onClear={() => setConns(new Set())} />
            </div>
          </div>
        </div>
        
        {/* Live Summary Rail */}
        <div className="card" style={{ position: 'sticky', top: 86 }}>
          <div className="card-pad">
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Summary</div>
            
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)', flex: 'none' }}>Name</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right', wordBreak: 'break-word' }}>{name.trim() || <span style={{ color: 'var(--faint)' }}>Not set</span>}</span>
            </div>
            
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)', flex: 'none' }}>Recurrence</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right', wordBreak: 'break-word' }}>{recur}</span>
            </div>

            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)', flex: 'none' }}>Subjects</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right', wordBreak: 'break-word' }}>{subjects.size > 0 ? `${subjects.size} selected` : <span style={{ color: 'var(--faint)' }}>None</span>}</span>
            </div>

            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)', flex: 'none' }}>Connections</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right', wordBreak: 'break-word' }}>{conns.size > 0 ? `${conns.size} selected` : <span style={{ color: 'var(--faint)' }}>None</span>}</span>
            </div>
            
            <div className="hrow" style={{ gap: 9, alignItems: 'flex-start', marginTop: 14, padding: '11px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)' }}>
              <Icon name="shieldCheck" size={14} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '11.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>When this policy is enabled, users will only be able to access the scoped connections within this schedule.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
