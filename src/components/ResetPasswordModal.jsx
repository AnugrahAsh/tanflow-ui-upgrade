import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const maskEmail = (e) => {
  if (!e || !e.includes('@')) return e || ''
  const [u, d] = e.split('@')
  return `${u[0]}***${u[u.length - 1]}@${d}`
}
const SubLabel = ({ children, style }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)', ...style }}>{children}</div>
)

// Reusable "reset password" modal. `user` = { name, handle, email }.
export default function ResetPasswordModal({ user = {}, onClose }) {
  const { toast } = useApp()
  const email = user.email || ''
  const handle = user.handle || (email ? email.split('@')[0] : (user.name || 'user'))
  const [method, setMethod] = useState('manual')
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [temp, setTemp] = useState(true)

  const reqs = [
    ['At least 8 characters', pw.length >= 8],
    ['One uppercase letter (A-Z)', /[A-Z]/.test(pw)],
    ['One lowercase letter (a-z)', /[a-z]/.test(pw)],
    ['One number (0-9)', /[0-9]/.test(pw)],
    ['One special character', /[^A-Za-z0-9]/.test(pw)],
  ]
  const valid = method === 'email' || (reqs.every((r) => r[1]) && pw === confirm)

  const submit = () => {
    toast('ok', 'Password reset',
      method === 'email'
        ? `Reset link sent to ${maskEmail(email)} (demo).`
        : `New password set for @${handle} — they’ll be prompted at next login (demo).`)
    onClose()
  }

  const optCard = (id, title, desc) => (
    <label style={{ display: 'flex', gap: 11, padding: '13px 14px', border: `1px solid ${method === id ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: method === id ? 'var(--sh-focus)' : 'none' }}>
      <input type="radio" name="pwmethod" checked={method === id} onChange={() => setMethod(id)} style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
      <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{title}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{desc}</div></div>
    </label>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(540px, 96vw)', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="hrow" style={{ gap: 9 }}><Icon name="unlock" size={18} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 16, fontWeight: 700 }}>Reset Password — {handle}</span></div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {optCard('manual', 'Set a password manually', 'You choose the password and share it with the user.')}
            {optCard('email', 'Send a reset link by email', email ? `A reset link will be emailed to ${maskEmail(email)}.` : 'A reset link will be emailed to the user.')}
          </div>

          {method === 'manual' && (
            <>
              <div style={{ marginTop: 18 }}>
                <SubLabel style={{ marginBottom: 6 }}>New Password</SubLabel>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input className="inp" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} style={{ paddingRight: 34 }} placeholder="Enter a new password" />
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle" style={{ position: 'absolute', right: 8, color: 'var(--faint)', display: 'inline-flex' }}><Icon name="eye" size={15} /></button>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reqs.map(([label, ok]) => (
                    <div key={label} className="hrow" style={{ gap: 8, fontSize: '12px', color: ok ? 'var(--ok)' : 'var(--mut)' }}>
                      {ok ? <Icon name="check" size={13} /> : <span style={{ width: 11, height: 11, borderRadius: '50%', border: '1.5px solid var(--line-2)', flex: 'none' }} />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <SubLabel style={{ marginBottom: 6 }}>Confirm New Password</SubLabel>
                <input className="inp" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter the new password" />
                {confirm && confirm !== pw && <div style={{ fontSize: '11.5px', color: 'var(--bad)', marginTop: 5 }}>Passwords do not match.</div>}
              </div>
              <label className="hrow" style={{ gap: 10, marginTop: 18, cursor: 'pointer' }}>
                <span className={`toggle ${temp ? 'on' : ''}`} onClick={(e) => { e.preventDefault(); setTemp((t) => !t) }} />
                <span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Temporary password</span>
                  <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)' }}>The user must set their own password on next login.</span></span>
              </label>
            </>
          )}

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!valid} onClick={submit} style={!valid ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><Icon name="unlock" />Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  )
}
