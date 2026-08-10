import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import UserCredentialsTab from '../components/UserCredentialsTab.jsx'
import DefaultCredentialsModal from '../components/DefaultCredentialsModal.jsx'
import CredentialPinPicker from '../components/CredentialPinPicker.jsx'

/* §5 — the standalone credential-sets admin page. A credential set is one
   account reused across many targets; mappings decide who gets which. */

const SEED = [
  { id: 'cs-linux', name: 'Linux estate — svc-ops', account: 'svc-ops', kind: 'SSH key', targets: 38, users: 14, rotation: 'Every 24h', updated: '2 hrs ago', health: 'Healthy' },
  { id: 'cs-win', name: 'Windows admin — svc-join', account: 'svc-join', kind: 'Password', targets: 12, users: 6, rotation: 'Every 12h', updated: '6 hrs ago', health: 'Healthy' },
  { id: 'cs-db', name: 'Database — pamadmin', account: 'pamadmin', kind: 'Password', targets: 9, users: 4, rotation: 'Every 24h', updated: 'Yesterday', health: 'Rotation due' },
  { id: 'cs-net', name: 'Network — netadmin', account: 'netadmin', kind: 'SSH key', targets: 21, users: 3, rotation: 'Every 7d', updated: '3 days ago', health: 'Healthy' },
  { id: 'cs-legacy', name: 'Legacy branch — batch', account: 'branchsvc', kind: 'Password', targets: 4, users: 2, rotation: 'Manual', updated: '2 mos ago', health: 'Overdue' },
]
const HEALTH = {
  Healthy: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' },
  'Rotation due': { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
  Overdue: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)' },
}
const TABS = [['sets', 'folder', 'Credential sets'], ['users', 'users', 'User mappings']]

export default function CredentialSets() {
  const { toast } = useApp()
  const [tab, setTab] = useState('sets')
  const [rows] = useState(SEED)
  const [q, setQ] = useState('')
  const [defaultsFor, setDefaultsFor] = useState(null)
  const [pinFor, setPinFor] = useState(null)

  const shown = rows.filter((r) => !q || (r.name + r.account + r.kind).toLowerCase().includes(q.toLowerCase()))
  const targets = rows.reduce((n, r) => n + r.targets, 0)
  const overdue = rows.filter((r) => r.health !== 'Healthy').length

  return (
    <>
      <PageHead
        title="Credential Sets"
        sub="One vaulted account reused across many targets — mapped to users by policy, injected at connect and never revealed."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => setPinFor('AR-20441')}><Icon name="key2" />Pin to request</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'New credential set', 'Define an account, its scope and its rotation policy (demo).')}><Icon name="plus" />New credential set</button>
          </>
        }
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Credential sets" icon="folder" val={rows.length} foot={`${rows.filter((r) => r.kind === 'SSH key').length} key-based`} />
        <KpiTile label="Targets covered" icon="server" val={targets} foot="across the estate" />
        <KpiTile label="Users mapped" icon="users" val={rows.reduce((n, r) => n + r.users, 0)} foot="personal + set mappings" />
        <KpiTile label="Needs rotation" icon="warnTri" val={overdue} foot="1 manual set overdue" />
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}><Icon name={icon} size={14} />{label}</button>
        ))}
      </div>

      {tab === 'users' ? <UserCredentialsTab /> : (
        <div className="card">
          <div className="toolbar" style={{ flexWrap: 'wrap' }}>
            <div className="search-inp" style={{ width: 250 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search sets or accounts…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="tb-spacer" />
            <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{shown.length} of {rows.length} sets</span>
            <button className="icon-btn" title="Export" onClick={() => toast('ok', 'Export', `${shown.length} credential sets exported (metadata only) (demo).`)}><Icon name="download" size={15} /></button>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Credential set</th><th>Account</th><th>Type</th><th className="td-right">Targets</th><th className="td-right">Users</th><th>Rotation</th><th>Health</th><th style={{ width: 78 }} /></tr></thead>
              <tbody>
                {shown.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No credential sets match</div><div className="e-s">Try a different account name or type.</div></div></td></tr>
                ) : shown.map((r) => {
                  const t = HEALTH[r.health]
                  return (
                    <tr key={r.id} onClick={() => toast('ok', r.name, 'Scope, members and rotation policy (demo).')} style={{ cursor: 'pointer' }}>
                      <td className="td-main">{r.name}</td>
                      <td className="mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{r.account}</td>
                      <td><span className="tag">{r.kind}</span></td>
                      <td className="td-right td-num">{r.targets}</td>
                      <td className="td-right td-num">{r.users}</td>
                      <td style={{ color: 'var(--mut)' }}>{r.rotation}</td>
                      <td><span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '11.5px', fontWeight: 600, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-sm)', padding: '2px 9px', whiteSpace: 'nowrap' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: t.c }} />{r.health}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="mini-btn" title="Set as default" onClick={(e) => { e.stopPropagation(); setDefaultsFor(r.name) }}><Icon name="star" size={14} /></button>
                          <button className="mini-btn" title="Edit" onClick={(e) => { e.stopPropagation(); toast('ok', 'Edit set', `${r.name} (demo).`) }}><Icon name="edit" size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--hair)', flexWrap: 'wrap' }}>
            <span className="hrow" style={{ gap: 8, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: the legacy branch set rotates manually and is 2 months stale — move it to a 24h policy.</span>
            <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Rotation queued', 'Legacy branch set queued for policy rotation (demo).')}><Icon name="refresh" size={13} />Fix rotation</button>
          </div>
        </div>
      )}

      {defaultsFor && <DefaultCredentialsModal target={defaultsFor} onClose={() => setDefaultsFor(null)} />}
      {pinFor && <CredentialPinPicker request={pinFor} onClose={() => setPinFor(null)} />}
    </>
  )
}
