import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const GROUPS = [
  ['Core Banking — Production', 84, 'Platform Ops', 'Restricted', true],
  ['SAP Landscape PRD', 52, 'SAP Basis', 'Restricted', true],
  ['Oracle & SQL Estates', 118, 'Data Platform', 'Restricted', true],
  ['Network Infrastructure', 203, 'NetOps', 'Standard', false],
  ['Cloud — AWS / Azure', 37, 'Cloud CoE', 'Restricted', true],
  ['Windows Server Estate', 641, 'Wintel', 'Standard', false],
]

export default function ConnectionGroups() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Connection Groups"
        sub="Organize targets into governed groups with shared access policies, owners and review cadence."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'New group', 'Create a connection group with owner + policy (demo).')}><Icon name="plus" />New group</button>}
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Groups" icon="folder" val="24" foot="6 restricted" />
        <KpiTile label="Targets grouped" icon="sso" val="1,135" foot="98% coverage" />
        <KpiTile label="Shared groups" icon="integrations" val="8" foot="cross-team access" />
        <KpiTile label="Owners assigned" icon="users" val="12" foot="all groups owned" />
      </div>
      <div className="grid-3">
        {GROUPS.map((g) => (
          <div className="card card-pad" key={g[0]} style={{ cursor: 'pointer' }} onClick={() => toast('ok', g[0], 'Group members, policy & access review (demo).')}>
            <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '13.5px', fontWeight: 650 }}>{g[0]}</span>
              {g[3] === 'Restricted' ? <Badge tone="viol" label="Restricted" dot={false} /> : <Badge tone="mut" label="Standard" dot={false} />}
            </div>
            <div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Owner {g[2]}</div>
            <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 12 }}>
              <span className="num" style={{ fontSize: '12.5px', fontWeight: 650 }}>{g[1]} <span style={{ color: 'var(--mut)', fontWeight: 400 }}>targets</span></span>
              {g[4] ? <Badge tone="ok" label="4-eyes required" /> : <span style={{ fontSize: '11px', color: 'var(--faint)' }}>Single approval</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
