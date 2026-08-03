import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CONN_GROUPS } from '../data/connGroups.js'

export default function ConnectionGroups() {
  const { go } = useApp()
  const balancing = CONN_GROUPS.filter((g) => g.type === 'Balancing').length
  const affinity = CONN_GROUPS.filter((g) => g.affinity).length

  return (
    <>
      <PageHead
        title="Connection Groups"
        sub="Folders that structure the target tree and carry inherited policies — organizational groups organize; balancing groups distribute sessions across their members."
        actions={<button className="btn btn-pri" onClick={() => go('create-connection-group')}><Icon name="plus" />New group</button>}
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Groups" icon="folder" val={CONN_GROUPS.length} foot="2 levels deep" />
        <KpiTile label="Balancing groups" icon="zap" val={balancing} foot="distribute new sessions" />
        <KpiTile label="Targets grouped" icon="link" val="17" foot="0 ungrouped" />
        <KpiTile label="Session affinity" icon="refresh" val={affinity} unit="grp" foot="reconnects users to last target" />
      </div>

      <div className="card">
        <CardHeader title="Groups" sub="Policies, permissions and command baselines inherit down the tree" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Group</th><th>Type</th><th>Location</th><th>Contents</th><th>Session affinity</th><th>Limits</th></tr></thead>
            <tbody>
              {CONN_GROUPS.map((g) => (
                <tr key={g.id} onClick={() => go('edit-connection-group/' + g.id)}>
                  <td>
                    <div className="hrow" style={{ gap: 10 }}><Icon name="folder" size={15} style={{ color: 'var(--mut)' }} /><span className="td-main">{g.name}</span></div>
                  </td>
                  <td>{g.type === 'Balancing' ? <Badge tone="viol" label="Balancing" dot={false} /> : <span className="tag">Organizational</span>}</td>
                  <td className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{g.location}</td>
                  <td style={{ color: 'var(--ink-2)' }}>{g.contents}</td>
                  <td>{g.affinity ? <Badge tone="ok" label="Enabled" /> : <span style={{ color: 'var(--mut)' }}>Disabled</span>}</td>
                  <td>{g.maxConns ? <span className="num" style={{ color: 'var(--ink-2)' }}>{g.maxConns} max · {g.maxPerUser}/user</span> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hrow" style={{ gap: 8, padding: '12px 16px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
          <Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: “Prod DB pool” balances 3 targets with affinity on — users land back on the node that holds their temp tables.
        </div>
      </div>
    </>
  )
}
