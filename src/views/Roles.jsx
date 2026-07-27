import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ROLES } from '../data/mockData.js'

export default function Roles() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Roles"
        sub="Enterprise RBAC — business roles mapped to entitlements across systems, with SoD awareness and certification cadence."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Role mining', 'AI role mining analyzes 48K identities for candidate roles (demo).')}><Icon name="sparkle" />Mine roles</button>
            <button className="btn btn-pri"><Icon name="plus" />New role</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Defined roles" icon="roles" val="386" foot="92% of access via roles" />
        <KpiTile label="Direct-assigned exceptions" icon="warnTri" val="2,104" delta={-14} goodUp={false} foot="target < 1,500" />
        <KpiTile label="Roles with SoD conflicts" icon="policies" val="8" foot="2 critical" />
        <KpiTile label="Certification overdue" icon="certs" val="1" foot="Treasury Dealer" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search roles…" /></div>
          <div className="tb-spacer" />
          <button className="btn btn-sec btn-sm"><Icon name="download" />Export matrix</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Role</th><th>Scope</th><th className="td-right">Assigned</th><th className="td-right">Entitlements</th><th>SoD</th><th>Owner</th><th>Next certification</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.n} onClick={() => toast('ok', r.n, 'Opens role composition & assignment graph (demo).')}>
                  <td className="td-main">{r.n}</td>
                  <td style={{ color: 'var(--mut)' }}>{r.scope}</td>
                  <td className="td-right td-num">{r.assign}</td>
                  <td className="td-right td-num">{r.ents}</td>
                  <td>{r.sod ? <Badge tone="bad" label={`${r.sod} conflict${r.sod > 1 ? 's' : ''}`} /> : <Badge tone="ok" label="Clean" />}</td>
                  <td style={{ color: 'var(--mut)' }}>{r.owner}</td>
                  <td>{r.cert === 'Overdue' ? <Badge tone="bad" label="Overdue" /> : <span className="num" style={{ color: 'var(--mut)' }}>{r.cert}</span>}</td>
                  <td><div className="row-actions"><button className="mini-btn"><Icon name="eye" size={14} /></button><button className="mini-btn"><Icon name="edit" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
