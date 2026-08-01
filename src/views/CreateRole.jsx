import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SubLabel } from './formKit.jsx'

const TYPES = ['Functional (a job-function hat)', 'Technical (a system integration role)', 'Administrative (elevated control)']

// [title, code] — order matches the target screenshot's column flow.
const PERMS = [
  ['Connections', [
    ['Create', 'connections.create'],
    ['Read / List', 'connections.read'],
    ['Update settings & credentials', 'connections.update'],
    ['Delete', 'connections.delete'],
    ['Assign to users / groups', 'connections.assign'],
  ]],
  ['Connection Groups', [
    ['Create', 'connection_groups.create'],
    ['Read / List', 'connection_groups.read'],
    ['Update', 'connection_groups.update'],
    ['Delete', 'connection_groups.delete'],
  ]],
  ['Sharing Profiles', [
    ['Create', 'sharing_profiles.create'],
    ['Read / List', 'sharing_profiles.read'],
    ['Update', 'sharing_profiles.update'],
    ['Delete', 'sharing_profiles.delete'],
  ]],
  ['Users', [
    ['Create', 'users.create'],
    ['Read / List', 'users.read'],
    ['Update', 'users.update'],
    ['Delete', 'users.delete'],
  ]],
  ['User Groups', [
    ['Create', 'user_groups.create'],
    ['Read / List', 'user_groups.read'],
    ['Update', 'user_groups.update'],
    ['Delete', 'user_groups.delete'],
  ]],
  ['Time-Based Policies', [
    ['Create', 'time_based_policies.create'],
    ['Read / List', 'time_based_policies.read'],
    ['Update', 'time_based_policies.update'],
    ['Delete', 'time_based_policies.delete'],
  ]],
  ['Audit', [
    ['Read history & audit logs', 'audit.read'],
  ]],
  ['Change Requests', [
    ['Create / manage own requests', 'change_requests.create'],
    ['Approve / reject requests', 'change_requests.approve'],
  ]],
  ['Password Vault', [
    ['Read vault entries', 'vault.read'],
    ['Create / update vault entries', 'vault.update'],
    ['Reveal secrets (MFA step-up, superadmin only)', 'vault.reveal'],
  ]],
  ['Sessions', [
    ['View active / past sessions', 'sessions.read'],
    ['Terminate sessions', 'sessions.kill'],
    ['Join / observe live sessions', 'sessions.join'],
  ]],
  ['System', [
    ['Full administration bypass (admin / superadmin)', 'system.administer'],
  ]],
]

function PermItem({ title, code, checked, onToggle }) {
  return (
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ accentColor: 'var(--accent)', width: 15, height: 15, marginTop: 2, flex: 'none' }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--faint)', fontFamily: 'var(--mono)' }}>{code}</div>
      </div>
    </label>
  )
}

export default function CreateRole() {
  const { go, toast } = useApp()
  const [name, setName] = useState('')
  const [perms, setPerms] = useState(() => new Set())
  const toggle = (code) => setPerms((prev) => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n })
  const create = () => { toast('ok', 'Role created', `${name || 'New role'} created with ${perms.size} permission${perms.size === 1 ? '' : 's'} (demo).`); go('roles') }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('roles')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title="Create role" sub="A role bundles API permissions. Members inherit these permissions, controlling what they can read, create, update, and delete." />

      <div className="card">
        <div className="card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
            <div className="field">
              <label>NAME<span style={{ color: 'var(--bad)' }}> *</span></label>
              <input className="inp" placeholder="e.g. Helpdesk Operator" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>TYPE</label>
              <select className="sel">{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>DESCRIPTION</label>
              <textarea className="inp" rows={3} style={{ height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 }} placeholder="What this role is for." />
            </div>
          </div>

          <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 22, marginBottom: 4 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>Permissions</div>
            <span className="tag tag-acc" style={{ letterSpacing: '.05em' }}>{perms.size} SELECTED</span>
          </div>

          {PERMS.map(([group, items]) => (
            <div key={group} style={{ marginTop: 16 }}>
              <SubLabel>{group}</SubLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginTop: 2 }}>
                {items.map(([title, code]) => (
                  <PermItem key={code} title={title} code={code} checked={perms.has(code)} onToggle={() => toggle(code)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn btn-sec" onClick={() => go('roles')}>Cancel</button>
        <button className="btn btn-pri" onClick={create}><Icon name="check" />Create role</button>
      </div>
    </>
  )
}
