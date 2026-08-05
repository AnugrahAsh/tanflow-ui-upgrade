import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const lbl = { fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }
const RISK = {
  Critical: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)', arrow: 'aUp' },
  High: { c: '#C2740B', bg: 'var(--warn-bg)', b: 'var(--warn-line)', arrow: 'aUp' },
  Medium: { c: '#9A7B1A', bg: '#FBF3E0', b: 'var(--warn-line)', arrow: null },
  Low: { c: 'var(--mut)', bg: 'var(--surface-2)', b: 'var(--line)', arrow: 'aDown' },
}
const RiskPill = ({ risk }) => {
  const r = RISK[risk]
  return <span className="hrow" style={{ gap: 4, width: 'fit-content', fontSize: '11.5px', fontWeight: 600, color: r.c, background: r.bg, border: `1px solid ${r.b}`, borderRadius: 'var(--r-sm)', padding: '2px 8px', whiteSpace: 'nowrap' }}>{r.arrow ? <Icon name={r.arrow} size={10} /> : <span style={{ fontWeight: 700 }}>—</span>}{risk}</span>
}
const FlagPill = ({ text }) => (
  <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--bad)', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)', padding: '2px 8px', whiteSpace: 'nowrap' }}><Icon name="policies" size={11} />{text}</span>
)
const IdChip = ({ id }) => <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', padding: '2px 7px', whiteSpace: 'nowrap' }}>{id}</span>

const QUEUE = [
  { id: 'AR-20441', who: 'Divya Patel', item: 'SAP_FI_Payments_Approvers', kind: 'Group membership', why: 'Covering month-end close for R. Moreno (PTO)', risk: 'High', flag: 'Conflicts with: Payment Creator', queued: '2h in queue', route: 'L. Dahl → Finance Controls', window: 'Standard · 5 business days', chain: [['Submitted by Divya Patel', 'Policy checks passed · risk scored High', '2h ago', 'done'], ['Manager review', 'L. Dahl — pending', 'now', 'wait']] },
  { id: 'AR-20438', who: 'Jonas Weber', item: 'Production DBA — Oracle', kind: 'Role', why: 'P1 incident INC-59912 — replication lag', risk: 'Critical', queued: '4h in queue', route: 'Emergency · auto-expires 8h', window: 'Emergency · auto-expires 8h after grant', chain: [['Submitted by Jonas Weber', 'Policy checks passed · risk scored Critical', '4h ago', 'done'], ['Manager approved', 'L. Dahl — “coverage confirmed”', '1 hr after submit', 'done'], ['Awaiting: Emergency', '4-eyes + CISO sign-off required', 'now', 'wait']] },
  { id: 'AR-20431', who: 'Keiko Tanaka', item: 'Salesforce — Marketing Cloud', kind: 'Application', why: 'New campaign analytics responsibilities', risk: 'Low', queued: '1d in queue', route: 'Manager → App Owner', window: 'Standard · until role change', chain: [['Submitted by Keiko Tanaka', 'Policy checks passed · risk scored Low', '1d ago', 'done'], ['Awaiting: App Owner', 'Marketing platform owner', 'now', 'wait']] },
  { id: 'AR-20427', who: 'Carlos Ruiz', item: 'VPN — Contractor Profile', kind: 'Network access', why: 'Vendor engagement ends Sep 30', risk: 'Medium', queued: '1d in queue', route: 'Sponsor → Security', window: 'Time-boxed · expires Sep 30, 2026', chain: [['Submitted by Carlos Ruiz', 'Policy checks passed · risk scored Medium', '1d ago', 'done'], ['Sponsor approved', 'Vendor sponsor confirmed', '4h ago', 'done'], ['Awaiting: Security', 'Network access review', 'now', 'wait']] },
  { id: 'AR-20419', who: 'Freya Berg', item: 'SWIFT Operators', kind: 'Group membership', why: 'Backfill for departing operator', risk: 'Critical', flag: 'Requires 4-eyes + CISO sign-off', queued: '2d in queue', route: 'Dual approval pending', window: 'Standard · reviewed quarterly', chain: [['Submitted by Freya Berg', 'Policy checks passed · risk scored Critical', '2d ago', 'done'], ['Awaiting: 4-eyes', 'Payment ops + CISO delegate', 'now', 'wait']] },
]
const DECIDED = [
  { id: 'AR-20412', who: 'Marcus Bennett', item: 'root — sap-prd-app01', kind: 'Role', risk: 'Medium', status: 'Approved', when: 'Yesterday' },
  { id: 'AR-20408', who: 'Erik Lindqvist', item: 'GPO editors — dc02.corp', kind: 'Group membership', risk: 'Low', status: 'Approved', when: '2 days ago' },
  { id: 'AR-20401', who: 'Omar Aziz', item: 'Firewall admin — fw-core-01', kind: 'Role', risk: 'Critical', status: 'Rejected', when: '3 days ago' },
  { id: 'AR-20396', who: 'Julia Novak', item: 'k8s deploy — payments', kind: 'Application', risk: 'Medium', status: 'Expired', when: '5 days ago' },
]
const ROUTES = [
  ['zap', 'Low risk', 'Auto-approve with policy checks'],
  ['user', 'Medium risk', 'Manager → application owner'],
  ['shieldCheck', 'High risk', '+ Security review & SoD simulation'],
  ['lock', 'Critical risk', '4-eyes + CISO sign-off, time-boxed'],
]
const STATUS_TONE = { Approved: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' }, Rejected: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)' }, Expired: { c: 'var(--mut)', bg: 'var(--surface-3)', b: 'var(--line)' } }

// ── request drawer ───────────────────────────────────────────────────────────
function RequestDrawer({ req: r, onDecide }) {
  const { toast, closeDrawer } = useApp()
  const REQUEST = [['Item', <><span>{r.item}</span> <span className="tag">{r.kind}</span></>], ['Justification', <em>“{r.why}”</em>], ['Window', r.window], ['Routing', r.route]]
  const SUPPORT = [['Peer coverage', '12% of peers hold this — outlier grant'], ['Requester risk', <span className="hrow" style={{ gap: 7 }}><RiskPill risk={r.risk} /><span style={{ color: 'var(--mut)' }}>identity score</span></span>], ['Last certification', 'Q2 2026 — retained in full'], ['If approved', 'No policy conflicts · fulfils via role assignment']]
  return (
    <>
      <div className="drawer-h">
        <div className="hrow" style={{ gap: 12, alignItems: 'flex-start', paddingBottom: 10 }}>
          <Avatar name={r.who} cls="av-sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.015em' }}>{r.id} — {r.item}</div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Requested by {r.who} · in queue {r.queued.replace(' in queue', '')}</div>
          </div>
        </div>
        <div className="hrow" style={{ gap: 7, flexWrap: 'wrap', paddingBottom: 12 }}>
          <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warn-core)' }} />Pending</span>
          <RiskPill risk={r.risk} />
          <span className="hrow" style={{ gap: 5, fontSize: '11.5px', color: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><Icon name="clock" size={11} />{r.window}</span>
        </div>
        <div className="hrow" style={{ gap: 8, paddingBottom: 14, borderBottom: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Simulation', `${r.id}: no new SoD conflicts if approved (demo).`)}><Icon name="eye" size={13} />Simulate</button>
          <button className="btn btn-sec btn-sm" style={{ color: 'var(--bad)', borderColor: 'var(--bad-line)' }} onClick={() => { closeDrawer(); onDecide(r, 'reject') }}><Icon name="x" size={13} />Reject</button>
          <button className="btn btn-pri btn-sm" onClick={() => { closeDrawer(); onDecide(r, 'approve') }}><Icon name="check" size={13} />Approve</button>
        </div>
      </div>

      <div className="drawer-body">
        <div style={{ ...lbl, margin: '16px 0 6px' }}>Request</div>
        <div className="dl">{REQUEST.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></div>)}</div>

        <div style={{ ...lbl, margin: '22px 0 8px' }}>Approval chain</div>
        {r.chain.map(([title, sub, when, state], i) => {
          const done = state === 'done'
          return (
            <div key={i} className="hrow" style={{ gap: 11, alignItems: 'flex-start', padding: '10px 12px', marginBottom: 8, borderRadius: 'var(--r-sm)', background: done ? 'var(--ok-bg)' : 'var(--warn-bg)', border: `1px solid ${done ? 'var(--ok-line)' : 'var(--warn-line)'}` }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${done ? 'var(--ok)' : 'var(--warn-core)'}`, background: done ? 'var(--ok)' : 'transparent', flex: 'none', marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12.75px', fontWeight: 650, color: 'var(--ink)' }}>{title}</div>
                <div style={{ fontSize: '11.75px', color: 'var(--ink-2)', marginTop: 1 }}>{sub}</div>
                <div style={{ fontSize: '11px', color: 'var(--mut)', marginTop: 2 }}>{when}</div>
              </div>
            </div>
          )
        })}

        <div style={{ ...lbl, margin: '22px 0 6px' }}>Decision support</div>
        <div className="dl">{SUPPORT.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></div>)}</div>

        {r.flag && (
          <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 18, padding: '12px 14px', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="warnTri" size={15} style={{ color: 'var(--bad)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.flag} — resolve or accept the exception before approving.</div>
          </div>
        )}
      </div>
    </>
  )
}

export default function ChangeManagement() {
  const { toast, go, openDrawer } = useApp()
  const [tab, setTab] = useState('queue')
  const [queue, setQueue] = useState(QUEUE)

  const decide = (r, kind) => {
    setQueue((qs) => qs.filter((x) => x.id !== r.id))
    if (kind === 'approve') toast('ok', 'Request approved', `${r.id} — ${r.item} granted, time-boxed and recorded (demo).`)
    else toast('warn', 'Request rejected', `${r.id} returned to ${r.who} with a comment (demo).`)
  }
  const openReq = (r) => openDrawer(<RequestDrawer req={r} onDecide={decide} />)
  const countBy = (risk) => queue.filter((r) => r.risk === risk).length

  return (
    <>
      <PageHead
        title="Change Management"
        sub="Time-bound privileged-access requests with policy checks, SoD simulation and risk-weighted approval routing."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Routing rules', 'Edit the risk-weighted approval routes (demo).')}><Icon name="settings" />Routing rules</button>
            <button className="btn btn-pri" onClick={() => go('create-change-request')}><Icon name="plus" />New request</button>
          </>
        }
      />

      <div className="kpi-row cols-5">
        <KpiTile label="Pending approvals" icon="requests" val={queue.length} foot={`${queue.filter((r) => ['Critical', 'High'].includes(r.risk)).length} high-risk`} />
        <KpiTile label="Median approval time" icon="clock" val="3.4" unit="hrs" delta={-18} goodUp={false} foot="SLA 24 hrs" />
        <KpiTile label="Active windows now" icon="lock" val="1" foot="time-boxed grants" />
        <KpiTile label="Auto-approved (low risk)" icon="zap" val="61" unit="%" delta={7} foot="policy-driven" />
        <KpiTile label="Emergency grants (30d)" icon="warnTri" val="4" foot="all time-boxed &amp; recorded" />
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === 'queue' ? 'on' : ''}`} onClick={() => setTab('queue')}>Approval queue ({queue.length})</button>
        <button className={`tab ${tab === 'all' ? 'on' : ''}`} onClick={() => setTab('all')}>All requests ({queue.length + DECIDED.length})</button>
      </div>

      {tab === 'queue' ? (
        <div className="grid-23">
          <div className="card">
            <div className="card-h">
              <div><div className="ch-t">Awaiting your decision</div><div className="ch-s">Risk-weighted routing · simulate before approving</div></div>
              <div className="ch-right"><span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 600, color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warn-core)' }} />{queue.length} pending</span></div>
            </div>

            {queue.length === 0 ? (
              <div className="empty" style={{ padding: '64px 20px' }}><div className="e-ic"><Icon name="check" size={22} /></div><div className="e-t">Queue is clear</div><div className="e-s">Every request has been decided. New ones route here automatically.</div></div>
            ) : queue.map((r) => (
              <div key={r.id} onClick={() => openReq(r)} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderTop: '1px solid var(--hair)', cursor: 'pointer', flexWrap: 'wrap' }}>
                <Avatar name={r.who} cls="av-sm" />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div className="hrow" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{r.who}</span>
                    <span style={{ fontSize: '12.75px', color: 'var(--mut)' }}>requests</span>
                    <span className="tag tag-acc">{r.item}</span>
                    <span className="tag">{r.kind}</span>
                  </div>
                  <div style={{ fontSize: '12.75px', color: 'var(--ink-2)', marginTop: 5 }}>“{r.why}”</div>
                  <div className="hrow" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <RiskPill risk={r.risk} />
                    {r.flag && <FlagPill text={r.flag} />}
                    <IdChip id={r.id} />
                    <span className="hrow" style={{ gap: 5, fontSize: '11.5px', color: 'var(--mut)' }}><Icon name="clock" size={11} />{r.queued}</span>
                  </div>
                  <div className="hrow" style={{ gap: 5, marginTop: 7, fontSize: '11.75px', color: 'var(--mut)' }}><Icon name="upRight" size={11} />{r.route}</div>
                </div>
                <div className="hrow" style={{ gap: 8, flex: 'none' }} onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-sec btn-sm" style={{ border: 'none' }} onClick={() => toast('ok', 'Simulation', `${r.id}: no new SoD conflicts if approved (demo).`)}><Icon name="eye" size={13} />Simulate</button>
                  <button className="btn btn-sec btn-sm" style={{ color: 'var(--bad)', borderColor: 'var(--bad-line)' }} onClick={() => decide(r, 'reject')}>Reject</button>
                  <button className="btn btn-pri btn-sm" onClick={() => decide(r, 'approve')}><Icon name="check" size={13} />Approve</button>
                </div>
              </div>
            ))}
          </div>

          <div className="stack">
            <div className="card">
              <div className="card-h"><div><div className="ch-t">Decision context</div><div className="ch-s">What needs attention in this queue</div></div></div>
              <div className="card-pad" style={{ paddingTop: 4 }}>
                {['Critical', 'High', 'Medium', 'Low'].map((k) => (
                  <div key={k} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                    <RiskPill risk={k} /><span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' }}>{countBy(k)} pending</span>
                  </div>
                ))}
                <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', paddingTop: 12 }}>
                  <Icon name="policies" size={15} style={{ color: 'var(--mut)', flex: 'none', marginTop: 1 }} />
                  <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}><span className="mono" style={{ fontSize: '11.5px' }}>AR-20441</span> introduces an SoD conflict (Payment Creator ↔ Approver) — simulate before deciding.</div>
                </div>
                <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', paddingTop: 12 }}>
                  <Icon name="warnTri" size={15} style={{ color: 'var(--mut)', flex: 'none', marginTop: 1 }} />
                  <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}><span className="mono" style={{ fontSize: '11.5px' }}>AR-20438</span> is an emergency grant — auto-expires after 8h, session recorded.</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h"><div><div className="ch-t">Approval routing</div><div className="ch-s">Risk-weighted routes in effect</div></div></div>
              <div className="card-pad" style={{ paddingTop: 4 }}>
                {ROUTES.map(([icon, title, sub]) => (
                  <div key={title} className="hrow" style={{ gap: 11, alignItems: 'flex-start', padding: '11px 0', borderBottom: '1px solid var(--hair)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={14} style={{ color: 'var(--mut)' }} /></span>
                    <div><div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{title}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{sub}</div></div>
                  </div>
                ))}
                <span className="link hrow" style={{ gap: 5, fontSize: '12.5px', marginTop: 12 }} onClick={() => toast('ok', 'Routing rules', 'Edit the risk-weighted approval routes (demo).')}>Edit routing rules <Icon name="chevR" size={12} /></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-h"><div><div className="ch-t">All requests</div><div className="ch-s">Every access request with its routing outcome</div></div></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Request</th><th>Requester</th><th>Item</th><th>Type</th><th>Risk</th><th>Status</th><th>Decided</th></tr></thead>
              <tbody>
                {[...queue.map((r) => ({ ...r, status: 'Pending', when: r.queued })), ...DECIDED].map((r) => {
                  const t = STATUS_TONE[r.status] || { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' }
                  return (
                    <tr key={r.id} onClick={() => (r.status === 'Pending' ? openReq(queue.find((q) => q.id === r.id)) : toast('ok', r.id, `${r.item} — ${r.status.toLowerCase()} (demo).`))}>
                      <td className="mono" style={{ fontSize: '11.75px', fontWeight: 600 }}>{r.id}</td>
                      <td><div className="hrow" style={{ gap: 9 }}><Avatar name={r.who} cls="av-sm" /><span style={{ fontSize: '12.75px' }}>{r.who}</span></div></td>
                      <td className="td-main">{r.item}</td>
                      <td><span className="tag">{r.kind}</span></td>
                      <td><RiskPill risk={r.risk} /></td>
                      <td><span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '11.5px', fontWeight: 600, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: t.c }} />{r.status}</span></td>
                      <td style={{ color: 'var(--mut)' }}>{r.when}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
