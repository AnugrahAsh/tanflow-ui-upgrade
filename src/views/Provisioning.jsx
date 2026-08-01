import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'
import { fmt } from '../lib/format.js'

const PIPELINE = [
  ['HR event received', 'Workday webhook', 96],
  ['Identity created', 'Directory + UPN + mailbox', 96],
  ['Birthright granted', '12 policies evaluated', 94],
  ['Apps provisioned', 'SCIM · RFC · API', 91],
  ['Manager notified', 'Access summary issued', 91],
]
const EVENTS = [
  ['Joiner', 'Sofia Lindqvist — Payments', 'AD · M365 · SAP · T24', '41s', 'Completed', '8 min ago'],
  ['Leaver', 'Tomás Costa — Trading', '14 entitlements · 6 systems', '38s', 'Completed', '1 hr ago'],
  ['Mover', 'Divya Patel — Finance → Treasury', 'SoD re-check · 4 grants, 6 revokes', '2m 04s', 'Review', '2 hrs ago'],
  ['Joiner', 'Contractor batch (8) — IT Ops', 'AD · VPN · ServiceNow', '55s', 'Completed', '4 hrs ago'],
  ['Leaver', 'Georg Weber — Risk', '9 entitlements · vault checkin forced', '44s', 'Completed', '6 hrs ago'],
  ['Rehire', 'Ines Ferreira — Retail', 'Identity re-linked · history preserved', '1m 12s', 'Completed', 'Yesterday'],
]
const BIRTHRIGHT = [
  ['All employees', 'M365 E5 · VPN Standard · Intranet', 12480],
  ['Finance division', 'SAP FI Display · Tableau Viewer', 2214],
  ['Branch staff', 'T24 Teller · Cash Drawer', 8204],
  ['Engineering', 'GitHub · AWS Dev · CI/CD', 840],
  ['Contractors', 'Time-boxed VPN · sponsor renewal', 1204],
]
const QUEUE = [
  ['SAP role “Treasury Dealer” — D. Patel', 'SoD conflict must be risk-accepted', 'warn'],
  ['Mainframe RACF — 2 requests', 'No connector — manual task to Ops', 'mut'],
  ['Salesforce CPQ license', 'License pool exhausted (0 of 40)', 'bad'],
]
const EVENT_TONE = { Leaver: 'viol', Mover: 'warn' }

export default function Provisioning() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Provisioning & Lifecycle"
        sub="Joiner–mover–leaver automation driven by Workday events — birthright access, app fulfilment and guaranteed deprovisioning."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="reports" />SLA report</button>
            <button className="btn btn-pri"><Icon name="plus" />New workflow</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Events (7d)" icon="provisioning" val="694" delta={9} foot="12 joiners today" spark={wave(12, 40, 18, 17)} />
        <KpiTile label="Median fulfilment" icon="zap" val="38" unit="sec" delta={-26} goodUp={false} foot="end-to-end, all apps" />
        <KpiTile label="Deprovision SLA" icon="shieldCheck" val="100" unit="%" foot="leavers < 15 min" />
        <KpiTile label="Manual queue" icon="clock" val="7" foot="awaiting app owners" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <CardHeader title="Lifecycle pipeline" sub="A joiner event, end to end — live throughput per stage (today)" />
        <div className="card-pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0, alignItems: 'stretch' }}>
          {PIPELINE.map((s, i) => (
            <div key={s[0]} style={{ position: 'relative', padding: '14px 18px', borderRight: i < 4 ? '1px dashed var(--line-2)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ok-bg)', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10.5px', fontWeight: 700 }}>{i + 1}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 650 }}>{s[0]}</span>
              </div>
              <div style={{ fontSize: '11.25px', color: 'var(--mut)', marginTop: 5 }}>{s[1]}</div>
              <div style={{ fontSize: 16, fontWeight: 650, marginTop: 8 }} className="num">{s[2]}<span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 550 }}> today</span></div>
              {i < 4 && <span style={{ position: 'absolute', right: -9, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', background: 'var(--surface)', zIndex: 1 }}><Icon name="chevR" size={14} /></span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-23">
        <div className="card">
          <CardHeader title="Recent lifecycle events" sub="Streaming from Workday & ServiceNow" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Event</th><th>Identity</th><th>Systems touched</th><th>Duration</th><th>Status</th><th>When</th></tr></thead>
              <tbody>
                {EVENTS.map((e) => (
                  <tr key={e[1]} onClick={() => toast('ok', `${e[0]} — ${e[1].split(' — ')[0]}`, 'Full fulfilment trace across systems (demo).')}>
                    <td><Badge tone={EVENT_TONE[e[0]] || 'acc'} label={e[0]} dot={false} /></td>
                    <td className="td-main">{e[1]}</td>
                    <td style={{ color: 'var(--mut)' }}>{e[2]}</td>
                    <td className="td-num">{e[3]}</td>
                    <td><StatusBadge status={e[4]} /></td>
                    <td className="td-num" style={{ color: 'var(--mut)' }}>{e[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <CardHeader title="Birthright policies" sub="Evaluated on every joiner / mover" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {BIRTHRIGHT.map((p) => (
                <div className="hrow" key={p[0]} style={{ justifyContent: 'space-between', padding: '8.5px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div><div style={{ fontSize: '12.5px', fontWeight: 600 }}>{p[0]}</div><div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{p[1]}</div></div>
                  <span className="num" style={{ fontSize: '11.75px', color: 'var(--mut)', flex: 'none' }}>{fmt(p[2])} in scope</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <CardHeader title="Fulfilment queue" sub="Awaiting human action" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 12 }}>
              {QUEUE.map((q) => (
                <div className="hrow" key={q[0]} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: '12.25px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q[0]}</div>
                    <div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{q[1]}</div></div>
                  <button className="btn btn-sec btn-sm" style={{ flex: 'none' }} onClick={() => toast('ok', 'Task', 'Opened fulfilment task (demo).')}>Open</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
