import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const PROFILES = [
  ['Read-only shadow', 'View live session, no input', 'SOC Tier-2 (18)', 'Active'],
  ['Collaborative control', 'Shared keyboard, dual cursor', 'DBA leads (6)', 'Active'],
  ['Vendor supervised', 'Vendor drives, sponsor watches', 'Vendor mgrs (4)', 'Active'],
  ['Break-glass reviewer', 'Post-hoc replay + annotate', 'CISO office (3)', 'Active'],
  ['Auditor (time-boxed)', 'Read-only, watermarked, expires', 'AuditCo LLP', 'Pending'],
  ['Training capture', 'Recorded for onboarding library', 'Enablement', 'Archived'],
]

export default function SharingProfiles() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Sharing Profiles"
        sub="Define how privileged sessions can be shared, shadowed and co-piloted — with recording and least-privilege by default."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'New profile', 'Configure sharing permissions, watermark and expiry (demo).')}><Icon name="plus" />New profile</button>}
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Sharing profiles" icon="integrations" val="18" foot="4 restricted" />
        <KpiTile label="Active shares" icon="activity" val="6" foot="2 supervised" />
        <KpiTile label="Recorded" icon="recordings" val="100" unit="%" foot="tamper-evident" />
        <KpiTile label="Expiring < 7d" icon="clock" val="3" foot="auto-revoke" />
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Profile</th><th>Permissions</th><th>Members</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {PROFILES.map((p) => (
                <tr key={p[0]} onClick={() => toast('ok', p[0], 'Sharing profile permissions & audit (demo).')}>
                  <td className="td-main">{p[0]}</td>
                  <td style={{ color: 'var(--mut)' }}>{p[1]}</td>
                  <td><span className="tag">{p[2]}</span></td>
                  <td><StatusBadge status={p[3]} /></td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="edit" size={14} /></button><button className="mini-btn"><Icon name="eye" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot"><span>All session shares are recorded and least-privilege by default.</span><Badge tone="ok" label="Zero standing share" /></div>
      </div>
    </>
  )
}
