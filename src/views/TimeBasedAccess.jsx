import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'

// Standing time windows. `state` is the clock's verdict; `enabled` is the operator's.
const SCHEDULES = [
  { id: 'branch-hours', name: 'Business hours — Branch Ops', enabled: true, recur: 'Daily', window: '08:00 – 18:30', subjects: 'Branch Operations · 214 users', scope: 'Core Banking targets (12)', validity: 'Jan 6, 2026 → no expiry', state: 'Open' },
  { id: 'sap-weekend', name: 'Change window — SAP weekend', enabled: true, recur: 'Weekly', window: 'Sat 22:00 – Sun 06:00', subjects: 'SAP Basis · 9 users', scope: 'sap-prd-* (4 targets)', validity: 'Mar 1 → Dec 31, 2026', state: 'Closed' },
  { id: 'vendor-8841', name: 'Contractor window — Vendor 8841', enabled: true, recur: 'Daily', window: '09:00 – 17:00', subjects: 'Contractor 8841', scope: 'BTSPAMDEV01 only', validity: 'Jun 12 → Sep 30, 2026', state: 'Open' },
  { id: 'treasury-qc', name: 'Quarter-close — Treasury extension', enabled: false, recur: 'Once', window: 'Jul 28 – Aug 2', subjects: 'Treasury Front Office · 126 users', scope: 'Murex · SWIFT gateways', validity: 'Jul 28 → Aug 2, 2026', state: 'Closed' },
  { id: 'night-freeze', name: 'Night freeze — production DBs', enabled: true, recur: 'Daily', window: '00:00 – 05:00 (deny)', subjects: 'Everyone except SOC on-call', scope: 'All production databases', validity: 'Feb 2, 2026 → no expiry', state: 'Closed' },
]

const STATE_TONE = {
  Open: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)', icon: 'check' },
  Closed: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)', icon: 'lock' },
  Off: { c: 'var(--mut)', bg: 'var(--surface-3)', b: 'var(--line)', icon: 'ban' },
}
const StateBadge = ({ state }) => {
  const t = STATE_TONE[state]
  return <span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '11.5px', fontWeight: 600, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-sm)', padding: '2px 9px', whiteSpace: 'nowrap' }}><Icon name={t.icon} size={11} />{state}</span>
}

export default function TimeBasedAccess() {
  const { toast, go } = useApp()
  const navigate = useNavigate()
  const [rows, setRows] = useState(SCHEDULES)
  const [q, setQ] = useState('')

  const toggleEnabled = (id) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  const openEdit = (s) => navigate('/create-time-based-policy', { state: { edit: s } })

  const enabledCount = rows.filter((r) => r.enabled).length
  const openNow = rows.filter((r) => r.enabled && r.state === 'Open').length

  const shownRows = rows.filter((r) => !q || (r.name + r.window + r.subjects + r.scope).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <PageHead
        title="Access Schedules"
        sub="Standing time windows that decide when access is usable — business-hours gates, recurring change windows and one-time extensions. JIT decides how long; schedules decide when at all."
        actions={<button className="btn btn-pri" onClick={() => go('create-time-based-policy')}><Icon name="plus" />New schedule</button>}
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Schedules" icon="calendar" val={rows.length} foot={`${enabledCount} enabled`} />
        <KpiTile label="Windows open now" icon="unlock" val={openNow} foot={<span className="hrow" style={{ gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />next closes 18:30 CET</span>} />
        <KpiTile label="Subjects governed" icon="users" val="351" foot="users &amp; groups in scope" />
        <KpiTile label="Launches denied (7d)" icon="ban" val="23" delta={-12} goodUp={false} foot="outside-window attempts" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>All Schedules</div>
        <div className="search-inp" style={{ width: 260 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search schedules…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
        {shownRows.map((s) => (
          <div key={s.id} className="card" onClick={() => openEdit(s)} style={{ cursor: 'pointer', transition: 'box-shadow .12s, border-color .12s', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Top row: Name & Toggle */}
            <div className="hrow" style={{ justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: s.enabled ? 'var(--ink)' : 'var(--ink-2)', lineHeight: 1.3 }}>{s.name}</div>
              <span className={`toggle ${s.enabled ? 'on' : ''}`} role="switch" aria-checked={s.enabled} onClick={(e) => { e.stopPropagation(); toggleEnabled(s.id) }} style={{ flex: 'none', transform: 'scale(0.8)', margin: '-2px -4px -2px 0' }} />
            </div>

            {/* State and Validity */}
            <div className="hrow" style={{ gap: 8 }}>
              <StateBadge state={s.enabled ? s.state : 'Off'} />
              <span style={{ fontSize: '11px', color: 'var(--mut)' }}>{s.validity}</span>
            </div>

            {/* Time Window (Compact Bar) */}
            <div className="hrow" style={{ gap: 6, padding: '6px 10px', background: s.enabled && s.state === 'Open' ? 'var(--ok-bg)' : 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: `1px solid ${s.enabled && s.state === 'Open' ? 'var(--ok-line)' : 'var(--line-2)'}` }}>
              <Icon name="clock" size={12} style={{ color: s.enabled && s.state === 'Open' ? 'var(--ok)' : 'var(--mut)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: s.enabled && s.state === 'Open' ? 'var(--ok)' : 'var(--mut)' }}>{s.recur}</span>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: s.enabled ? 'var(--ink)' : 'var(--mut)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{s.window}</span>
            </div>

            {/* Subjects and Scope */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 2 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--mut)', marginBottom: 2 }}>SUBJECTS</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.subjects}>{s.subjects}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--mut)', marginBottom: 2 }}>SCOPE</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.scope}>{s.scope}</div>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="card">
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 8, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: the Treasury extension overlaps the night freeze on Jul 28–Aug 2 — freeze wins unless you add an exception. Simulate before quarter-close.</span>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Overlap simulation', 'Night freeze wins for 5 of 126 subjects during Jul 28–Aug 2 (demo).')}><Icon name="eye" size={13} />Simulate overlap</button>
        </div>
      </div>
    </>
  )
}
