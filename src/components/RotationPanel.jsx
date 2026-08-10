import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Avatar } from './primitives.jsx'
import VaultConnectionModal from './VaultConnectionModal.jsx'

/* §6 — credential rotation: the schedule, the history and the manual override.
   The drop's Vault covered storage and reveal but never rotation. */

const SEED = [
  { id: 'r1', cred: 'root@BTSPAMDEMO01', target: 'BTSPAMDEMO01', policy: 'Every 24h', next: 'in 4h 12m', last: '19h ago', state: 'Healthy', wired: true },
  { id: 'r2', cred: 'Administrator@TANFLOWAD01', target: 'TANFLOWAD01', policy: 'Every 12h', next: 'in 1h 03m', last: '10h ago', state: 'Healthy', wired: true },
  { id: 'r3', cred: 'pamadmin@BTSPLPAMPRODBD01', target: 'BTSPLPAMPRODBD01', policy: 'Every 24h', next: 'overdue 6h', last: '30h ago', state: 'Failing', wired: true },
  { id: 'r4', cred: 'appadmin@TANFLOWAPP01', target: 'TANFLOWAPP01', policy: 'Manual', next: '—', last: '2 mos ago', state: 'Stale', wired: false },
]
const STATE = {
  Healthy: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' },
  Failing: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)' },
  Stale: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
}
const HISTORY = [
  ['Today 02:14', 'root@BTSPAMDEMO01', 'Rotated · verified', 'ok', 'scheduler'],
  ['Today 01:02', 'Administrator@TANFLOWAD01', 'Rotated · verified', 'ok', 'scheduler'],
  ['Yesterday 20:41', 'pamadmin@BTSPLPAMPRODBD01', 'Failed — target refused connection', 'bad', 'scheduler'],
  ['Yesterday 09:15', 'svc-deploy@BTSPAMDEMO01', 'Rotated on check-in', 'ok', 'Tribhuwan Rao'],
  ['2 days ago', 'netadmin@fw-core-01', 'Rotated · verified', 'ok', 'scheduler'],
]

export default function RotationPanel() {
  const { toast } = useApp()
  const [rows, setRows] = useState(SEED)
  const [wireFor, setWireFor] = useState(null)
  const [busy, setBusy] = useState(null)

  const rotateNow = (r) => {
    if (!r.wired) { toast('warn', 'No rotation connection', 'Wire this credential to its target before rotating.'); setWireFor(r.cred); return }
    setBusy(r.id)
    setTimeout(() => {
      setBusy(null)
      setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, state: 'Healthy', last: 'just now', next: x.policy === 'Manual' ? '—' : 'in 24h' } : x)))
      toast('ok', 'Credential rotated', `${r.cred} — new secret issued and verified (demo).`)
    }, 1100)
  }

  const failing = rows.filter((r) => r.state !== 'Healthy').length

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div><div className="ch-t">Rotation schedule</div><div className="ch-s">When each vaulted secret changes, and whether the last attempt held</div></div>
          <div className="ch-right hrow" style={{ gap: 8 }}>
            {failing > 0 && <span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 600, color: 'var(--bad)', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><Icon name="warnTri" size={11} />{failing} need attention</span>}
            <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Sweep queued', 'All due credentials queued for rotation (demo).')}><Icon name="refresh" size={13} />Rotate all due</button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Credential</th><th>Policy</th><th>Next run</th><th>Last rotated</th><th>State</th><th>Connection</th><th style={{ width: 96 }} /></tr></thead>
            <tbody>
              {rows.map((r) => {
                const t = STATE[r.state]
                return (
                  <tr key={r.id}>
                    <td className="mono" style={{ fontSize: '12.25px', fontWeight: 600, color: 'var(--ink)' }}>{r.cred}</td>
                    <td><span className="tag">{r.policy}</span></td>
                    <td style={{ color: r.next.startsWith('overdue') ? 'var(--bad)' : 'var(--mut)', fontWeight: r.next.startsWith('overdue') ? 600 : 400 }}>{r.next}</td>
                    <td style={{ color: 'var(--mut)' }}>{r.last}</td>
                    <td><span className="hrow" style={{ gap: 6, width: 'fit-content', fontSize: '11.5px', fontWeight: 600, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-sm)', padding: '2px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: t.c }} />{r.state}</span></td>
                    <td>
                      {r.wired
                        ? <span className="hrow" style={{ gap: 5, fontSize: '12px', color: 'var(--ok)' }}><Icon name="check" size={12} />Wired</span>
                        : <span className="link" style={{ fontSize: '12px' }} onClick={() => setWireFor(r.cred)}>Set up</span>}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="mini-btn" title="Rotate now" disabled={busy === r.id} onClick={() => rotateNow(r)}><Icon name="refresh" size={14} /></button>
                        <button className="mini-btn" title="Rotation connection" onClick={() => setWireFor(r.cred)}><Icon name="link" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="hrow" style={{ gap: 8, padding: '12px 16px', borderTop: '1px solid var(--hair)', fontSize: '12px', color: 'var(--mut)' }}>
          <Icon name="shieldCheck" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />
          Rotation never interrupts a live session — the new secret takes effect at the next check-out.
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div><div className="ch-t">Rotation history</div><div className="ch-s">Every attempt, scheduled or manual, with who triggered it</div></div></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>When</th><th>Credential</th><th>Outcome</th><th>Triggered by</th></tr></thead>
            <tbody>
              {HISTORY.map(([when, cred, outcome, tone, by], i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--mut)', whiteSpace: 'nowrap' }}>{when}</td>
                  <td className="mono" style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{cred}</td>
                  <td><span className="hrow" style={{ gap: 6, fontSize: '12.25px', fontWeight: 600, color: tone === 'ok' ? 'var(--ok)' : 'var(--bad)' }}><Icon name={tone === 'ok' ? 'check' : 'warnTri'} size={12} />{outcome}</span></td>
                  <td>{by === 'scheduler'
                    ? <span className="hrow" style={{ gap: 6, fontSize: '12.25px', color: 'var(--mut)' }}><Icon name="clock" size={12} />Scheduler</span>
                    : <span className="hrow" style={{ gap: 8 }}><Avatar name={by} cls="av-sm" /><span style={{ fontSize: '12.5px' }}>{by}</span></span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {wireFor && <VaultConnectionModal credential={wireFor} onClose={() => setWireFor(null)} onSave={() => setRows((rs) => rs.map((x) => (x.cred === wireFor ? { ...x, wired: true } : x)))} />}
    </>
  )
}
