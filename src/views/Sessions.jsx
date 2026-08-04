import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'
import SessionDrawer from './SessionDrawer.jsx'
import ShadowModal from '../components/ShadowModal.jsx'
import SessionFilters from '../components/SessionFilters.jsx'

const SESSIONS = [
  { id: 'PS-88409', name: 'Priya Sharma', role: 'Database Eng', acct: 'SYS', target: 'ora-fin-prd-03', proto: 'SQL*Net', duration: '01:12:55', mfa: 'FIDO2', risk: 'Critical', score: 91, commands: 892, blocked: 3, approval: 'JIT', watchers: 1, env: 'PROD', source: '10.20.9.42', started: 'Today 13:31', purpose: 'Troubleshooting', policy: 'Prod-DB-Read' },
  { id: 'PS-88401', name: 'Nadia Rahman', role: 'Risk & Audit', acct: 'sa', target: 'sql-risk-prd-07', proto: 'TDS', duration: '02:03:12', mfa: 'TOTP', risk: 'High', score: 78, commands: 341, blocked: 1, approval: 'Dual-control', watchers: 1, env: 'PROD', source: '10.20.7.15', started: 'Today 12:40', purpose: 'Compliance query', policy: 'Prod-DB-Read' },
  { id: 'PS-88412', name: 'Marcus Bennett', role: 'SAP Basis', acct: 'root', target: 'sap-prd-app01.corp', proto: 'SSH', duration: '00:42:18', mfa: 'FIDO2', risk: 'High', score: 74, commands: 214, blocked: 1, approval: 'Dual-control', watchers: 2, env: 'PROD', source: '10.20.4.11', started: 'Today 14:01', purpose: 'Kernel patch', policy: 'Prod-Admin' },
  { id: 'PS-88406', name: 'Erik Lindqvist', role: 'Directory Svc', acct: 'Administrator', target: 'dc02.corp.meridian', proto: 'RDP', duration: '00:08:41', mfa: 'TOTP', risk: 'Medium', score: 52, commands: null, blocked: 0, approval: 'Auto', watchers: 0, env: 'PROD', source: '10.20.6.30', started: 'Today 14:35', purpose: 'GPO update', policy: 'Prod-Admin' },
  { id: 'PS-88398', name: 'Omar Aziz', role: 'Network Eng', acct: 'netadmin', target: 'fw-core-01.dmz', proto: 'SSH', duration: '00:19:04', mfa: 'FIDO2', risk: 'Medium', score: 48, commands: 57, blocked: 0, approval: 'JIT', watchers: 0, env: 'PROD', source: '10.20.9.8', started: 'Today 14:24', purpose: 'Firewall rule', policy: 'Network' },
  { id: 'PS-88395', name: 'Julia Novak', role: 'Platform Eng', acct: 'svc-deploy', target: 'k8s-prod-cluster', proto: 'kubectl', duration: '00:03:26', mfa: 'FIDO2', risk: 'Low', score: 21, commands: 12, blocked: 0, approval: 'Auto', watchers: 0, env: 'PROD', source: '10.20.5.19', started: 'Today 14:40', purpose: 'Release deploy', policy: 'K8s-Deploy' },
]
const PENDING = [
  { user: 'Freya Berg', target: 'SWIFT payment-release console', risk: 'Critical', note: 'requires CISO delegate · waiting 2 min' },
  { user: 'Contractor 8841', target: 'sql-dev-04 · vendor patch window', risk: 'Medium', note: 'sponsor L. Dahl · waiting 11 min' },
]
const EVENTS = [
  ['PS-88409', 'SELECT * FROM SYS.USER$ — sensitive read', 'Critical', '2 min ago'],
  ['PS-88412', 'sudo su - (allowed by policy, logged)', 'Medium', '9 min ago'],
  ['PS-88401', 'xp_cmdshell enable — blocked', 'Critical', '14 min ago'],
  ['PS-88398', 'Config download 4.2 MB — within baseline', 'Low', '22 min ago'],
]
const RISK = {
  Critical: { c: 'var(--bad)', bg: 'var(--bad-bg)', arrow: 'aUp' }, High: { c: '#C2740B', bg: 'var(--warn-bg)', arrow: 'aUp' },
  Medium: { c: '#9A7B1A', bg: '#FBF3E0', arrow: null }, Low: { c: 'var(--mut)', bg: 'var(--surface-2)', arrow: 'aDown' },
}
const MfaTone = { FIDO2: { c: 'var(--ok)', bg: 'var(--ok-bg)' }, TOTP: { c: 'var(--accent)', bg: 'var(--accent-bg)' } }
const ApprTone = { JIT: { c: 'var(--accent)', bg: 'var(--accent-bg)' }, 'Dual-control': { c: '#7C3AED', bg: '#EDE9FE' }, Auto: { c: 'var(--mut)', bg: 'var(--surface-2)' } }
const Tag = ({ label, tone }) => <span style={{ fontSize: '11px', fontWeight: 600, color: tone.c, background: tone.bg, borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>{label}</span>
const RiskCell = ({ risk, score }) => {
  const r = RISK[risk]
  return <span className="hrow" style={{ gap: 8 }}><span className="hrow" style={{ gap: 4, fontSize: '11.5px', fontWeight: 600, color: r.c, background: r.bg, borderRadius: 6, padding: '2px 8px' }}>{r.arrow ? <Icon name={r.arrow} size={10} /> : <span style={{ fontWeight: 700 }}>—</span>}{risk}</span><span className="num" style={{ color: 'var(--mut)' }}>{score}</span></span>
}
const SevTag = ({ sev }) => <Tag label={sev} tone={{ Critical: RISK.Critical, High: RISK.High, Medium: RISK.Medium, Low: { c: 'var(--mut)', bg: 'var(--surface-2)' } }[sev]} />
const EMPTY = { risk: new Set(), proto: new Set(), mfa: new Set(), approval: new Set() }

export default function Sessions() {
  const { go, toast, openDrawer, closeDrawer } = useApp()
  const [q, setQ] = useState('')
  const [riskHigh, setRiskHigh] = useState(false)
  const [protos, setProtos] = useState(new Set())
  const [adv, setAdv] = useState(EMPTY)
  const [advOpen, setAdvOpen] = useState(false)
  const [view, setView] = useState(null)
  const [shadow, setShadow] = useState(null)

  const advCount = adv.risk.size + adv.proto.size + adv.mfa.size + adv.approval.size
  const toggleProto = (p) => setProtos((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n })

  const match = (s) => {
    if (q && !(s.id + s.name + s.acct + s.target + s.source).toLowerCase().includes(q.toLowerCase())) return false
    if (riskHigh && !['Critical', 'High'].includes(s.risk)) return false
    if (protos.size && !protos.has(s.proto)) return false
    if (adv.risk.size && !adv.risk.has(s.risk)) return false
    if (adv.proto.size && !adv.proto.has(s.proto)) return false
    if (adv.mfa.size && !adv.mfa.has(s.mfa)) return false
    if (adv.approval.size && !adv.approval.has(s.approval)) return false
    if (view === 'critHigh' && !['Critical', 'High'].includes(s.risk)) return false
    if (view === 'dual' && s.approval !== 'Dual-control') return false
    return true
  }
  const rows = SESSIONS.filter(match)
  const live = SESSIONS.length
  const watched = SESSIONS.filter((s) => s.watchers > 0).length

  const open = (s) => openDrawer(<SessionDrawer session={s} onShadow={() => { closeDrawer(); setShadow(s) }} onTerminate={() => { closeDrawer(); toast('err', 'Session terminated', `${s.id} killed · credential rotated · incident opened (demo).`) }} />)
  const chipStyle = (on) => on ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined
  const viewStyle = (v) => view === v ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined

  return (
    <>
      <PageHead
        title="Live Privileged Sessions"
        sub="Real-time oversight of every proxied privileged connection — shadow, lock, or terminate, and clear dual-control starts."
        actions={
          <>
            <span className="hrow" style={{ gap: 7, fontSize: '12.25px', color: 'var(--mut)', marginRight: 6 }}><span className="live-dot" />{live} live · {watched} being watched</span>
            <button className="btn btn-sec" onClick={() => go('recordings')}><Icon name="recordings" />History</button>
            <button className="btn btn-danger" onClick={() => toast('warn', 'Freeze all', 'Would terminate all privileged sessions — requires dual confirmation (demo).')}><Icon name="ban" />Freeze all</button>
          </>
        }
      />

      <div className="kpi-row cols-5">
        <KpiTile label="Live now" icon="activity" val={live} foot="1 critical · 2 high risk" />
        <KpiTile label="Being watched" icon="eye" val={watched} foot="shadow / 4-eyes oversight" />
        <KpiTile label="Commands blocked (24h)" icon="ban" val="12" delta={-9} goodUp={false} foot="by command policy" />
        <KpiTile label="Awaiting dual-control" icon="clock" val={PENDING.length} foot="4-eyes session starts" />
        <KpiTile label="Median length" icon="clock" val="23" unit="min" foot="p95 2.1 hrs" spark={wave(12, 30, 16, 23)} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div className="search-inp" style={{ width: 240 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search user, account, target, IP…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-sec btn-sm" style={chipStyle(riskHigh)} onClick={() => setRiskHigh((v) => !v)}><Icon name="filter" size={13} />Risk ≥ High</button>
          <button className="btn btn-sec btn-sm" style={chipStyle(protos.has('SSH'))} onClick={() => toggleProto('SSH')}>SSH</button>
          <button className="btn btn-sec btn-sm" style={chipStyle(protos.has('RDP'))} onClick={() => toggleProto('RDP')}>RDP</button>
          <button className="btn btn-sec btn-sm" style={advCount ? chipStyle(true) : undefined} onClick={() => setAdvOpen(true)}><Icon name="filter" size={13} />Advanced{advCount > 0 && <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '0 6px', marginLeft: 2 }}>{advCount}</span>}</button>
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{rows.length} of {live} live</span>
          <button className="icon-btn" title="Columns"><Icon name="list" size={15} /></button>
          <button className="icon-btn" title="Settings"><Icon name="settings" size={15} /></button>
          <button className="icon-btn" title="Export"><Icon name="download" size={15} /></button>
          <button className="icon-btn" title="Refresh" onClick={() => toast('ok', 'Refreshed', 'Live session table re-synced (demo).')}><Icon name="refresh" size={15} /></button>
        </div>
        <div className="hrow" style={{ gap: 10, padding: '9px 16px', borderTop: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--faint)' }}>VIEWS</span>
          <button className="btn btn-sec btn-sm" style={viewStyle('critHigh')} onClick={() => setView((v) => v === 'critHigh' ? null : 'critHigh')}><Icon name="star" size={12} />Critical &amp; High</button>
          <button className="btn btn-sec btn-sm" style={viewStyle('dual')} onClick={() => setView((v) => v === 'dual' ? null : 'dual')}><Icon name="star" size={12} />Dual-control starts</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'View saved', 'Current filter set saved as a view (demo).')}><Icon name="plus" size={12} />Save view</button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th style={{ width: 30 }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></th>
              <th>Session</th><th>Identity</th><th>Account · Target</th><th>Protocol</th><th>Duration</th><th>MFA</th><th>Risk</th><th>Commands</th><th>Approval</th><th>Watchers</th>
            </tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => open(s)} style={s.risk === 'Critical' ? { boxShadow: 'inset 3px 0 0 var(--bad)' } : undefined}>
                  <td><input type="checkbox" style={{ accentColor: 'var(--accent)' }} onClick={(e) => e.stopPropagation()} /></td>
                  <td className="td-mono" style={{ fontSize: '11.75px' }}>{s.id}</td>
                  <td><div className="hrow" style={{ gap: 10 }}><Avatar name={s.name} cls="av-sm" /><div><div className="td-main">{s.name}</div><div className="td-sub">{s.role}</div></div></div></td>
                  <td><span className="mono" style={{ fontSize: '11.5px' }}><span style={{ color: 'var(--mut)' }}>{s.acct}@</span>{s.target}</span> <Tag label={s.env} tone={{ c: '#9A7B1A', bg: 'var(--warn-bg)' }} /></td>
                  <td><span className="tag">{s.proto}</span></td>
                  <td className="td-num" style={{ color: 'var(--ink-2)' }}>{s.duration}</td>
                  <td><Tag label={s.mfa} tone={MfaTone[s.mfa]} /></td>
                  <td><RiskCell risk={s.risk} score={s.score} /></td>
                  <td><span className="hrow" style={{ gap: 7 }}><span className="num" style={{ fontWeight: 600 }}>{s.commands ?? '—'}</span>{s.blocked > 0 && <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--bad)', background: 'var(--bad-bg)', borderRadius: 4, padding: '1px 6px' }}>{s.blocked}</span>}</span></td>
                  <td><Tag label={s.approval} tone={ApprTone[s.approval]} /></td>
                  <td>{s.watchers > 0 ? <span className="hrow" style={{ gap: 5 }}><Icon name="eye" size={13} style={{ color: 'var(--mut)' }} /><span className="num">{s.watchers}</span></span> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={11}><div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No sessions match</div><div className="e-s">Adjust filters or clear the active view.</div></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <CardHeader title="Awaiting dual-control approval" sub="4-eyes session starts — approve to co-watch" right={<span className="tag" style={{ color: 'var(--warn-core)', background: 'var(--warn-bg)', borderColor: 'transparent' }}>● {PENDING.length} pending</span>} />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {PENDING.map((w) => (
              <div key={w.user} style={{ padding: '11px 0', borderBottom: '1px solid var(--hair)' }}>
                <div className="hrow" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div className="hrow" style={{ gap: 8, minWidth: 0 }}><span style={{ fontSize: '13px', fontWeight: 600 }}>{w.user} → {w.target}</span><SevTag sev={w.risk} /></div>
                  <div className="hrow" style={{ gap: 8, flex: 'none' }}>
                    <button className="btn btn-sec btn-sm" onClick={() => toast('warn', 'Denied', 'Session start denied with comment (demo).')}>Deny</button>
                    <button className="btn btn-pri btn-sm" onClick={() => toast('ok', 'Approved', 'Session authorized — you are auto-joined as watcher (demo).')}>Approve &amp; watch</button>
                  </div>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 3 }}>{w.note}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <CardHeader title="Live risk events" sub="Policy triggers from active sessions" right={<button className="btn btn-sec btn-sm" onClick={() => go('audit')}><Icon name="audit" size={13} />Audit log</button>} />
          <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
            {EVENTS.map(([id, cmd, sev, time]) => (
              <div key={id + cmd} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                <div className="hrow" style={{ gap: 10, minWidth: 0 }}>
                  <span className="mono" style={{ fontSize: '10.75px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 6px', color: 'var(--ink-2)', flex: 'none' }}>{id}</span>
                  <span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cmd}</span>
                </div>
                <div className="hrow" style={{ gap: 8, flex: 'none' }}><SevTag sev={sev} /><span style={{ fontSize: '10.75px', color: 'var(--faint)', whiteSpace: 'nowrap' }}>{time}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {advOpen && <SessionFilters value={adv} onApply={setAdv} onClose={() => setAdvOpen(false)} />}
      {shadow && <ShadowModal session={shadow} onClose={() => setShadow(null)} />}
    </>
  )
}
