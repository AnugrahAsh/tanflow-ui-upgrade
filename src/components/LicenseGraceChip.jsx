import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

/* §7 — status-bar chip warning that the licence is inside its grace period.
   Quiet until it matters, then unmissable. */

export default function LicenseGraceChip({ daysLeft = 12, seats = '4,812 of 5,000' }) {
  const { go } = useApp()
  const [open, setOpen] = useState(false)
  const critical = daysLeft <= 7
  const c = critical ? 'var(--bad)' : 'var(--warn-core)'

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={() => setOpen((v) => !v)} title="Licence grace period"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 18, padding: '0 7px', borderRadius: 'var(--r-xs)', fontSize: '11px', fontWeight: 600, color: c, background: critical ? 'rgba(194,30,46,.12)' : 'rgba(232,163,23,.14)', border: `1px solid ${critical ? 'rgba(194,30,46,.3)' : 'rgba(232,163,23,.35)'}`, cursor: 'pointer' }}>
        <Icon name="warnTri" size={11} />Licence · {daysLeft}d
      </button>

      {open && (
        <>
          <span style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <span style={{ position: 'absolute', bottom: 26, right: 0, zIndex: 91, width: 280, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r)', boxShadow: 'var(--sh-lg)', padding: 14, display: 'block' }}>
            <span className="hrow" style={{ gap: 9, marginBottom: 8 }}>
              <Icon name="certs" size={15} style={{ color: c, flex: 'none' }} />
              <b style={{ fontSize: '13px', color: 'var(--ink)' }}>Licence grace period</b>
            </span>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Your subscription expired and is running on a <b>{daysLeft}-day grace period</b>. Sessions keep working; new connections stop when it ends.
            </span>
            <span style={{ display: 'block', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hair)' }}>
              {[['Seats in use', seats], ['Grace ends', `in ${daysLeft} days`]].map(([k, v]) => (
                <span key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: '11.75px' }}>
                  <span style={{ color: 'var(--mut)' }}>{k}</span><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{v}</span>
                </span>
              ))}
            </span>
            <button className="btn btn-pri btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => { setOpen(false); go('license') }}>
              <Icon name="certs" size={13} />Review licence
            </button>
          </span>
        </>
      )}
    </span>
  )
}
