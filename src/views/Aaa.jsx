import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { StatusBadge, Legend } from '../components/primitives.jsx'
import { AreaChart } from '../components/charts/index.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave, H24 } from '../lib/series.js'
import { AAA_CLIENTS } from '../data/mockData.js'

const AAA_VOL = wave(24, 8200, 3800, 37, -1, 0).map((v, i) => (i >= 7 && i <= 19 ? v + 5200 : v))
const yK = (v) => (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)

const POOL = [
  ['aaa-eu-1 · Frankfurt', '412K req/day', 'Online'],
  ['aaa-eu-2 · Dublin', '388K req/day', 'Online'],
  ['aaa-ap-1 · Singapore', '214K req/day', 'Online'],
  ['aaa-us-1 · Virginia', '96K req/day', 'Online'],
]
const POLICIES = [
  ['Network admins', 'TACACS+ cmd sets · privilege 15 w/ per-command audit'],
  ['Branch VPN', 'RADIUS · posture check + geo fence + MFA'],
  ['Corporate Wi-Fi', 'EAP-TLS only · device cert from Tanflow CA'],
  ['IoT / OT segment', 'MAC auth + micro-segmentation VLAN push'],
]

export default function Aaa() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="AAA Server"
        sub="Carrier-grade RADIUS and TACACS+ — authentication, authorization and accounting for network gear, VPN and Wi-Fi at scale."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="download" />Accounting export</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Register NAS', 'Add a network access server with shared-secret rotation (demo).')}><Icon name="plus" />Register NAS</button>
          </>
        }
      />
      <div className="kpi-row cols-5">
        <KpiTile label="Requests (24h)" icon="aaa" val="1.11" unit="M" delta={2} foot="RADIUS + TACACS+" spark={wave(12, 50, 20, 41)} />
        <KpiTile label="Reject rate" icon="ban" val="0.7" unit="%" delta={-0.2} goodUp={false} foot="baseline 1.1%" />
        <KpiTile label="p99 response" icon="zap" val="11" unit="ms" foot="across 3 regions" />
        <KpiTile label="Registered NAS devices" icon="server" val="1,204" foot="12 pending review" />
        <KpiTile label="EAP-TLS share" icon="shieldCheck" val="94" unit="%" delta={3} foot="cert-based Wi-Fi" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <CardHeader title="Authentication volume" sub="RADIUS + TACACS+ requests per hour · last 24h" right={<Legend items={[{ c: '#2a78d6', n: 'Requests', line: true }]} />} />
        <div className="card-pad" style={{ paddingTop: 10 }}>
          <AreaChart series={[{ name: 'Requests', color: '#2a78d6', data: AAA_VOL }]} labels={H24} yFmt={yK} xEvery={3} h={190} />
        </div>
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Network access servers" sub="Clients authenticating against Tanflow AAA" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>NAS group</th><th>Address space</th><th>Protocol</th><th className="td-right">Requests (24h)</th><th className="td-right">Failure</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
              <tbody>
                {AAA_CLIENTS.map((c) => (
                  <tr key={c.n} onClick={() => toast('ok', c.n, 'NAS detail: shared secret age, policy set, live log (demo).')}>
                    <td className="td-main">{c.n}</td>
                    <td className="td-mono">{c.ip}</td>
                    <td><span className="tag">{c.proto}</span></td>
                    <td className="td-right td-num">{c.reqs}</td>
                    <td className="td-right td-num" style={{ color: parseFloat(c.fail) > 2 ? 'var(--bad)' : 'var(--mut)' }}>{c.fail}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><div className="row-actions"><button className="mini-btn"><Icon name="eye" size={14} /></button><button className="mini-btn"><Icon name="edit" size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <CardHeader title="Server pool" sub="Active-active across regions" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 12 }}>
              {POOL.map((s) => (
                <div className="hrow" key={s[0]} style={{ justifyContent: 'space-between', padding: '8.5px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div className="hrow"><span className="live-dot" /><span className="mono" style={{ fontSize: '11.75px', fontWeight: 600 }}>{s[0]}</span></div>
                  <div className="hrow"><span className="num" style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{s[1]}</span><StatusBadge status={s[2]} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <CardHeader title="Policy highlights" sub="Authorization profiles" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 12 }}>
              {POLICIES.map((p) => (
                <div key={p[0]} style={{ padding: '8px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{p[0]}</div>
                  <div style={{ fontSize: '11.25px', color: 'var(--mut)', marginTop: 1 }}>{p[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
