import { useState, useMemo } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'
import RecordingPlayer from '../components/RecordingPlayer.jsx'
import HistoryFilters from '../components/HistoryFilters.jsx'
import SessionTranscript from '../components/SessionTranscript.jsx'

const PURPOSE_TONE = {
  'TROUBLESHOOTING ISSUES': { c: '#9A6700', bg: '#FBF0D3' }, 'TESTING AND ACCESSIBILITY': { c: '#0E7C6B', bg: '#D6F0EB' },
  'SYSTEM MONITORING': { c: '#6D4AE0', bg: '#EAE5FC' }, 'BACKUP & RECOVERY': { c: '#1E8E4E', bg: '#DAF2E2' },
  'SOFTWARE DEPLOYMENT': { c: '#2563EB', bg: '#E2ECFF' }, 'SYSTEM MAINTENANCE': { c: '#2563EB', bg: '#E2ECFF' },
}
const PURPOSES = Object.keys(PURPOSE_TONE)
const CONNS = [['sql-hr-prd-02', '10.16.2.9'], ['fw-core-01', '10.0.0.1'], ['ora-fin-prd-03', '10.12.4.31'], ['core-sw-04', '10.0.0.4'], ['BTSPAMDEV01', '10.0.0.57'], ['aws-prod-bastion', '10.8.0.12'], ['WSLSERVER01', '172.23.96.246'], ['dc02.corp.meridian', '10.20.6.30'], ['k8s-prod-cluster', '10.20.5.19'], ['sap-prd-app01', '10.20.4.11']]
const USERS = ['p.sharma', 'v.sokolov', 'm.bennett', 'admin', 'h.kobayashi', 'n.rahman', 'o.aziz', 'j.novak']

const pad = (n) => String(n).padStart(2, '0')
const fmtDate = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`
const fmtTime = (d) => { let h = d.getHours(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ap}` }
const fmtDur = (s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}min ${s % 60}s`
let _uid = 0
const R = (conn, user, host, purpose, ts, dur, rec) => { const end = new Date(ts.getTime() + dur * 1000); _uid++; return { id: 'r' + _uid, conn, user, host, purpose, ts, date: fmtDate(ts), start: fmtTime(ts), end: fmtTime(end), dur: fmtDur(dur), rec, recId: '7198cf9a-48d6-4108-25ed-a681308458a6' } }

const FIRST = [
  R('sql-hr-prd-02', 'p.sharma', '10.16.2.9', 'TROUBLESHOOTING ISSUES', new Date(2026, 5, 7, 14, 35, 51), 662, true),
  R('fw-core-01', 'v.sokolov', '10.0.0.1', 'TESTING AND ACCESSIBILITY', new Date(2026, 5, 7, 14, 25, 11), 6, true),
  R('fw-core-01', 'm.bennett', '10.0.0.1', 'SYSTEM MONITORING', new Date(2026, 5, 7, 14, 13, 0), 340, true),
  R('ora-fin-prd-03', 'admin', '10.12.4.31', 'BACKUP & RECOVERY', new Date(2026, 5, 7, 14, 0, 26), 48, false),
  R('core-sw-04', 'h.kobayashi', '10.0.0.4', 'BACKUP & RECOVERY', new Date(2026, 5, 7, 13, 37, 15), 6, true),
  R('BTSPAMDEV01', 'm.bennett', '10.0.0.57', 'SOFTWARE DEPLOYMENT', new Date(2026, 5, 7, 12, 59, 15), 94, true),
  R('aws-prod-bastion', 'p.sharma', '10.8.0.12', 'SYSTEM MONITORING', new Date(2026, 5, 7, 12, 13, 40), 261, true),
  R('sql-hr-prd-02', 'admin', '10.16.2.9', 'SYSTEM MAINTENANCE', new Date(2026, 5, 7, 12, 12, 24), 624, true),
  R('WSLSERVER01', 'v.sokolov', '172.23.96.246', 'TESTING AND ACCESSIBILITY', new Date(2026, 5, 7, 12, 4, 31), 180, false),
  R('Test Windows – Admin (prefilled)', 'admin', 'host.docker.internal', 'TESTING AND ACCESSIBILITY', new Date(2026, 5, 7, 11, 43, 31), 342, false),
]
const REST = Array.from({ length: 34 }, (_, i) => {
  const [conn, host] = CONNS[i % CONNS.length]
  const day = 7 - (1 + (i % 3))
  const ts = new Date(2026, 5, day, 9 + (i % 8), (i * 7) % 60, (i * 13) % 60)
  const dur = [6, 48, 94, 180, 261, 340, 624, 42, 512, 77][i % 10]
  return R(conn, USERS[i % USERS.length], host, PURPOSES[i % PURPOSES.length], ts, dur, i % 4 !== 0)
})
const RECORDS = [...FIRST, ...REST]

const PurposePill = ({ purpose }) => { const t = PURPOSE_TONE[purpose] || { c: 'var(--mut)', bg: 'var(--surface-2)' }; return <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.03em', color: t.c, background: t.bg, borderRadius: 4, padding: '3px 8px', whiteSpace: 'nowrap' }}>{purpose}</span> }

export default function Recordings() {
  const { toast } = useApp()
  const [q, setQ] = useState('')
  const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [fromT, setFromT] = useState('00:00'); const [toT, setToT] = useState('23:59')
  const [purpose, setPurpose] = useState('All Purposes')
  const [adv, setAdv] = useState({ user: [], conn: [], rec: [] })
  const [advOpen, setAdvOpen] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [playing, setPlaying] = useState(null)
  const [transcript, setTranscript] = useState(null)

  const reset = () => { setQ(''); setFrom(''); setTo(''); setFromT('00:00'); setToT('23:59'); setPurpose('All Purposes'); setAdv({ user: [], conn: [], rec: [] }); setPage(1) }

  const filtered = useMemo(() => {
    const fromB = from ? new Date(`${from}T${fromT || '00:00'}`) : null
    const toB = to ? new Date(`${to}T${toT || '23:59'}`) : null
    return RECORDS.filter((r) => {
      if (q && !(r.conn + r.user + r.host + r.purpose).toLowerCase().includes(q.toLowerCase())) return false
      if (fromB && r.ts < fromB) return false
      if (toB && r.ts > toB) return false
      if (purpose !== 'All Purposes' && r.purpose !== purpose) return false
      if (adv.user.length && !adv.user.includes(r.user)) return false
      if (adv.conn.length && !adv.conn.includes(r.conn)) return false
      if (adv.rec.length && !adv.rec.includes(r.rec ? 'Recorded' : 'Not recorded')) return false
      return true
    })
  }, [q, from, to, fromT, toT, purpose, adv])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const cur = Math.min(page, pages)
  const rows = filtered.slice((cur - 1) * pageSize, cur * pageSize)
  const advCount = adv.user.length + adv.conn.length + adv.rec.length
  const inputStyle = { height: 30, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', fontSize: '12.75px', color: 'var(--ink)' }
  const pageBtns = () => { const out = []; for (let i = 1; i <= pages; i++) { if (i === 1 || i === pages || Math.abs(i - cur) <= 1) out.push(i); else if (out[out.length - 1] !== '…') out.push('…') } return out }

  return (
    <>
      <PageHead title="Connection History" sub="View and manage connection records."
        actions={<button className="btn" style={{ background: '#1E9E5A', color: '#fff' }} onClick={() => toast('ok', 'Export CSV', `${filtered.length} connection records exported as CSV (demo).`)}><Icon name="download" />Export CSV</button>} />

      {playing && <RecordingPlayer rec={playing} onClose={() => setPlaying(null)} />}
      {transcript && <SessionTranscript rec={transcript} onClose={() => setTranscript(null)} />}

      <div className="kpi-row cols-4">
        <KpiTile label="Connections (7d)" icon="recordings" val="312" foot={`${filtered.length} in current range`} />
        <KpiTile label="Recorded" icon="shieldCheck" val="32" foot="73% capture coverage" />
        <KpiTile label="Avg session" icon="clock" val="11" unit="m" foot="per privileged connection" spark={wave(12, 30, 16, 23)} />
        <KpiTile label="Policy events" icon="warnTri" val="3" foot="flagged & reviewer-notified" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-pad">
          <div className="hrow" style={{ gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 8 }}><Icon name="calendar" size={12} /> Date Range</div>
              <div className="hrow" style={{ gap: 8 }}>
                <input type="date" style={inputStyle} value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} /><span style={{ color: 'var(--faint)' }}>›</span><input type="date" style={inputStyle} value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} />
              </div>
              <div className="hrow" style={{ gap: 8, marginTop: 8 }}>
                <input type="time" style={inputStyle} value={fromT} onChange={(e) => setFromT(e.target.value)} /><input type="time" style={inputStyle} value={toT} onChange={(e) => setToT(e.target.value)} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 8 }}><Icon name="adaptive" size={12} /> Purpose</div>
              <select className="sel" style={{ width: 220 }} value={purpose} onChange={(e) => { setPurpose(e.target.value); setPage(1) }}><option>All Purposes</option>{PURPOSES.map((p) => <option key={p}>{p}</option>)}</select>
            </div>
            <div className="hrow" style={{ gap: 8 }}>
              <button className="btn btn-sec" style={advCount ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setAdvOpen(true)}><Icon name="filter" />Advanced Filters{advCount > 0 && <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '0 6px', marginLeft: 2 }}>{advCount}</span>}</button>
              <button className="btn btn-sec" onClick={reset}><Icon name="refresh" />Reset</button>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>Show <select className="sel" style={{ width: 64, height: 28, display: 'inline-block', margin: '0 4px' }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}>{[10, 25, 50].map((n) => <option key={n}>{n}</option>)}</select> entries</span>
          <div className="tb-spacer" />
          <div className="search-inp" style={{ width: 300 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} /></div>
          <button className="icon-btn" title="Recordings only"><Icon name="recordings" size={15} /></button>
          <button className="icon-btn" title="Columns"><Icon name="list" size={15} /></button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Connection</th><th>User</th><th>Remote Host</th><th>Purpose</th><th>Date</th><th>Start Time</th><th>End Time</th><th>Duration</th><th style={{ textAlign: 'right' }}>Recording & transcript</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9}><div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No records match</div><div className="e-s">Adjust the date range, purpose or filters.</div></div></td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td><span className="link" onClick={() => r.rec ? setPlaying(r) : toast('warn', r.conn, 'No recording captured for this connection.')}>{r.conn}</span></td>
                  <td style={{ color: 'var(--ink-2)' }}>{r.user}</td>
                  <td className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{r.host}</td>
                  <td><PurposePill purpose={r.purpose} /></td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{r.date}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{r.start}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{r.end}</td>
                  <td className="td-num" style={{ color: 'var(--ink-2)' }}>{r.dur}</td>
                  <td style={{ textAlign: 'right' }}>{r.rec
                    ? <span className="hrow" style={{ justifyContent: 'flex-end', gap: 6 }}><button onClick={() => setPlaying(r)} style={{ background: '#7C3AED', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '.03em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>PLAY <Icon name="play" size={11} /></button><button className="mini-btn" title="View transcript" aria-label={`View transcript for ${r.conn}`} onClick={() => setTranscript(r)}><Icon name="reports" size={13} /></button></span>
                    : <span style={{ color: 'var(--faint)', fontSize: '12px' }}>None</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="hrow" style={{ justifyContent: 'space-between', padding: '12px 16px', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>Showing <b style={{ color: 'var(--ink-2)' }}>{filtered.length === 0 ? 0 : (cur - 1) * pageSize + 1}–{Math.min(cur * pageSize, filtered.length)}</b> of {filtered.length}</span>
          <div className="hrow" style={{ gap: 4 }}>
            <button className="pg-btn" disabled={cur === 1} onClick={() => setPage(cur - 1)}><Icon name="chevL" size={13} /></button>
            {pageBtns().map((p, i) => p === '…' ? <span key={i} style={{ color: 'var(--faint)', padding: '0 4px' }}>…</span> : <button key={i} className={`pg-btn ${p === cur ? 'on' : ''}`} onClick={() => setPage(p)}>{p}</button>)}
            <button className="pg-btn" disabled={cur === pages} onClick={() => setPage(cur + 1)}><Icon name="chevR" size={13} /></button>
          </div>
        </div>
      </div>

      {advOpen && <HistoryFilters value={adv} groups={[['user', 'User', USERS], ['conn', 'Connection', CONNS.map((c) => c[0])], ['rec', 'Recording', ['Recorded', 'Not recorded']]]} onApply={(v) => { setAdv(v); setPage(1) }} onClose={() => setAdvOpen(false)} />}
    </>
  )
}
