import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { StatusBadge, RiskPill } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const CONNS = [
  ['sql-hr-prd-02', 'TDS', 'p.sharma', '2 min ago', 'Critical', 'Active'],
  ['fw-core-01', 'SSH', 'v.sokolov', '18 min ago', 'Medium', 'Active'],
  ['ora-fin-prd-03', 'SQL*Net', 'admin', '1 hr ago', 'High', 'Idle'],
  ['core-sw-04', 'SSH', 'h.kobayashi', '3 hrs ago', 'Low', 'Closed'],
  ['BTSPAMDEV01', 'RDP', 'm.bennett', 'Yesterday', 'Low', 'Closed'],
  ['aws-prod-bastion', 'SSH', 'p.sharma', '2 days ago', 'Medium', 'Closed'],
]

export default function Connections() {
  const { go, toast } = useApp()
  return (
    <>
      <PageHead
        title="All Connections"
        sub="Every privileged connection defined across the estate — targets, protocols and who can reach them."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="download" />Export</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'New connection', 'Define a target, protocol and access policy (demo).')}><Icon name="plus" />New connection</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Total connections" icon="sso" val="312" delta={4} foot="44 in current range" />
        <KpiTile label="Active now" icon="activity" val="6" foot="2 high-risk" />
        <KpiTile label="Protocols" icon="commands" val="7" foot="SSH · RDP · SQL · TDS…" />
        <KpiTile label="Median duration" icon="clock" val="23" unit="min" foot="p95: 2.1 hrs" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search targets, users, protocols…" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Protocol: All</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm" onClick={() => go('sessions')}><Icon name="sessions" />Live sessions</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Target</th><th>Protocol</th><th>User</th><th>Last used</th><th>Risk</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {CONNS.map((c) => (
                <tr key={c[0] + c[2]} onClick={() => go('sessions')}>
                  <td className="td-main mono" style={{ fontSize: '11.75px' }}>{c[0]}</td>
                  <td><span className="tag">{c[1]}</span></td>
                  <td className="td-mono" style={{ color: 'var(--mut)' }}>{c[2]}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{c[3]}</td>
                  <td><RiskPill risk={c[4]} /></td>
                  <td>{c[5] === 'Idle' ? <StatusBadge status="Pending" /> : <StatusBadge status={c[5] === 'Active' ? 'Active' : 'Completed'} />}</td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="play" size={14} /></button><button className="mini-btn"><Icon name="eye" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>6 of 312 connections</span><div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button><button className="pg-btn"><Icon name="chevR" size={13} /></button></div></div>
      </div>
    </>
  )
}
