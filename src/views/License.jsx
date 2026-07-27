import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, MeterRow } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const MODULES = [
  ['Identity Governance (IGA)', 'Unlimited', 'Included'],
  ['Privileged Access (PAM)', '5,000 seats', '3,842 used'],
  ['Secrets Management', 'Unlimited', 'Included'],
  ['Adaptive / Risk Engine', 'Enabled', 'Included'],
  ['AAA (RADIUS/TACACS+)', '2,000 devices', '1,204 used'],
  ['External / Vendor Access', '250 parties', '14 used'],
]

export default function License() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="License"
        sub="Subscription entitlements, seat usage and support plan for the Meridian Global Bank tenant."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Usage export', 'Entitlement & consumption report generated (demo).')}><Icon name="download" />Usage report</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Contact TAM', 'Message routed to your named Technical Account Manager (demo).')}><Icon name="mail" />Contact TAM</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Plan" icon="certs" val="Enterprise" foot="renews Mar 2027" />
        <KpiTile label="PAM seats" icon="vault" val="3,842" foot="of 5,000 (77%)" />
        <KpiTile label="Support" icon="shieldCheck" val="Premier" foot="15-min P1 SLA" />
        <KpiTile label="Compliance add-ons" icon="compliance" val="4" foot="SOX · PCI · ISO · GDPR" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Entitlements" sub="Modules & consumption" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Module</th><th>Entitlement</th><th>Usage</th></tr></thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr key={m[0]}>
                    <td className="td-main">{m[0]}</td>
                    <td><span className="tag">{m[1]}</span></td>
                    <td style={{ color: 'var(--mut)' }}>{m[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Seat usage" sub="Consumption vs. entitlement" />
          <div className="card-pad" style={{ paddingTop: 10 }}>
            <MeterRow label="PAM privileged seats" val="77%" pct={77} mood="m-warn" />
            <MeterRow label="AAA devices" val="60%" pct={60} mood="m-ok" />
            <MeterRow label="External parties" val="6%" pct={6} mood="m-ok" />
            <div className="divider" />
            <div className="dl">
              <div className="dl-k">Subscription</div><div className="dl-v">Tanflow Enterprise</div>
              <div className="dl-k">Term</div><div className="dl-v">Apr 2024 – Mar 2027</div>
              <div className="dl-k">Support</div><div className="dl-v">Premier · named TAM</div>
            </div>
            <div className="hrow" style={{ justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)' }}>License status</span>
              <Badge tone="ok" label="Active" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
