import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'

/* §7 — the overlay between "Connect" and a usable session: what the gateway is
   doing, and what to do when it fails. */

const STEPS = [
  ['shieldCheck', 'Checking policy', 'Time window, command policy and approvals'],
  ['keyRound', 'Checking out credential', 'Vaulted secret leased for this session'],
  ['link', 'Establishing tunnel', 'Gateway-brokered, TLS 1.3'],
  ['recordings', 'Starting recording', 'Hash-chained from the first frame'],
]

export default function TunnelCreationModal({ target = 'BTSPAMDEMO01', proto = 'SSH', onDone, onCancel, failAt = null }) {
  const [step, setStep] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (failed) return undefined
    if (failAt != null && step === failAt) { const t = setTimeout(() => setFailed(true), 600); return () => clearTimeout(t) }
    if (step >= STEPS.length) { const t = setTimeout(() => onDone?.(), 350); return () => clearTimeout(t) }
    const t = setTimeout(() => setStep((s) => s + 1), 480)
    return () => clearTimeout(t)
  }, [step, failed, failAt, onDone])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(10,17,32,.78)' }}>
      <div className="card" style={{ width: 'min(420px, 96vw)', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          {failed ? (
            <>
              <div className="hrow" style={{ gap: 12, marginBottom: 14 }}>
                <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="ban" size={19} style={{ color: 'var(--bad)' }} /></span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Couldn’t open the session</div>
                  <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{target} · {proto}</div>
                </div>
              </div>
              <div style={{ fontSize: '12.75px', color: 'var(--ink-2)', lineHeight: 1.6 }}>
                The gateway reached {target} but the target refused the connection. Nothing was checked out and no session was recorded.
              </div>
              <div style={{ marginTop: 14, padding: '11px 13px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                {[['Stage', STEPS[failAt ?? 2][1]], ['Reason', 'Connection refused (ECONNREFUSED)'], ['Reference', 'TUN-40218']].map(([k, v]) => (
                  <div key={k} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '4px 0', fontSize: '12px' }}>
                    <span style={{ color: 'var(--mut)' }}>{k}</span><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                <button className="btn btn-sec" onClick={onCancel}>Close</button>
                <button className="btn btn-pri" onClick={() => { setFailed(false); setStep(0) }}><Icon name="refresh" />Try again</button>
              </div>
            </>
          ) : (
            <>
              <div className="hrow" style={{ gap: 12, marginBottom: 16 }}>
                <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="link" size={19} style={{ color: 'var(--accent)' }} /></span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Opening session</div>
                  <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{target} · {proto}</div>
                </div>
              </div>

              {STEPS.map((s, i) => {
                const done = i < step
                const active = i === step
                return (
                  <div key={s[1]} className="hrow" style={{ gap: 11, padding: '9px 0', opacity: done || active ? 1 : .45 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--ok)' : 'transparent', border: `2px solid ${done ? 'var(--ok)' : active ? 'var(--accent)' : 'var(--line-2)'}` }}>
                      {done ? <Icon name="check" size={12} style={{ color: '#fff' }} />
                        : active ? <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin .6s linear infinite' }} /> : null}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12.75px', fontWeight: 600, color: done || active ? 'var(--ink)' : 'var(--mut)' }}>{s[1]}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{s[2]}</div>
                    </div>
                  </div>
                )
              })}

              <div className="hrow" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
                <button className="btn btn-sec btn-sm" onClick={onCancel}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
