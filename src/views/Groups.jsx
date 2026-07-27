import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, RiskPill } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { fmt } from '../lib/format.js'
import { GROUPS } from '../data/mockData.js'

export default function Groups() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Groups"
        sub="Security, application and business groups with membership governance and source-system sync."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="refresh" />Sync all</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'New group', 'Group creation with owner + review cadence (demo).')}><Icon name="plus" />New group</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Total groups" icon="groups" val="1,842" foot="across 6 sources" />
        <KpiTile label="Privileged groups" icon="vault" val="64" foot="all under recert" />
        <KpiTile label="Rule-based membership" icon="zap" val="38%" delta={6} foot="dynamic rules" />
        <KpiTile label="Ownerless groups" icon="warnTri" val="12" delta={-40} goodUp={false} foot="assignment due" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search groups…" /></div>
          <button className="fchip"><Icon name="filter" size={12} />Source: All</button>
          <button className="fchip"><Icon name="filter" size={12} />Type: All</button>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Group</th><th>Type</th><th>Source</th><th className="td-right">Members</th><th>Privilege</th><th>Risk</th><th>Last sync</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {GROUPS.map((g) => (
                <tr key={g.n} onClick={() => toast('ok', g.n, 'Opens group membership & lineage (demo).')}>
                  <td><div className="td-main">{g.n}</div></td>
                  <td><span className="tag">{g.type}</span></td>
                  <td style={{ color: 'var(--mut)' }}>{g.src}</td>
                  <td className="td-right td-num">{fmt(g.m)}</td>
                  <td>{g.priv ? <Badge tone="viol" label="Privileged" dot={false} /> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                  <td><RiskPill risk={g.risk} /></td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{g.sync}</td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="eye" size={14} /></button><button className="mini-btn"><Icon name="edit" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>10 of 1,842 groups</span><div className="pager"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button><button className="pg-btn"><Icon name="chevR" size={13} /></button></div></div>
      </div>
    </>
  )
}
