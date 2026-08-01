import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Avatar, Badge, RiskPill, StatusBadge } from '../components/primitives.jsx'
import ResetPasswordModal from '../components/ResetPasswordModal.jsx'
import { useApp } from '../context/AppContext.jsx'


export default function UserDrawer({ user: u }) {
  const { toast, go, closeDrawer } = useApp()
  const [pwOpen, setPwOpen] = useState(false)
  const ents = [
    ['SAP S/4HANA', 'FI Display, PO Create'],
    ['Active Directory', u.priv ? 'Domain Users, Server Operators' : 'Domain Users'],
    ['Salesforce', 'Standard User'],
    ['Core Banking', 'Teller Inquiry'],
  ]
  const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }

  return (
    <>
      <div className="drawer-h">
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 14 }}>
          <Avatar name={u.name} cls="av-lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.015em' }}>{u.name}</div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 1 }}>{u.title} · {u.email}</div>
            <div className="hrow" style={{ marginTop: 8, flexWrap: 'wrap', gap: 6 }}>
              <StatusBadge status={u.status} />
              <RiskPill risk={u.risk} />
              {u.priv && <Badge tone="viol" label="Privileged" dot={false} />}
              {u.mfa ? <Badge tone="ok" label="MFA enrolled" /> : <Badge tone="bad" label="No MFA" />}
            </div>
          </div>
        </div>
        <div className="hrow" style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair)' }}>
          <button className="btn btn-sec btn-sm" onClick={() => { closeDrawer(); go('edit-user/' + u.id) }}><Icon name="edit" />Edit</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Access review', `Micro-certification launched for ${u.name} (demo).`)}><Icon name="certs" />Review access</button>
          <button className="btn btn-sec btn-sm" onClick={() => setPwOpen(true)}><Icon name="refresh" />Reset password</button>
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => toast('warn', 'Suspend', 'Dual-control request sent to a second admin (demo).')}><Icon name="ban" />Suspend</button>
        </div>
      </div>
      <div className="drawer-body">
        <div style={{ ...label, margin: '16px 0 4px' }}>Identity</div>
        <div className="dl">
          <div className="dl-k">Identity ID</div><div className="dl-v mono" style={{ fontSize: '11.5px' }}>{u.id} · UPN {u.email}</div>
          <div className="dl-k">Source of truth</div><div className="dl-v">{u.src} {u.src === 'Workday HR' ? '(authoritative)' : ''}</div>
          <div className="dl-k">Department</div><div className="dl-v">{u.dept}</div>
          <div className="dl-k">Manager</div><div className="dl-v">L. Dahl — Director, {u.dept}</div>
          <div className="dl-k">Lifecycle state</div><div className="dl-v">{u.status === 'Active' ? 'Active · hired Mar 2021' : u.status}</div>
          <div className="dl-k">Last sign-in</div><div className="dl-v num">{u.last} · London, GB · FIDO2</div>
        </div>
        <div style={{ ...label, margin: '18px 0 8px' }}>Access summary — {u.ents} entitlements · {u.groups} groups</div>
        {ents.map((e) => (
          <div className="hrow" key={e[0]} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--hair)' }}>
            <div><div style={{ fontSize: '12.5px', fontWeight: 600 }}>{e[0]}</div><div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{e[1]}</div></div>
            <span className="link" onClick={() => toast('ok', 'Entitlement detail', 'Opens entitlement lineage (demo).')}>Detail</span>
          </div>
        ))}
        <div style={{ ...label, margin: '18px 0 10px' }}>Recent activity</div>
        <div className="tline">
          <div className="tline-it tl-ok"><span className="tl-dot" /><div className="tl-t">Authenticated to SAP S/4HANA</div><div className="tl-s">SSO · FIDO2 · London egress</div><div className="tl-time">{u.last}</div></div>
          <div className="tline-it tl-acc"><span className="tl-dot" /><div className="tl-t">Access request AR-20388 approved</div><div className="tl-s">Tableau viewer — approved by manager</div><div className="tl-time">3 days ago</div></div>
          {u.priv && <div className="tline-it tl-warn"><span className="tl-dot" /><div className="tl-t">Privileged checkout — prod database</div><div className="tl-s">45-min JIT window · session recorded</div><div className="tl-time">5 days ago</div></div>}
          <div className="tline-it"><span className="tl-dot" /><div className="tl-t">Quarterly certification — retained</div><div className="tl-s">All entitlements re-approved in Q2 campaign</div><div className="tl-time">Jun 14, 2026</div></div>
        </div>
      </div>
      {pwOpen && <ResetPasswordModal user={{ name: u.name, email: u.email }} onClose={() => setPwOpen(false)} />}
    </>
  )
}
