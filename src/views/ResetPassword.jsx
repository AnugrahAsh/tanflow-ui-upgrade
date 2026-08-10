import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, EyeBtn, Spinner, PasswordRules, PW_RULES } from '../components/LoginKit.jsx'

const POINTS = [
  ['lock', 'Never reused', 'Your last 12 passwords are remembered and rejected.'],
  ['fingerprint', 'Add a passkey next', 'Phishing-resistant sign-in beats any password.'],
  ['sessions', 'Other sessions end', 'Resetting signs you out everywhere except this browser.'],
]

export default function ResetPassword() {
  const { go, toast } = useApp()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strong = PW_RULES.every(([, fn]) => fn(pw))
  const match = pw.length > 0 && pw === confirm
  const ok = strong && match

  const submit = (e) => {
    e.preventDefault()
    if (loading) return
    if (!strong) { toast('warn', 'Password too weak', 'Meet every requirement before continuing.'); return }
    if (!match) { toast('warn', 'Passwords do not match', 'Re-enter the same password in both fields.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 750)
  }

  return (
    <AuthShell
      heading={<>Choose a password<br />worth keeping.</>}
      headingSub="One strong secret, then move to a passkey — Tanflow supports both."
      aside={<AuthPoints items={POINTS} />}
      icon={done ? 'check' : 'lock'}
      title={done ? 'Password updated' : 'Set a new password'}
      sub={done
        ? 'Your password has been changed and every other session was signed out. You can sign in now.'
        : <>Resetting the password for <b style={{ color: 'var(--ink)' }}>tribhuwan.rao@meridianbank.com</b>.</>}
      foot={done ? undefined : <>This link expires 30 minutes after it was requested.</>}
    >
      {done ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--ok-bg)', border: '1px solid var(--ok-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="shieldCheck" size={16} style={{ color: 'var(--ok)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
              All other devices were signed out. If you did not make this change, contact your administrator immediately.
            </div>
          </div>
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} onClick={() => go('login1')}>
            Continue to sign in<Icon name="arrowRight" size={15} />
          </button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>New password</label>
            <LoginInput icon="lock" type={show ? 'text' : 'password'} placeholder="••••••••••••" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" autoFocus rightSlot={<EyeBtn show={show} onClick={() => setShow((s) => !s)} />} />
          </div>
          <PasswordRules value={pw} />
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Confirm password</label>
            <LoginInput icon="lock" type={show ? 'text' : 'password'} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password"
              style={confirm && !match ? { borderColor: 'var(--bad)' } : undefined} />
            {confirm && !match && <div style={{ fontSize: '11.75px', color: 'var(--bad)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="warnTri" size={12} />Passwords do not match</div>}
          </div>
          <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', opacity: ok ? 1 : .55, cursor: ok ? 'pointer' : 'not-allowed' }} disabled={loading || !ok}>
            {loading ? <Spinner /> : <><Icon name="check" size={15} />Update password</>}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
