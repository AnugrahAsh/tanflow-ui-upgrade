import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { REPORTS, CAT, CATEGORIES } from '../data/reports.js'
import ScheduleModal from '../components/ScheduleModal.jsx'

const SCHEDULES = [
  ['Comprehensive Audit Report', 'Daily · 06:00', 'Audit & Compliance queue', 'PDF + CSV', 'Today · 06:00', 'Completed'],
  ['Failed Login Report', 'Every 4 hours', 'SOC Tier-2 (4)', 'CSV → SIEM', 'Today · 12:00', 'Completed'],
  ['Credential Rotation Report', 'Daily · 05:30', 'Vault operations', 'CSV → SFTP', 'Today · 05:30', 'Completed'],
  ['External Access Report', 'Mondays · 07:00', 'CISO, Head of Infrastructure', 'PDF', 'Mon · 07:00', 'Completed'],
  ['Command Audits', 'Fridays · 17:00', 'Security governance', 'XLSX', 'Fri · 17:00', 'In Review'],
  ['Access Policy Report', '1st of month · 07:00', 'Board pack · Risk committee', 'PDF (signed)', 'Jul 1 · 07:00', 'Pending'],
]
const DATASETS = ['Privileged sessions', 'Authentication events', 'Credential operations', 'Access policies', 'Delivery events']
const STATUS_TONE = { Completed: { c: 'var(--ok)', bg: 'var(--ok-bg)' }, 'In Review': { c: '#C2740B', bg: 'var(--warn-bg)' }, Pending: { c: 'var(--mut)', bg: 'var(--surface-2)' } }

const IconTile = ({ cat, icon }) => { const t = CAT[cat] || { c: 'var(--mut)', bg: 'var(--surface-2)' }; return <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: t.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={16} style={{ color: t.c }} /></span> }
const Star = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="#F5A623" stroke="#F5A623" style={{ flex: 'none' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>

export default function Reports() {
  const { go, toast } = useApp()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [view, setView] = useState('grid')
  const [sched, setSched] = useState(null)
  const [ds, setDs] = useState(DATASETS[0])
  const [range, setRange] = useState('24h')
  const [risk, setRisk] = useState('All')
  const [ran, setRan] = useState(null)

  const match = (r) => (!q || (r.name + r.desc + r.cat).toLowerCase().includes(q.toLowerCase())) && (cat === 'All' || r.cat === cat)
  const shown = REPORTS.filter(match)
  const pinned = shown.filter((r) => r.pinned)
  const all = shown.filter((r) => !r.pinned)

  const Card = ({ r }) => (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="hrow" style={{ gap: 11 }}><IconTile cat={r.cat} icon={r.icon} />
          <div><div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)' }}>{r.name}</div><div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--mut)', marginTop: 2 }}>{r.cat.toUpperCase()}</div></div>
        </div>
        {r.pinned && <Star />}
      </div>
      <div style={{ fontSize: '12.25px', color: 'var(--mut)', lineHeight: 1.5, flex: 1 }}>{r.desc}</div>
      <div className="hrow" style={{ gap: 16, marginTop: 12, fontSize: '11.5px', color: 'var(--mut)', flexWrap: 'wrap' }}>
        <span className="hrow" style={{ gap: 5 }}><Icon name="reports" size={13} />{r.records}</span>
        <span className="hrow" style={{ gap: 5 }}><Icon name="lock" size={13} />{r.retention}</span>
        <span className="hrow" style={{ gap: 5 }}><Icon name="clock" size={13} />{r.gen}</span>
      </div>
      <div style={{ borderTop: '1px solid var(--hair)', marginTop: 12, paddingTop: 10 }}><span className="link hrow" style={{ gap: 4 }} onClick={() => go('report/' + r.id)}>View report<Icon name="chevR" size={12} /></span></div>
    </div>
  )
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }
  const Section = ({ items }) => view === 'grid'
    ? <div style={gridStyle}>{items.map((r) => <Card key={r.id} r={r} />)}</div>
    : <div className="card">{items.map((r, i) => (
      <div key={r.id} onClick={() => go('report/' + r.id)} className="hrow" style={{ gap: 14, padding: '12px 16px', borderBottom: i < items.length - 1 ? '1px solid var(--hair)' : 'none', cursor: 'pointer' }}>
        <IconTile cat={r.cat} icon={r.icon} /><div style={{ flex: 1, minWidth: 0 }}><div className="hrow" style={{ gap: 8 }}><span className="td-main">{r.name}</span>{r.pinned && <Star />}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.desc}</div></div>
        <span className="tag">{r.cat}</span><span className="num" style={{ fontSize: '12px', color: 'var(--mut)', width: 90, textAlign: 'right' }}>{r.records}</span><Icon name="chevR" size={14} style={{ color: 'var(--faint)' }} />
      </div>))}</div>

  return (
    <>
      <PageHead title="Reports" sub="Every governed activity in the platform, published as an evidence-grade report — filter it, drill into it, export it or have it delivered on a schedule."
        actions={<button className="btn btn-sec" onClick={() => setSched('open')}><Icon name="calendar" />Schedule delivery</button>} />

      <div className="kpi-row cols-4">
        <KpiTile label="Reports in catalog" icon="reports" val={REPORTS.length} foot="8 categories" />
        <KpiTile label="Scheduled deliveries" icon="calendar" val={SCHEDULES.length} foot="PDF, CSV, XLSX, SFTP & SIEM" />
        <KpiTile label="Generated (30d)" icon="activity" val="1,284" delta={12} foot="on demand + scheduled" />
        <KpiTile label="Retention" icon="lock" val="7" unit="yrs" foot="WORM storage · regulator-aligned" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div className="search-inp" style={{ width: 220 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search reports…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {CATEGORIES.map((c) => <button key={c} className="btn btn-sec btn-sm" style={cat === c ? { color: 'var(--accent)', borderColor: 'var(--accent-line)', background: 'var(--accent-bg)' } : undefined} onClick={() => setCat(c)}>{c}</button>)}
          <div className="tb-spacer" />
          <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{shown.length} of {REPORTS.length} reports</span>
          <button className="icon-btn" style={view === 'grid' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('grid')}><Icon name="grid" size={15} /></button>
          <button className="icon-btn" style={view === 'list' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('list')}><Icon name="list" size={15} /></button>
        </div>
        <div className="card-pad">
          {pinned.length > 0 && <>
            <div className="hrow" style={{ gap: 8, marginBottom: 12 }}><Icon name="star" size={13} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--faint)' }}>PINNED</span></div>
            <Section items={pinned} />
          </>}
          {all.length > 0 && <>
            <div className="hrow" style={{ gap: 8, margin: pinned.length ? '22px 0 12px' : '0 0 12px' }}><Icon name="list" size={13} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--faint)' }}>ALL REPORTS</span></div>
            <Section items={all} />
          </>}
          {shown.length === 0 && <div className="empty" style={{ padding: '48px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No reports match</div><div className="e-s">Try a different search or category.</div></div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 16, alignItems: 'start' }}>
        <div className="card"><div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div><div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Scheduled deliveries</div><div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Subscriptions, their recipients and the last run</div></div>
            <button className="btn btn-sec btn-sm" onClick={() => setSched('open')}><Icon name="plus" size={13} />New schedule</button>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Report</th><th>Schedule</th><th>Recipients</th><th>Format</th><th>Last run</th><th>Status</th></tr></thead>
              <tbody>
                {SCHEDULES.map((s) => (
                  <tr key={s[0] + s[1]}>
                    <td className="td-main">{s[0]}</td><td style={{ color: 'var(--ink-2)' }}>{s[1]}</td><td style={{ color: 'var(--mut)' }}>{s[2]}</td>
                    <td><span className="mono" style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '2px 7px', color: 'var(--ink-2)' }}>{s[3]}</span></td>
                    <td className="td-num" style={{ color: 'var(--mut)' }}>{s[4]}</td>
                    <td><span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 600, color: STATUS_TONE[s[5]].c, background: STATUS_TONE[s[5]].bg, borderRadius: 6, padding: '2px 9px', width: 'fit-content' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_TONE[s[5]].c }} />{s[5]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hrow" style={{ gap: 8, marginTop: 12, fontSize: '11.75px', color: 'var(--mut)' }}><Icon name="shieldCheck" size={14} style={{ color: 'var(--ok)', flex: 'none' }} />Every delivery is itself audited — recipient, format and payload hash.</div>
        </div></div>

        <div className="card"><div className="card-pad">
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Ad-hoc query</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2, marginBottom: 16 }}>Anything you can see, you can export</div>
          <div className="field" style={{ marginBottom: 14 }}><label>DATASET</label><select className="sel" value={ds} onChange={(e) => setDs(e.target.value)}>{DATASETS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="field" style={{ marginBottom: 14 }}><label>RANGE</label>
            <div style={{ display: 'inline-flex', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>{['24h', '7d', '30d'].map((x) => <button key={x} onClick={() => setRange(x)} style={{ padding: '7px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', background: range === x ? 'var(--accent-bg)' : 'transparent', color: range === x ? 'var(--accent)' : 'var(--ink-2)', borderRight: x !== '30d' ? '1px solid var(--line-2)' : 'none' }}>{x}</button>)}</div>
          </div>
          <div className="field" style={{ marginBottom: 16 }}><label>RISK / SEVERITY</label><select className="sel" value={risk} onChange={(e) => setRisk(e.target.value)}>{['All', 'Critical', 'High', 'Medium', 'Low'].map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="hrow" style={{ gap: 8 }}>
            <button className="btn btn-pri" style={{ flex: 1 }} onClick={() => setRan({ ds, range, risk, rows: 1204 })}><Icon name="play" size={13} />Run query</button>
            <button className="btn btn-sec" disabled={!ran} onClick={() => ran && toast('ok', 'Exported', `${ran.rows.toLocaleString()} rows exported to CSV (demo).`)} style={!ran ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="download" />Export</button>
          </div>
          {ran ? (
            <div style={{ marginTop: 18, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'var(--surface-2)', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{ran.rows.toLocaleString()} rows · {ran.ds} · {ran.range}{ran.risk !== 'All' ? ` · ${ran.risk}` : ''}</div>
              {[['13:31:04', 'PS-88409', 'Critical'], ['13:12:40', 'PS-88401', 'Medium'], ['12:58:11', 'PS-88398', 'Low']].map(([t, id, r]) => (
                <div key={id} className="hrow" style={{ justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid var(--hair)', fontSize: '12px' }}><span className="mono" style={{ color: 'var(--mut)' }}>{t}</span><span className="mono" style={{ color: 'var(--ink-2)' }}>{id}</span><span style={{ color: 'var(--mut)' }}>{r}</span></div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '40px 12px', marginTop: 12 }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No query yet</div><div className="e-s">Pick a dataset and run — results render here and export to CSV.</div></div>
          )}
        </div></div>
      </div>

      {sched && <ScheduleModal report={sched === 'open' ? null : sched} onClose={() => setSched(null)} />}
    </>
  )
}
