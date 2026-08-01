import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar, RiskPill, SevTag } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'
import { SESSIONS } from '../data/mockData.js'

const WAITING = [
  ['Freya Berg → SWIFT gateway', 'Payment release console · requires CISO delegate', '2 min'],
  ['Contractor 8841 → sql-dev-04', 'Vendor patch window · sponsor L. Dahl', '11 min'],
]
const RISK_EVENTS = [
  ['PS-88409', 'SELECT * FROM SYS.USER$ — sensitive table read', 'Critical', '2 min ago'],
  ['PS-88412', 'sudo su - attempted (allowed by policy, logged)', 'Medium', '9 min ago'],
  ['PS-88401', 'xp_cmdshell enable attempt — blocked', 'Critical', '14 min ago'],
  ['PS-88398', 'Config download 4.2 MB — within baseline', 'Low', '22 min ago'],
]

export default function Sessions() {
  const { go, toast } = useApp()
  const stop = (e, fn) => { e.stopPropagation(); fn() }
  return (
    <>
      <PageHead
        title="Live Privileged Sessions"
        sub="Real-time monitoring of every proxied privileged connection — watch, shadow, lock or terminate with one action."
        actions={
          <>
            <span className="hrow" style={{ gap: 7, fontSize: '12.25px', color: 'var(--mut)', marginRight: 6 }}><span className="live-dot" />6 live · 2 being shadowed</span>
            <button className="btn btn-sec"><Icon name="settings" />Session policies</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Sessions today" icon="sessions" val="148" delta={6} foot="100% recorded" spark={wave(12, 30, 16, 23)} />
        <KpiTile label="Live now" icon="activity" val="6" foot="2 high · 1 critical risk" />
        <KpiTile label="Commands blocked today" icon="ban" val="12" foot="by command policy" />
        <KpiTile label="Median session length" icon="clock" val="23" unit="min" foot="p95: 2.1 hrs" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="search-inp" style={{ width: 280 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search user, account, target…" /></div>
          <button className="fchip on"><Icon name="filter" size={12} />Risk ≥ Medium</button>
          <button className="fchip"><Icon name="filter" size={12} />Protocol: All</button>
          <div className="tb-spacer" />
          <button className="btn btn-danger btn-sm" onClick={() => toast('warn', 'Emergency freeze', 'Would terminate all privileged sessions — requires dual confirmation.')}><Icon name="ban" />Freeze all</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Session</th><th>User</th><th>Target</th><th>Protocol</th><th className="td-right">Duration</th><th className="td-right">Commands</th><th>Risk</th><th>Watchers</th><th style={{ width: 120 }} /></tr></thead>
            <tbody>
              {SESSIONS.map((s) => (
                <tr key={s.id} onClick={() => go('recordings')}>
                  <td className="td-mono">{s.id}</td>
                  <td><div className="cell-user"><Avatar name={s.user} cls="av-sm" /><span className="td-main">{s.user}</span></div></td>
                  <td><span className="td-mono"><span style={{ color: 'var(--mut)' }}>{s.acct}@</span>{s.target}</span></td>
                  <td><span className="tag">{s.proto}</span></td>
                  <td className="td-right td-num">{s.t}</td>
                  <td className="td-right td-num">{s.cmds || '—'}</td>
                  <td><RiskPill risk={s.risk} /></td>
                  <td>{s.watch ? <span className="hrow" style={{ gap: 5 }}><Icon name="eye" size={13} /><span className="num">{s.watch}</span></span> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" title="Shadow session" onClick={(e) => stop(e, () => toast('ok', `Shadowing ${s.id}`, 'Read-only live view opened (demo).'))}><Icon name="eye" size={14} /></button>
                      <button className="mini-btn" title="Lock input" onClick={(e) => stop(e, () => toast('warn', 'Input locked', 'User keyboard frozen — session preserved for review (demo).'))}><Icon name="lock" size={14} /></button>
                      <button className="mini-btn danger" title="Terminate" onClick={(e) => stop(e, () => toast('err', 'Session terminated', `${s.id} killed · credential rotated · incident opened (demo).`))}><Icon name="ban" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <CardHeader title="Waiting for approval" sub="Dual-control (4-eyes) session starts" />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {WAITING.map((w) => (
              <div className="hrow" key={w[0]} style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                <div style={{ minWidth: 0 }}><div style={{ fontSize: '12.5px', fontWeight: 600 }}>{w[0]}</div>
                  <div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{w[1]} · waiting {w[2]}</div></div>
                <div className="hrow" style={{ flex: 'none' }}>
                  <button className="btn btn-sec btn-sm" onClick={() => toast('warn', 'Denied', 'Session start denied with comment (demo).')}>Deny</button>
                  <button className="btn btn-pri btn-sm" onClick={() => toast('ok', 'Approved', 'Session authorized — you are auto-joined as watcher (demo).')}>Approve & watch</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <CardHeader title="Session risk events" sub="Live triggers from active sessions" />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {RISK_EVENTS.map((e) => (
              <div className="hrow" key={e[0] + e[1]} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--hair)' }}>
                <div style={{ minWidth: 0 }} className="hrow">
                  <span className="code-chip" style={{ flex: 'none' }}>{e[0]}</span>
                  <span className="mono" style={{ fontSize: '11.25px', color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e[1]}</span>
                </div>
                <div className="hrow" style={{ flex: 'none' }}><SevTag sev={e[2]} /><span style={{ fontSize: '10.75px', color: 'var(--faint)' }}>{e[3]}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
