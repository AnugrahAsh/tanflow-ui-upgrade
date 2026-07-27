import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { StatusBadge, IntLogo } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { INTEGRATIONS } from '../data/mockData.js'

export default function Integrations() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Integrations"
        sub="First-class connectors for the enterprise estate — ERP, directories, databases, SaaS, SIEM and anything with an API."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="reports" />Connector logs</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Integration catalog', '120+ connectors: SAP, Oracle, Salesforce, SQL Server, AD, LDAP, mainframe, custom SCIM (demo).')}><Icon name="plus" />Add integration</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Active connectors" icon="integrations" val="12" foot="+ 42 SCIM apps" />
        <KpiTile label="Objects under management" icon="db" val="96.2" unit="K" foot="identities, groups, roles" />
        <KpiTile label="Sync operations (24h)" icon="refresh" val="8,412" foot="0 failed, 3 retried" />
        <KpiTile label="API traffic" icon="zap" val="1.1" unit="M/day" foot="p99 140ms · 0 throttled" />
      </div>
      <div className="grid-3">
        {INTEGRATIONS.map((g) => (
          <div className="int-card" key={g.n} onClick={() => toast('ok', g.n, 'Connector config: scopes, mapping, schedules, health history (demo).')}>
            <div style={{ display: 'flex', gap: 12, padding: '16px 18px 0', alignItems: 'flex-start' }}>
              <IntLogo item={g} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hrow" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 650 }}>{g.n}</span>
                  <StatusBadge status={g.status} />
                </div>
                <span className="tag" style={{ marginTop: 4 }}>{g.cat}</span>
              </div>
            </div>
            <div style={{ padding: '10px 18px 0', fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.55, flex: 1 }}>{g.desc}</div>
            <div style={{ padding: '12px 18px 15px' }}>
              <div className="hrow">
                <div className={`meter ${g.health >= 95 ? 'm-ok' : g.health >= 85 ? 'm-warn' : 'm-bad'}`} style={{ flex: 1 }}><i style={{ width: `${g.health}%` }} /></div>
                <span className="num" style={{ fontSize: '11.25px', fontWeight: 650 }}>{g.health}%</span>
              </div>
              <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--faint)' }}>
                <span>{g.objs}</span><span>Sync {g.sync}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
