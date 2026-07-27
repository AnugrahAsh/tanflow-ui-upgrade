import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { Avatar, Badge, RiskPill } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { RECORDINGS } from '../data/mockData.js'

const BOOKMARKS = ['00:12:04 login', '00:31:55 sensitive read', '01:07:12 blocked DROP', '01:40:18 config change', '01:52:30 logout']

export default function Recordings() {
  const { toast } = useApp()
  const [curRec, setCurRec] = useState(RECORDINGS[0])

  const loadRec = (r) => {
    setCurRec(r)
    toast('ok', 'Recording loaded', `${r.id} ready to play (demo).`)
    document.getElementById('content')?.scrollTo(0, 0)
  }

  return (
    <>
      <PageHead
        title="Session Recordings"
        sub="Tamper-evident, indexed recordings of every privileged session — searchable by command, SQL statement and screen text (OCR)."
        actions={<div className="search-inp" style={{ width: 300 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search inside sessions — e.g. “DROP TABLE”" /></div>}
      />
      <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div className="card-h">
          <div>
            <div className="ch-t"><span className="mono" style={{ color: 'var(--mut)', fontSize: '11.5px' }}>{curRec.id}</span> — {curRec.acct}@{curRec.target}</div>
            <div className="ch-s">{curRec.user} · {curRec.date} · {curRec.dur} · {curRec.events} risk events</div>
          </div>
          <div className="ch-right"><Badge tone="bad" label="DLP flag" dot={false} /><button className="btn btn-sec btn-sm"><Icon name="download" />Export evidence</button></div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div className="player">
            <div className="player-screen">
              <div className="ps-line"><span className="ps-p">SQL&gt;</span> CONNECT SYS@ORAFINPRD03 AS SYSDBA;</div>
              <div className="ps-line"><span className="ps-ok">Connected.</span></div>
              <div className="ps-line"><span className="ps-p">SQL&gt;</span> SELECT COUNT(*) FROM FIN.PAYMENT_BATCH WHERE STATUS='STUCK';</div>
              <div className="ps-line">  42 rows selected.</div>
              <div className="ps-line"><span className="ps-p">SQL&gt;</span> ALTER SYSTEM SET LOG_ARCHIVE_DEST_2='SERVICE=standby' SCOPE=BOTH;</div>
              <div className="ps-line"><span className="ps-ok">System altered.</span></div>
              <div className="ps-line"><span className="ps-p">SQL&gt;</span> DROP TABLE FIN.TMP_RECON_0708;</div>
              <div className="ps-line"><span className="ps-warn">⚠ POLICY “Prod-DB-Deny” — statement blocked, reviewer notified. This event is bookmarked at 01:07:12.</span></div>
            </div>
            <div className="player-bar">
              <button className="pb-btn" onClick={() => toast('ok', 'Playback', 'Playing at 1× (demo).')} aria-label="Play"><Icon name="play" size={15} /></button>
              <button className="pb-btn" aria-label="Pause"><Icon name="pause" size={15} /></button>
              <span className="player-time">00:40:12</span>
              <div className="player-track">
                <div className="pt-fill" />
                {[18, 34, 52, 61, 88].map((p) => <span className="pt-mark" key={p} style={{ left: `${p}%` }} title="Risk event" />)}
                <div className="pt-head" />
              </div>
              <span className="player-time">{curRec.dur}</span>
              <button className="pb-btn" title="Speed">2×</button>
              <button className="pb-btn" title="Keystroke log" onClick={() => toast('ok', 'Keystroke index', 'Full keystroke & SQL index opens beside player (demo).')}><Icon name="commands" size={15} /></button>
            </div>
          </div>
          <div className="hrow" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Bookmarks:</span>
            {BOOKMARKS.map((b) => (
              <button className="fchip" key={b} onClick={() => toast('ok', 'Jump', `Seeking to ${b.split(' ')[0]} (demo).`)}><Icon name="clock" size={11} />{b}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <button className="fchip on"><Icon name="filter" size={12} />Has risk events</button>
          <button className="fchip"><Icon name="filter" size={12} />Last 7 days</button>
          <div className="tb-spacer" /><span style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Retention: 7 years (regulatory hold)</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Recording</th><th>User</th><th>Target</th><th className="td-right">Duration</th><th className="td-right">Risk events</th><th>Flag</th><th>Risk</th><th>Date</th><th style={{ width: 70 }} /></tr></thead>
            <tbody>
              {RECORDINGS.map((r) => (
                <tr key={r.id} onClick={() => loadRec(r)}>
                  <td className="td-mono">{r.id}</td>
                  <td><div className="cell-user"><Avatar name={r.user} cls="av-sm" /><span>{r.user}</span></div></td>
                  <td className="td-mono"><span style={{ color: 'var(--mut)' }}>{r.acct}@</span>{r.target}</td>
                  <td className="td-right td-num">{r.dur}</td>
                  <td className="td-right">{r.events ? <span className={`bdg ${r.events > 9 ? 'bdg-bad' : 'bdg-warn'}`}>{r.events}</span> : <span style={{ color: 'var(--faint)' }}>0</span>}</td>
                  <td>{r.flag ? <span style={{ fontSize: '11.5px', color: 'var(--bad)', fontWeight: 600 }}>{r.flag}</span> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                  <td><RiskPill risk={r.risk} /></td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{r.date}</td>
                  <td><div className="row-actions"><button className="mini-btn" title="Play"><Icon name="play" size={14} /></button><button className="mini-btn" title="Export"><Icon name="download" size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
