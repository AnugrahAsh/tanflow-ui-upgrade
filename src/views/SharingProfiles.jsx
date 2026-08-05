import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const CONNS = ['BTSPAMDEMO01', 'BTSPAMDEV01', 'BTSIAMRETEST01', 'BTSPLPAMPRODBD01', 'TANFLOWAD01', 'TANFLOWAPP01']
const PROFILES = [
  { id: 'pamdev-rw', name: 'PAMDEV Read-Write', conn: 'BTSPAMDEV01', icon: 'commands', mode: 'Interactive', minted: 4, by: 'Tribhuwan Rao', last: '2 hrs ago' },
  { id: 'pamdev-ro', name: 'PAMDEV Read-Only', conn: 'BTSPAMDEV01', icon: 'commands', mode: 'Read-only', minted: 11, by: 'Tribhuwan Rao', last: 'Yesterday' },
  { id: 'retest-ro', name: 'RETEST Read-Only', conn: 'BTSIAMRETEST01', icon: 'commands', mode: 'Read-only', minted: 6, by: 'Marcus Bennett', last: '3 days ago' },
  { id: 'vendor-sql', name: 'Vendor patch — SQL prod', conn: 'BTSPLPAMPRODBD01', icon: 'db', mode: 'Read-only', minted: 2, by: 'Lena Dahl', last: 'Jun 30' },
]
const INVITES = [
  { email: 'auditor@kpmg-ext.com', profile: 'RETEST Read-Only', by: 'Marcus Bennett', status: 'Watching now', expiry: '8 min left' },
  { email: 'l.osei@meridianbank.com', profile: 'PAMDEV Read-Only', by: 'Tribhuwan Rao', status: 'Pending', expiry: '42 min left' },
  { email: 'v.chen@sqlvendor.io', profile: 'Vendor patch — SQL prod', by: 'Lena Dahl', status: 'Expired', expiry: '—' },
]
const STATUS = { 'Watching now': 'var(--ok)', Pending: 'var(--warn-core)', Expired: 'var(--faint)' }

const tileFor = (icon) => icon === 'db' ? { tint: '#E6F5EF', color: '#0E9F6E' } : { tint: '#FDF0E1', color: '#B4690E' }
const ConnCell = ({ icon, name }) => {
  const s = tileFor(icon)
  return (
    <div className="hrow" style={{ gap: 10 }}>
      <span style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={14} style={{ color: s.color }} /></span>
      <span className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{name}</span>
    </div>
  )
}

// ── New / Edit sharing profile modal ─────────────────────────────────────────
const EXPIRIES = ['10 min', '30 min', '60 min']
function SharingProfileModal({ profile, onClose }) {
  const { toast } = useApp()
  const editing = !!profile
  const [name, setName] = useState(profile?.name || '')
  const [conn, setConn] = useState(profile?.conn || CONNS[0])
  const [readOnly, setReadOnly] = useState(profile ? profile.mode === 'Read-only' : true)
  const [expiry, setExpiry] = useState('10 min')

  const save = () => { toast('ok', editing ? 'Profile updated' : 'Profile created', `${name || 'Sharing profile'} saved (demo).`); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="integrations" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{editing ? 'Edit sharing profile' : 'New sharing profile'}</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Defines how a guest joins a live session on one target</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Profile name</label>
            <input className="inp" placeholder="e.g. Vendor read-only — SQL prod" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Primary connection</label>
            <select className="sel" value={conn} onChange={(e) => setConn(e.target.value)}>{CONNS.map((c) => <option key={c}>{c}</option>)}</select>
            <div className="f-help">Guests can only ever see this one target.</div>
          </div>

          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '14px 16px', marginBottom: 16 }}>
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)' }}>Read-only viewer</div>
              <span className={`toggle ${readOnly ? 'on' : ''}`} onClick={() => setReadOnly((v) => !v)} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 6, lineHeight: 1.55 }}>Guest watches the session but cannot send input — no keyboard, mouse, clipboard writes or file uploads. Turn off for a fully interactive pairing session.</div>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Default link expiry</div>
          <div style={{ display: 'inline-flex', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            {EXPIRIES.map((x) => (
              <button key={x} onClick={() => setExpiry(x)} style={{ padding: '8px 18px', fontSize: '12.75px', fontWeight: 600, cursor: 'pointer', background: expiry === x ? 'var(--accent-bg)' : 'transparent', color: expiry === x ? 'var(--accent)' : 'var(--ink-2)', borderRight: x !== '60 min' ? '1px solid var(--line-2)' : 'none' }}>{x}</button>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 12, lineHeight: 1.55 }}>Every link is single-use and bound to the invitee’s email — it dies on redemption or expiry, whichever comes first.</div>

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" onClick={save}><Icon name="check" />Save profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SharingProfiles() {
  const { toast } = useApp()
  const [modal, setModal] = useState(null) // null | 'new' | profile object
  const [profiles, setProfiles] = useState(PROFILES)
  const [del, setDel] = useState(null) // profile pending deletion
  const confirmDelete = () => {
    setProfiles((ps) => ps.filter((p) => p.id !== del.id))
    toast('warn', 'Profile deleted', `${del.name} removed — existing links minted from it stop working (demo).`)
    setDel(null)
  }

  return (
    <>
      <PageHead
        title="Session Sharing"
        sub="Email-bound, single-use invitations into live sessions — read-only or interactive, always recorded and watermarked, revocable mid-session."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => setModal('new')}><Icon name="plus" />New sharing profile</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Invite vendor', 'Mint a single-use, email-bound join link (demo).')}><Icon name="mail" />Invite vendor</button>
          </>
        }
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Sharing profiles" icon="integrations" val={profiles.length} foot={`${profiles.filter((p) => p.mode === 'Read-only').length} read-only · ${profiles.filter((p) => p.mode === 'Interactive').length} interactive`} />
        <KpiTile label="Links minted (30d)" icon="mail" val="23" delta={12} foot="all single-use, email-bound" />
        <KpiTile label="Guests watching now" icon="eye" val="1" foot={<span className="hrow" style={{ gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />external auditor on RETEST</span>} />
        <KpiTile label="Revoked mid-session" icon="ban" val="2" foot="last 90 days" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <CardHeader title="Sharing profiles" sub="Reusable join rules — one profile per target, minted only by its creator" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Profile</th><th>Primary connection</th><th>Join mode</th><th className="td-right">Links minted</th><th>Created by</th><th>Last used</th><th style={{ width: 78 }} /></tr></thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan={7}><div className="empty" style={{ padding: '44px 20px' }}><div className="e-ic"><Icon name="integrations" size={20} /></div><div className="e-t">No sharing profiles</div><div className="e-s">Create a profile to define how guests may join a session.</div><button className="btn btn-pri btn-sm" style={{ marginTop: 14 }} onClick={() => setModal('new')}><Icon name="plus" size={13} />New sharing profile</button></div></td></tr>
              ) : profiles.map((p) => (
                <tr key={p.id} onClick={() => setModal(p)} style={{ cursor: 'pointer' }}>
                  <td className="td-main">{p.name}</td>
                  <td><ConnCell icon={p.icon} name={p.conn} /></td>
                  <td>{p.mode === 'Interactive' ? <span className="tag tag-acc">Interactive</span> : <span className="tag">Read-only</span>}</td>
                  <td className="td-right td-num">{p.minted}</td>
                  <td><div className="hrow" style={{ gap: 9 }}><Avatar name={p.by} cls="av-sm" /><span style={{ fontSize: '12.75px' }}>{p.by}</span></div></td>
                  <td style={{ color: 'var(--mut)' }}>{p.last}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" title="Edit profile" onClick={(e) => { e.stopPropagation(); setModal(p) }}><Icon name="edit" size={14} /></button>
                      <button className="mini-btn danger" title="Delete profile" onClick={(e) => { e.stopPropagation(); setDel(p) }}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <CardHeader title="Invitations" sub="Every link is personal: the invitee confirms their email on the join page" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Recipient</th><th>Profile</th><th>Minted by</th><th>Status</th><th>Expiry</th><th style={{ width: 90 }} /></tr></thead>
            <tbody>
              {INVITES.map((v) => (
                <tr key={v.email}>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{v.email}</td>
                  <td style={{ color: 'var(--ink-2)' }}>{v.profile}</td>
                  <td><div className="hrow" style={{ gap: 9 }}><Avatar name={v.by} cls="av-sm" /><span style={{ fontSize: '12.75px' }}>{v.by}</span></div></td>
                  <td><span className="hrow" style={{ gap: 7, fontSize: '12.5px', fontWeight: 600, color: STATUS[v.status] }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS[v.status] }} />{v.status}</span></td>
                  <td className="td-num" style={{ color: v.expiry === '—' ? 'var(--faint)' : 'var(--mut)' }}>{v.expiry}</td>
                  <td>{v.status === 'Expired'
                    ? <span style={{ color: 'var(--faint)' }}>—</span>
                    : <button className="btn btn-danger btn-sm" onClick={() => toast('warn', 'Revoked', `Invite for ${v.email} revoked (demo).`)}>Revoke</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hrow" style={{ gap: 8, padding: '12px 16px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
          <Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: guests join through the gateway — never a direct route. Their view carries a per-invite watermark and every joined minute lands in the recording.
        </div>
      </div>

      {modal && <SharingProfileModal key={modal === 'new' ? 'new' : modal.id} profile={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}

      {del && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={() => setDel(null)} />
          <div className="card" style={{ position: 'relative', width: 'min(440px, 96vw)', boxShadow: 'var(--sh-lg)' }}>
            <div className="card-pad">
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div className="hrow" style={{ gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--bad-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="trash" size={18} style={{ color: 'var(--bad)' }} /></span>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Delete “{del.name}”?</div>
                </div>
                <button className="icon-btn" onClick={() => setDel(null)} aria-label="Close"><Icon name="x" size={16} /></button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--mut)', lineHeight: 1.55 }}>This profile can no longer be used to mint join links.{del.minted > 0 && <> Its <b style={{ color: 'var(--ink)' }}>{del.minted} existing link{del.minted === 1 ? '' : 's'}</b> stop working immediately.</>} Sessions already recorded are unaffected.</div>
              <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button className="btn btn-sec" onClick={() => setDel(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}><Icon name="trash" />Delete profile</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
