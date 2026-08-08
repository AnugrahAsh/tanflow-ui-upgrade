import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'

const PROTO_STYLE = {
  SSH: { tint: '#FDF0E1', color: '#B4690E', icon: 'commands' },
  RDP: { tint: '#E8F0FF', color: '#2563EB', icon: 'sessions' },
  Oracle: { tint: '#E6F5EF', color: '#0E9F6E', icon: 'db' },
}
const STATUS = {
  Reporting: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)', label: 'Reporting' },
  Stale: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)', label: 'Stale' },
  Awaiting: { c: 'var(--accent)', bg: 'var(--accent-bg)', b: 'var(--accent-line)', label: 'Awaiting agent' },
  'Not set up': { c: 'var(--mut)', bg: 'var(--surface-3)', b: 'var(--line)', label: 'Not set up' },
}

const AGENTS = [
  { name: 'BTSPAMDEMO01', proto: 'SSH', host: '10.0.0.150', env: 'DEMO', status: 'Reporting', mon: true, checkin: '38 sec ago', events: 12 },
  { name: 'TANFLOWAD01', proto: 'RDP', host: '192.168.1.80', env: 'PROD', status: 'Reporting', mon: true, checkin: '1 min ago', events: 9 },
  { name: 'BTSPLVAPTSRV01', proto: 'SSH', host: '80.225.251.38', env: 'TEST', status: 'Stale', stale: '26h', mon: true, checkin: '26 hrs ago', events: 9 },
  { name: 'BTSIAMRETEST01', proto: 'SSH', host: '10.0.0.107', env: 'TEST', status: 'Awaiting', mon: true, checkin: 'Never', events: 0 },
  { name: 'BTSPAMDEV01', proto: 'SSH', host: '10.0.0.57', env: 'DEV', status: 'Not set up', mon: false, checkin: '—', events: null },
  { name: 'BTSPAMDEMO02', proto: 'SSH', host: '10.0.0.154', env: 'DEMO', status: 'Not set up', mon: false, checkin: '—', events: null },
  { name: 'TANFLOWAPP01', proto: 'SSH', host: '146.56.51.196', env: 'PROD', status: 'Not set up', mon: false, checkin: '—', events: null },
  { name: 'TESTORACLE', proto: 'Oracle', host: 'testoracle:1521', env: 'TEST', status: 'Not set up', mon: false, checkin: '—', events: null },
]
const EVENTS = [
  { ts: 'Today 12:31:04', server: 'TANFLOWAD01', proto: 'RDP', user: 'Administrator', ip: '10.20.4.11', matched: true, result: 'Success' },
  { ts: 'Today 11:58:22', server: 'BTSPAMDEMO01', proto: 'SSH', user: 'root', ip: '10.0.0.9', matched: true, result: 'Success' },
  { ts: 'Today 10:12:03', server: 'BTSPLVAPTSRV01', proto: 'SSH', user: 'ubuntu', ip: '80.225.251.9', matched: true, result: 'Success' },
  { ts: 'Today 09:14:47', server: 'TANFLOWAPP01', proto: 'SSH', user: 'appadmin', ip: '203.0.113.44', matched: false, result: 'Success' },
  { ts: 'Today 08:02:19', server: 'TANFLOWAD01', proto: 'RDP', user: 'svc-join', ip: '198.51.100.7', matched: false, result: 'Success' },
  { ts: 'Yesterday 23:41', server: 'TANFLOWAPP01', proto: 'SSH', user: 'root', ip: '203.0.113.44', matched: false, result: 'Failed' },
  { ts: 'Yesterday 22:05', server: 'BTSPAMDEMO01', proto: 'SSH', user: 'root', ip: '10.0.0.9', matched: true, result: 'Failed' },
  { ts: 'Yesterday 19:30', server: 'TANFLOWAD01', proto: 'RDP', user: 'Administrator', ip: '10.20.4.11', matched: true, result: 'Success' },
]

const ProtoTile = ({ proto, size = 30 }) => {
  const s = PROTO_STYLE[proto] || { tint: 'var(--surface-2)', color: 'var(--mut)', icon: 'commands' }
  return <span style={{ width: size, height: size, borderRadius: 'var(--r-sm)', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={s.icon} size={Math.round(size * 0.52)} style={{ color: s.color }} /></span>
}
const EnvTag = ({ env }) => {
  const prod = env === 'PROD'
  return <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: prod ? 'var(--warn)' : 'var(--ink-2)', background: prod ? 'var(--warn-bg)' : 'var(--surface-3)', border: `1px solid ${prod ? 'var(--warn-line)' : 'var(--line)'}`, borderRadius: 'var(--r-xs)', padding: '2px 7px', whiteSpace: 'nowrap' }}>{env}</span>
}
const AgentStatus = ({ a }) => {
  const s = STATUS[a.status]
  const label = a.status === 'Stale' && a.stale ? `Stale · ${a.stale}` : s.label
  return <span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '12px', fontWeight: 600, color: s.c, background: s.bg, border: `1px solid ${s.b}`, borderRadius: 'var(--r-sm)', padding: '3px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />{label}</span>
}

export default function Monitor() {
  const { toast } = useApp()
  const [agents, setAgents] = useState(AGENTS)
  const [tab, setTab] = useState('agents')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [needSetup, setNeedSetup] = useState(false)
  const [unmatchedOnly, setUnmatchedOnly] = useState(false)

  const toggleMon = (name) => setAgents((prev) => prev.map((x) => {
    if (x.name !== name) return x
    const mon = !x.mon
    const status = mon ? (x.status === 'Not set up' ? 'Awaiting' : x.status) : 'Not set up'
    return { ...x, mon, status, checkin: status === 'Not set up' ? '—' : x.checkin, events: status === 'Not set up' ? null : x.events }
  }))

  const monitored = agents.filter((a) => a.mon).length
  const reporting = agents.filter((a) => a.status === 'Reporting').length
  const stale = agents.filter((a) => a.status === 'Stale').length
  const unmatched = EVENTS.filter((e) => !e.matched).length

  const shownAgents = agents.filter((a) => {
    if (q && !(a.name + a.host + a.proto + a.env).toLowerCase().includes(q.toLowerCase())) return false
    if (needSetup && !(a.status === 'Not set up' || a.status === 'Awaiting')) return false
    if (statusFilter && a.status !== statusFilter) return false
    return true
  })
  const shownEvents = EVENTS.filter((e) => {
    if (q && !(e.server + e.user + e.ip + e.proto).toLowerCase().includes(q.toLowerCase())) return false
    if (unmatchedOnly && e.matched) return false
    return true
  })

  const chip = (on) => on ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined
  const setStatus = (s) => setStatusFilter((cur) => (cur === s ? null : s))
  const countText = tab === 'agents' ? `${shownAgents.length} of ${agents.length} targets` : `${shownEvents.length} of ${EVENTS.length} events`

  return (
    <>
      <PageHead
        title="External Access"
        sub="Lightweight agents on target servers report every login that happens outside the PAM gateway — each event is matched against session records so out-of-band access has nowhere to hide."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Setup guide', 'Opens the agent deployment guide (demo).')}><Icon name="book" />Setup guide</button>
            <button className="btn btn-pri" style={{ background: '#1E9E5A', borderColor: '#1E9E5A' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#178A4C'; e.currentTarget.style.borderColor = '#178A4C' }} onMouseLeave={(e) => { e.currentTarget.style.background = '#1E9E5A'; e.currentTarget.style.borderColor = '#1E9E5A' }} onClick={() => toast('ok', 'Export CSV', `${tab === 'agents' ? shownAgents.length + ' agents' : shownEvents.length + ' events'} exported to CSV (demo).`)}><Icon name="download" />Export CSV</button>
          </>
        }
      />

      <div className="kpi-row cols-5">
        <KpiTile label="Monitored targets" icon="shieldCheck" val={monitored} foot="of 17 in inventory" />
        <KpiTile label="Agents reporting" icon="activity" val={reporting} foot="heartbeat < 2 min" />
        <KpiTile label="Stale agents" icon="warnTri" val={stale} foot="no check-in for 26 hrs" />
        <KpiTile label="Unmatched logins (7d)" icon="ban" val={unmatched} delta={2} foot="gateway bypass suspected" />
        <KpiTile label="Auth failures (7d)" icon="lock" val="8" foot="3 from one source IP" />
      </div>

      <div className="card">
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'inline-flex', gap: 4 }}>
            {[['agents', `Agents (${agents.length})`], ['events', `Access events (${EVENTS.length})`]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: '6px 12px', fontSize: '12.75px', fontWeight: 600, borderRadius: 'var(--r-sm)', color: tab === id ? 'var(--accent)' : 'var(--ink-2)', background: tab === id ? 'var(--accent-bg)' : 'transparent', border: `1px solid ${tab === id ? 'var(--accent-line)' : 'transparent'}` }}>{label}</button>
            ))}
          </div>
          <div className="search-inp" style={{ width: 220 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search server, user, IP…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {tab === 'agents' ? (
            <>
              {['Reporting', 'Stale', 'Not set up'].map((s) => (
                <button key={s} className="btn btn-sec btn-sm" style={chip(statusFilter === s)} onClick={() => setStatus(s)}>{s}</button>
              ))}
            </>
          ) : (
            <button className="btn btn-sec btn-sm" style={chip(unmatchedOnly)} onClick={() => setUnmatchedOnly((v) => !v)}><Icon name="ban" size={13} />Unmatched</button>
          )}
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Advanced filters', 'Filter by environment, protocol, source IP and match state (demo).')}><Icon name="filter" size={13} />Advanced</button>
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{countText}</span>
          <button className="icon-btn" title="Compact view" onClick={() => toast('ok', 'View', 'Toggled compact layout (demo).')}><Icon name="list" size={15} /></button>
          <button className="icon-btn" title="Columns" onClick={() => toast('ok', 'Columns', 'Choose visible columns (demo).')}><Icon name="settings" size={15} /></button>
          <button className="icon-btn" title="Export CSV" onClick={() => toast('ok', 'Export CSV', `${tab === 'agents' ? shownAgents.length + ' agents' : shownEvents.length + ' events'} exported to CSV (demo).`)}><Icon name="download" size={15} /></button>
        </div>

        {tab === 'agents' && (
          <div className="hrow" style={{ gap: 10, padding: '8px 16px', borderTop: '1px solid var(--hair)', borderBottom: '1px solid var(--hair)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--faint)' }}>VIEWS</span>
            <button className="btn btn-sec btn-sm" style={chip(needSetup)} onClick={() => setNeedSetup((v) => !v)}><Icon name="star" size={13} />Agents needing setup</button>
            <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'View saved', 'Current filters saved as a view (demo).')}><Icon name="plus" size={13} />Save view</button>
          </div>
        )}

        {tab === 'agents' ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Connection</th><th>Protocol</th><th>Environment</th><th>Agent status</th><th>Monitoring</th><th>Last check-in</th><th>Events</th><th style={{ width: 140 }}>Actions</th></tr></thead>
              <tbody>
                {shownAgents.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No agents match</div><div className="e-s">Adjust the search or filters.</div></div></td></tr>
                ) : shownAgents.map((a) => (
                  <tr key={a.name}>
                    <td>
                      <div className="hrow" style={{ gap: 11 }}>
                        <ProtoTile proto={a.proto} size={30} />
                        <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{a.name}</div><div className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 1 }}>{a.host}</div></div>
                      </div>
                    </td>
                    <td><span className="tag">{a.proto}</span></td>
                    <td><EnvTag env={a.env} /></td>
                    <td><AgentStatus a={a} /></td>
                    <td><span className={`toggle ${a.mon ? 'on' : ''}`} onClick={() => toggleMon(a.name)} role="switch" aria-checked={a.mon} /></td>
                    <td style={{ fontSize: '12.5px', color: a.status === 'Stale' ? 'var(--warn)' : 'var(--mut)' }}>{a.checkin}</td>
                    <td style={{ fontSize: '12.5px', fontWeight: 600, color: a.events == null ? 'var(--faint)' : 'var(--ink-2)' }}>{a.events == null ? '—' : a.events}</td>
                    <td>
                      {a.status === 'Not set up' || a.status === 'Awaiting' ? (
                        <div className="hrow" style={{ gap: 6 }}>
                          <button className="btn btn-sec btn-sm" style={{ padding: '4px 8px' }} onClick={() => toast('ok', 'Copied', 'Linux install script copied to clipboard.')} title="Copy Linux Bash script"><Icon name="commands" size={13} />Bash</button>
                          <button className="btn btn-sec btn-sm" style={{ padding: '4px 8px' }} onClick={() => toast('ok', 'Copied', 'Windows install script copied to clipboard.')} title="Copy Windows PowerShell script"><Icon name="windows" size={13} />PS</button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button className="mini-btn" title="Agent actions" onClick={() => toast('ok', a.name, 'View events · redeploy · disable monitoring (demo).')}><Icon name="more" size={15} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Timestamp</th><th>Server</th><th>User</th><th>Source IP</th><th>Protocol</th><th>PAM match</th><th>Result</th></tr></thead>
              <tbody>
                {shownEvents.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No events match</div><div className="e-s">Adjust the search or filters.</div></div></td></tr>
                ) : shownEvents.map((e, i) => (
                  <tr key={i}>
                    <td className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{e.ts}</td>
                    <td><div className="hrow" style={{ gap: 10 }}><ProtoTile proto={e.proto} size={26} /><span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{e.server}</span></div></td>
                    <td className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{e.user}</td>
                    <td className="mono" style={{ fontSize: '12px', color: 'var(--mut)' }}>{e.ip}</td>
                    <td><span className="tag">{e.proto}</span></td>
                    <td>
                      {e.matched
                        ? <span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '12px', fontWeight: 600, color: 'var(--ok)', background: 'var(--ok-bg)', border: '1px solid var(--ok-line)', borderRadius: 'var(--r-sm)', padding: '3px 9px' }}><Icon name="check" size={12} />Matched</span>
                        : <span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '12px', fontWeight: 600, color: 'var(--bad)', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)', padding: '3px 9px' }}><Icon name="ban" size={12} />Unmatched</span>}
                    </td>
                    <td><span className="hrow" style={{ gap: 6, fontSize: '12.5px', fontWeight: 600, color: e.result === 'Success' ? 'var(--ok)' : 'var(--bad)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: e.result === 'Success' ? 'var(--ok)' : 'var(--bad)' }} />{e.result}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 8, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: {unmatched} logins on 2 production targets have no PAM record — direct SSH/RDP is still reachable. Queue a firewall lockdown so the gateway is the only way in.</span>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Firewall lockdown queued', 'Direct SSH/RDP will be blocked; the PAM gateway becomes the only path (demo).')}><Icon name="lock" size={13} />Queue lockdown</button>
        </div>
      </div>
    </>
  )
}
