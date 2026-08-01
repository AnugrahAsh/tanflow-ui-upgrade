import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Avatar, RiskPill } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { REQUESTS } from '../data/mockData.js'

export default function Requests() {
  const { toast } = useApp()
  const [leaving, setLeaving] = useState({})
  const [removed, setRemoved] = useState({})

  const decide = (id, ok) => {
    setLeaving((l) => ({ ...l, [id]: true }))
    toast(ok ? 'ok' : 'warn', ok ? 'Request approved' : 'Request rejected', `${id} ${ok ? 'approved — fulfilment started, requester notified.' : 'rejected with comment — requester notified.'}`)
    setTimeout(() => setRemoved((r) => ({ ...r, [id]: true })), 350)
  }

  return (
    <>
      <PageHead
        title="Access Requests"
        sub="Self-service requests with policy checks, SoD simulation and risk-weighted approval routing."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="settings" />Routing rules</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Request access', 'Catalog with 1,240 requestable items (demo).')}><Icon name="plus" />Request access</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Pending approvals" icon="requests" val="5" foot="2 high-risk" />
        <KpiTile label="Median approval time" icon="clock" val="3.4" unit="hrs" delta={-18} goodUp={false} foot="SLA: 24 hrs" />
        <KpiTile label="Auto-approved (low risk)" icon="zap" val="61%" delta={7} foot="policy-driven" />
        <KpiTile label="Emergency grants (30d)" icon="warnTri" val="4" foot="all time-boxed & recorded" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="seg"><button className="on">My queue (5)</button><button onClick={() => toast('ok', 'View', 'All open requests (demo)')}>All open</button><button onClick={() => toast('ok', 'View', 'History (demo)')}>History</button></div>
          <div className="tb-spacer" />
          <button className="fchip"><Icon name="filter" size={12} />Risk: All</button>
        </div>
        <div>
          {REQUESTS.filter((r) => !removed[r.id]).map((r) => (
            <div
              key={r.id}
              style={{ display: 'flex', gap: 14, padding: '15px 20px', borderBottom: '1px solid var(--hair)', alignItems: 'flex-start', ...(leaving[r.id] ? { transition: 'all .35s', opacity: 0, transform: 'translateX(12px)' } : null) }}
            >
              <Avatar name={r.user} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hrow" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 650 }}>{r.user}</span>
                  <span style={{ color: 'var(--faint)' }}>requests</span>
                  <span className="tag tag-acc">{r.item}</span>
                  <span className="tag">{r.type}</span>
                </div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 4 }}>“{r.just}”</div>
                <div className="hrow" style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
                  <RiskPill risk={r.risk} />
                  {r.sod && <span className="bdg bdg-bad"><Icon name="policies" size={11} />{r.sod}</span>}
                  <span style={{ fontSize: 11, color: 'var(--faint)' }}>{r.id} · {r.age} in queue · route: {r.appr}</span>
                </div>
              </div>
              <div className="hrow" style={{ flex: 'none', paddingTop: 4 }}>
                <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Simulation', 'Access simulation: net-new entitlements, SoD deltas, peer comparison (demo).')}><Icon name="eye" />Simulate</button>
                <button className="btn btn-sec btn-sm" style={{ color: 'var(--bad)', borderColor: 'var(--bad-line)' }} onClick={() => decide(r.id, false)}><Icon name="x" />Reject</button>
                <button className="btn btn-pri btn-sm" onClick={() => decide(r.id, true)}><Icon name="check" />Approve</button>
              </div>
            </div>
          ))}
        </div>
        <div className="tbl-foot"><span>Peer insight: 84% of Treasury analysts hold “Murex Read” — consider adding to role.</span></div>
      </div>
    </>
  )
}
