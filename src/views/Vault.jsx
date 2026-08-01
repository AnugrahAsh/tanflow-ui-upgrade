import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar, Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { SAFES } from '../data/mockData.js'

const CHECKOUTS = [
  ['SYS @ ora-fin-prd-03', 'Priya Sharma', 'INC-59912 — replication lag', '45 min · 12 left', 'PS-88409 · recording', 'Active'],
  ['root @ sap-prd-app01', 'Marcus Bennett', 'CHG-88214 — kernel patch', '2 hrs · 78 left', 'PS-88412 · recording', 'Active'],
  ['sa @ sql-risk-prd-07', 'Nadia Rahman', 'INC-59904 — job failure', '1 hr · 4 left', 'PS-88401 · recording', 'Active'],
  ['Administrator @ dc02', 'Erik Lindqvist', 'CHG-88209 — GPO update', '30 min · closed', 'RC-77202 · archived', 'Completed'],
  ['ec2-admin @ aws-bastion', 'Julia Novak', 'DEP-1204 — release', '15 min · closed', 'RC-77149 · archived', 'Completed'],
]

export default function Vault() {
  const { go, toast } = useApp()
  const stop = (e, fn) => { e.stopPropagation(); fn() }
  return (
    <>
      <PageHead
        title="Credential Vault"
        sub="FIPS 140-2 vaulting for privileged credentials, keys and secrets — automatic rotation, checkout workflow and break-glass."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Rotation', 'Rotation sweep scheduled for all due credentials (demo).')}><Icon name="refresh" />Rotate due now</button>
            <button className="btn btn-pri"><Icon name="plus" />New safe</button>
          </>
        }
      />
      <div className="kpi-row cols-5">
        <KpiTile label="Vaulted credentials" icon="vault" val="1,135" delta={4} foot="across 6 safes" />
        <KpiTile label="Rotation success (30d)" icon="refresh" val="99.2" unit="%" foot="3 pending retries" />
        <KpiTile label="Checkouts today" icon="unlock" val="36" foot="all ticket-linked" />
        <KpiTile label="Break-glass accounts" icon="lock" val="4" foot="sealed · dual-control" />
        <KpiTile label="Hardcoded secrets found" icon="warnTri" val="7" delta={-46} goodUp={false} foot="CI/CD scanner" />
      </div>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        {SAFES.map((s) => (
          <div className="card card-pad" key={s.n} style={{ cursor: 'pointer' }} onClick={() => toast('ok', s.n, 'Safe contents, members & rotation policy (demo).')}>
            <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '13.5px', fontWeight: 650 }}>{s.n}</span>
              <span className="num" style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{s.accts} accts</span>
            </div>
            <div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{s.pf} · rotate {s.rot.toLowerCase()} · owner {s.owner}</div>
            <div className="hrow" style={{ marginTop: 12 }}>
              <div className={`meter ${s.health >= 95 ? 'm-ok' : 'm-warn'}`} style={{ flex: 1 }}><i style={{ width: `${s.health}%` }} /></div>
              <span className="num" style={{ fontSize: '11.5px', fontWeight: 650 }}>{s.health}%</span>
            </div>
            <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{s.checkout} active checkouts</span>
              {s.health === 100 ? <Badge tone="ok" label="All rotated" /> : s.health >= 90 ? <Badge tone="warn" label="Rotation due" /> : <Badge tone="bad" label="Attention" />}
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <CardHeader title="Recent checkouts" sub="Every checkout is reason-coded, time-boxed and session-recorded" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Credential</th><th>Checked out by</th><th>Reason / ticket</th><th>Window</th><th>Session</th><th>Status</th><th style={{ width: 88 }} /></tr></thead>
            <tbody>
              {CHECKOUTS.map((c) => (
                <tr key={c[0]} onClick={() => go('sessions')}>
                  <td className="td-mono">{c[0]}</td>
                  <td><div className="cell-user"><Avatar name={c[1]} cls="av-sm" /><span>{c[1]}</span></div></td>
                  <td style={{ color: 'var(--mut)' }}>{c[2]}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{c[3]}</td>
                  <td className="td-mono" style={{ color: 'var(--mut)' }}>{c[4]}</td>
                  <td><StatusBadge status={c[5]} /></td>
                  <td>
                    <div className="row-actions">
                      {c[5] === 'Active' ? (
                        <>
                          <button className="mini-btn" title="Watch live" onClick={(e) => stop(e, () => go('sessions'))}><Icon name="eye" size={14} /></button>
                          <button className="mini-btn danger" title="Force check-in" onClick={(e) => stop(e, () => toast('warn', 'Force check-in', 'Credential rotated & session closed (demo).'))}><Icon name="lock" size={14} /></button>
                        </>
                      ) : (
                        <button className="mini-btn" title="Replay" onClick={(e) => stop(e, () => go('recordings'))}><Icon name="play" size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
