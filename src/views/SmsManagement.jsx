import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, StatusBadge, MeterRow } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const PROVIDERS = [
  ['Twilio', 'Primary', '99.1%', '1.2s', 'Online'],
  ['Infobip', 'Failover', '98.7%', '1.6s', 'Online'],
  ['AWS SNS', 'Regional (APAC)', '99.4%', '0.9s', 'Online'],
  ['Vonage', 'Standby', '—', '—', 'Disabled'],
]

export default function SmsManagement() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="SMS Management"
        sub="One-time-code and alert delivery over SMS — multi-provider routing with automatic failover and per-country compliance."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'Add provider', 'Connect an SMS gateway with routing rules (demo).')}><Icon name="plus" />Add provider</button>}
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Messages (24h)" icon="phone" val="9,412" delta={2} foot="OTP + alerts" />
        <KpiTile label="Delivery rate" icon="shieldCheck" val="99.0" unit="%" foot="auto-failover" />
        <KpiTile label="Avg latency" icon="zap" val="1.2" unit="s" foot="to handset" />
        <KpiTile label="Countries" icon="globe" val="12" foot="sender IDs registered" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Providers" sub="Routing pool with failover" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Provider</th><th>Role</th><th className="td-right">Delivery</th><th className="td-right">Latency</th><th>Status</th></tr></thead>
              <tbody>
                {PROVIDERS.map((p) => (
                  <tr key={p[0]} onClick={() => toast('ok', p[0], 'Provider credentials, routing & usage (demo).')}>
                    <td className="td-main">{p[0]}</td>
                    <td><span className="tag">{p[1]}</span></td>
                    <td className="td-right td-num">{p[2]}</td>
                    <td className="td-right td-num">{p[3]}</td>
                    <td><StatusBadge status={p[4]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="Traffic by region" sub="Last 24 hours" />
          <div className="card-pad" style={{ paddingTop: 10 }}>
            <MeterRow label="United Kingdom" val="41%" pct={41} mood="m-ok" />
            <MeterRow label="India" val="28%" pct={28} mood="m-ok" />
            <MeterRow label="Germany" val="14%" pct={14} />
            <MeterRow label="Singapore" val="9%" pct={9} />
            <MeterRow label="Other" val="8%" pct={8} />
            <div className="divider" />
            <div className="hrow" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)' }}>SMS as MFA fallback</span>
              <Badge tone="warn" label="Retiring Oct 2026" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
