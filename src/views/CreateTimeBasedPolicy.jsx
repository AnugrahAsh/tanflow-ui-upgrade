import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { Toggle } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field, SubLabel, ConnectionTree } from './formKit.jsx'
import { USERS, GROUPS } from '../data/mockData.js'

const TABS = [['params', 'adaptive', 'Restriction Parameters'], ['subjects', 'users', 'Apply to Subjects']]
const RECUR = ['Once', 'Daily', 'Weekly']

function SubjectItem({ label, sub, selected, onToggle }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: selected ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' }}>
      <input type="checkbox" checked={selected} onChange={onToggle} style={{ accentColor: 'var(--accent)', width: 15, height: 15, flex: 'none' }} />
      <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600 }}>{label}</div>{sub && <div style={{ fontSize: '11px', color: 'var(--mut)' }}>{sub}</div>}</div>
    </label>
  )
}

export default function CreateTimeBasedPolicy() {
  const { go, toast } = useApp()
  const edit = useLocation().state?.edit || null
  const editing = !!edit
  const [tab, setTab] = useState('params')
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
      <button className="btn btn-sec btn-sm" onClick={() => go('time-based-access')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title={editing ? 'Edit Access Schedule' : 'Create Time-Based Policy'} sub={editing ? 'Update when these subjects can reach these connections.' : 'Define when specific users or groups can reach specific connections.'} />

      <div className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-pad">
          {tab === 'params' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              {/* left — policy metadata + schedule */}
              <div>
                <SubLabel style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><Icon name="alerts" size={13} />Policy metadata</SubLabel>
                <Field label="POLICY NAME" required>
                  <input className="inp" placeholder="e.g. Weekend Server Access" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                  <Field label="VALID FROM" required><input className="inp" type="date" /></Field>
                  <Field label="VALID UNTIL"><input className="inp" type="date" /></Field>
                </div>

                <SubLabel style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '22px 0 12px' }}><Icon name="clock" size={13} />Schedule & restrictions</SubLabel>
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

              {/* right — connection tree */}
              <ConnectionTree selected={conns} onToggle={toggleConn} onClear={() => setConns(new Set())} />
            </div>
          )}

          {tab === 'subjects' && (
            <>
              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginBottom: 16 }}>Choose the users and groups this policy applies to.</div>
              <SubLabel>User Groups</SubLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '10px 0 18px' }}>
                {GROUPS.slice(0, 6).map((g) => (
                  <SubjectItem key={g.n} label={g.n} sub={g.src} selected={subjects.has('g:' + g.n)} onToggle={() => toggleSubject('g:' + g.n)} />
                ))}
              </div>
              <SubLabel>Users</SubLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                {USERS.slice(0, 9).map((u) => (
                  <SubjectItem key={u.id} label={u.name} sub={u.email} selected={subjects.has(u.id)} onToggle={() => toggleSubject(u.id)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="hrow" style={{ justifyContent: 'space-between', gap: 8, marginTop: 16 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)' }}>
          <Toggle defaultOn />Policy Enabled
        </label>
        <div className="hrow" style={{ gap: 8 }}>
          <button className="btn btn-sec" onClick={() => go('time-based-access')}>Cancel</button>
          <button className="btn btn-pri" onClick={create}><Icon name="check" />{editing ? 'Save changes' : 'Create Policy'}</button>
        </div>
      </div>
    </>
  )
}
