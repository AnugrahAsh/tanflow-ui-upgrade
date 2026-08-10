import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Avatar } from './primitives.jsx'

/* §5 — per-user credential mappings: which account a given identity connects
   as, on which target. Shown as a tab on the credential-sets page. */

const SEED = [
  { id: 1, user: 'Tribhuwan Rao', target: 'BTSPAMDEMO01', account: 'root', kind: 'Password', source: 'Personal mapping', used: '2 hrs ago' },
  { id: 2, user: 'Tribhuwan Rao', target: 'TANFLOWAD01', account: 'Administrator', kind: 'Password', source: 'Credential set', used: 'Yesterday' },
  { id: 3, user: 'Marcus Bennett', target: 'BTSPAMDEMO01', account: 'svc-deploy', kind: 'SSH key', source: 'Personal mapping', used: '3 days ago' },
  { id: 4, user: 'Nadia Rahman', target: 'BTSPLPAMPRODBD01', account: 'pamadmin', kind: 'Password', source: 'Credential set', used: '1 wk ago' },
  { id: 5, user: 'Julia Novak', target: 'TANFLOWAPP01', account: 'appadmin', kind: 'Password', source: 'Default', used: 'never' },
]
const SRC_TONE = {
  'Personal mapping': { c: 'var(--accent)', bg: 'var(--accent-bg)', b: 'var(--accent-line)' },
  'Credential set': { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' },
  Default: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
}

export default function UserCredentialsTab() {
  const { toast } = useApp()
  const [rows, setRows] = useState(SEED)
  const [q, setQ] = useState('')
  const [src, setSrc] = useState('All sources')

  const shown = rows.filter((r) =>
    (!q || (r.user + r.target + r.account).toLowerCase().includes(q.toLowerCase())) &&
    (src === 'All sources' || r.source === src))

  const unmap = (r) => {
    setRows((rs) => rs.filter((x) => x.id !== r.id))
    toast('warn', 'Mapping removed', `${r.user} no longer connects to ${r.target} as ${r.account} (demo).`)
  }

  return (
    <div className="card">
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="search-inp" style={{ width: 240 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search user, target or account…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="sel" style={{ width: 170, height: 30 }} value={src} onChange={(e) => setSrc(e.target.value)}>
          <option>All sources</option><option>Personal mapping</option><option>Credential set</option><option>Default</option>
        </select>
        <div className="tb-spacer" />
        <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{shown.length} of {rows.length} mappings</span>
        <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Add mapping', 'Map a user to an account on a target (demo).')}><Icon name="plus" size={13} />Add mapping</button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>User</th><th>Target</th><th>Connects as</th><th>Type</th><th>Source</th><th>Last used</th><th style={{ width: 78 }} /></tr></thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={7}><div className="empty" style={{ padding: '44px 20px' }}><div className="e-ic"><Icon name="keyRound" size={20} /></div><div className="e-t">No mappings match</div><div className="e-s">Adjust the search or source filter.</div></div></td></tr>
            ) : shown.map((r) => {
              const t = SRC_TONE[r.source]
              return (
                <tr key={r.id}>
                  <td><div className="hrow" style={{ gap: 9 }}><Avatar name={r.user} cls="av-sm" /><span style={{ fontSize: '12.75px' }}>{r.user}</span></div></td>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{r.target}</td>
                  <td className="mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{r.account}</td>
                  <td><span className="tag">{r.kind}</span></td>
                  <td><span style={{ fontSize: '11px', fontWeight: 700, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-xs)', padding: '2px 7px', whiteSpace: 'nowrap' }}>{r.source}</span></td>
                  <td style={{ color: 'var(--mut)' }}>{r.used}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" title="Edit mapping" onClick={() => toast('ok', 'Edit mapping', `${r.user} → ${r.target} (demo).`)}><Icon name="edit" size={14} /></button>
                      <button className="mini-btn danger" title="Remove mapping" onClick={() => unmap(r)}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="hrow" style={{ gap: 8, padding: '12px 16px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
        <Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />
        Copilot: one mapping falls back to a shared default — attribution is weaker there than a personal mapping.
      </div>
    </div>
  )
}
