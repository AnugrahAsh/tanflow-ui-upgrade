import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { fmt } from '../lib/format.js'

const OUS = [
  ['building', 'corp.meridianbank.com', 38204, 1],
  ['folder', 'Corporate HQ', 12480, 0],
  ['folder', 'EMEA Branches', 9214, 1],
  ['folder', 'APAC Branches', 6120, 0],
  ['folder', 'Service Accounts', 6120, 0],
  ['folder', 'Privileged (Tier 0)', 214, 0],
  ['folder', 'Workstations', 3841, 0],
  ['folder', 'Disabled — pending purge', 215, 0],
]
const DIRS = [
  ['corp.meridianbank.com', 'AD DS · 4 DCs', '24,208', 'Enabled', 'Healthy', '42 sec ago'],
  ['emea.meridianbank.com', 'AD DS · 2 DCs', '8,114', 'Enabled', 'Healthy', '58 sec ago'],
  ['ldap.legacy.meridian', 'OpenLDAP 2.6', '9,412', 'Read-only', 'Healthy', '2 min ago'],
  ['apac.meridianbank.com', 'AD DS · 2 DCs', '4,882', 'Enabled', 'Degraded', '31 min ago'],
  ['Tanflow Native', 'Cloud directory', '1,588', '—', 'Healthy', 'realtime'],
]
const ATTRS = [
  ['displayName', 'Workday', '→ AD, SAP, Salesforce'],
  ['department', 'Workday', '→ all systems'],
  ['sAMAccountName', 'Active Directory', '→ Tanflow'],
  ['employeeType', 'Workday', '→ policy engine'],
  ['mail', 'Exchange', '→ all systems'],
  ['msDS-KeyCredential', 'AD (FIDO2)', '→ auth plane'],
]

export default function Directory() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Directory Services"
        sub="Unified virtual directory over 4 AD forests, OpenLDAP and Tanflow-native identities — one schema, one policy plane."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="refresh" />Force delta sync</button>
            <button className="btn btn-pri"><Icon name="plus" />Add directory</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Directory objects" icon="directory" val="38,204" foot="users, groups, computers" />
        <KpiTile label="Forests / domains" icon="building" val="4 / 12" foot="2 trusts monitored" />
        <KpiTile label="Sync latency" icon="zap" val="42" unit="sec" delta={-12} goodUp={false} foot="p95 delta sync" />
        <KpiTile label="Attribute conflicts" icon="warnTri" val="3" foot="resolution queue" />
      </div>
      <div className="grid-32">
        <div className="card">
          <CardHeader title="Organizational units" sub="corp.meridianbank.com" />
          <div className="card-pad tree" style={{ paddingTop: 10 }}>
            {OUS.map((o, i) => (
              <div key={o[1]} className={`tree-it ${o[3] ? 'on' : ''}`} style={i > 0 ? { marginLeft: 16 } : undefined} onClick={() => toast('ok', o[1], 'OU policy & sync scope (demo).')}>
                <Icon name={o[0]} size={14} /><span>{o[1]}</span><span className="tr-n">{fmt(o[2])}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ fontSize: '11.5px', color: 'var(--mut)', padding: '0 10px', lineHeight: 1.55 }}>Tier-0 OU is under <b style={{ color: 'var(--ink-2)' }}>enhanced monitoring</b> — all writes require dual control.</div>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <CardHeader title="Connected directories" sub="Health & replication" />
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Directory</th><th>Type</th><th className="td-right">Objects</th><th>Writeback</th><th>Status</th><th>Last delta</th></tr></thead>
                <tbody>
                  {DIRS.map((d) => (
                    <tr key={d[0]} onClick={() => toast('ok', d[0], 'Replication topology & agent detail (demo).')}>
                      <td className="td-main mono" style={{ fontSize: '11.75px' }}>{d[0]}</td>
                      <td style={{ color: 'var(--mut)' }}>{d[1]}</td>
                      <td className="td-right td-num">{d[2]}</td>
                      <td>{d[3] === '—' ? <span style={{ color: 'var(--faint)' }}>—</span> : <span className="tag">{d[3]}</span>}</td>
                      <td><StatusBadge status={d[4]} /></td>
                      <td className="td-num" style={{ color: 'var(--mut)' }}>{d[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <CardHeader title="Schema & attribute flow" sub="Authoritative precedence: Workday → AD → Tanflow" />
            <div className="card-pad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              {ATTRS.map((a) => (
                <div className="hrow" key={a[0]} style={{ justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
                  <span className="code-chip">{a[0]}</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{a[1]} <span style={{ color: 'var(--faint)' }}>{a[2]}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
