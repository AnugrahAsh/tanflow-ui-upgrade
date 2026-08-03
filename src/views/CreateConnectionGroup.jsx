import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field } from './formKit.jsx'
import { CONN_GROUPS, PARENTS } from '../data/connGroups.js'

export default function CreateConnectionGroup() {
  const { go, toast } = useApp()
  const { id } = useParams()
  const editing = id ? CONN_GROUPS.find((g) => g.id === id) : null

  const [f, setF] = useState({
    name: editing?.name || '',
    parent: editing?.parent || 'ROOT',
    type: editing?.type || 'Organizational',
    maxConns: editing?.maxConns || '',
    maxPerUser: editing?.maxPerUser || '',
  })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const [affinity, setAffinity] = useState(!!editing?.affinity)

  const valid = f.name.trim()
  const save = () => {
    toast('ok', editing ? 'Group updated' : 'Group created', `${f.name || 'Connection group'} saved (demo).`)
    go('connection-groups')
  }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('connection-groups')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead
        title={editing ? 'Edit Connection Group' : 'New Connection Group'}
        sub="Update this group’s name, parent, or balancing configuration."
      />

      <div className="card"><div className="card-pad">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px', alignItems: 'start' }}>
          <Field label="CONNECTION GROUP NAME" required>
            <input className="inp" placeholder="e.g. Development" value={f.name} onChange={set('name')} />
          </Field>
          <Field label="LOCATION (PARENT GROUP)">
            <select className="sel" value={f.parent} onChange={set('parent')}>{PARENTS.map((p) => <option key={p}>{p}</option>)}</select>
          </Field>
          <Field label="GROUP TYPE" help="Organizational groups structure connections. Balancing groups distribute load.">
            <select className="sel" value={f.type} onChange={set('type')}><option>Organizational</option><option>Balancing</option></select>
          </Field>
          <Field label="MAXIMUM NUMBER OF CONNECTIONS" help="Maximum concurrent connections allowed.">
            <input className="inp" placeholder="Leave blank for unlimited" value={f.maxConns} onChange={set('maxConns')} />
          </Field>

          <Field label="MAXIMUM CONNECTIONS PER USER" help="Maximum connections per individual user.">
            <input className="inp" placeholder="Leave blank for unlimited" value={f.maxPerUser} onChange={set('maxPerUser')} />
          </Field>
          <Field label="ENABLE SESSION AFFINITY" help="Reconnect users to their last-used connection in this group.">
            <label className="hrow" style={{ gap: 12, cursor: 'pointer', height: 30 }}>
              <span className={`toggle ${affinity ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setAffinity((v) => !v) }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{affinity ? 'Enabled' : 'Disabled'}</span>
            </label>
          </Field>
        </div>
      </div></div>

      <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16, padding: '13px 18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-sm)' }}>
        <button className="btn btn-sec" onClick={() => go('connection-groups')}>Cancel</button>
        <button className="btn btn-pri" disabled={!valid} onClick={save} style={!valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="check" />Save Changes</button>
      </div>
    </>
  )
}
