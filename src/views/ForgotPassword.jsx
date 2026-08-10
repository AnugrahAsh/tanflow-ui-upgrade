import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, Spinner, ResendTimer } from '../components/LoginKit.jsx'

const POINTS = [
  ['mail', 'Links are single-use', 'Each reset link works once and expires in 30 minutes.'],
  ['shieldCheck', 'Bound to your account', 'Opening it elsewhere invalidates the link and alerts security.'],
  ['audit', 'Every attempt is logged', 'Requests appear in the audit trail with source IP and device.'],
]

export default function ForgotPassword() {
  const { go, toast } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (loading) return
    if (!email.trim() || !email.includes('@')) { toast('warn', 'Email required', 'Enter the work email registered to your account.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 700)
  }

  return (
    <AuthShell
      heading={<>Locked out?<br />Let’s get you back in.</>}
      headingSub="Reset links are single-use, time-boxed and tied to the device that requested them."
      aside={<AuthPoints items={POINTS} />}
      icon={sent ? 'check' : 'key2'}
      title={sent ? 'Check your inbox' : 'Forgot your password?'}
      sub={sent
        ? <>If <b style={{ color: 'var(--ink)' }}>{email}</b> matches an account, a reset link is on its way. It expires in 30 minutes.</>
        : 'Enter the work email registered to your account and we’ll send a reset link.'}
      back="Back to sign in"
      onBack={() => go('login1')}
      foot={<>Still stuck? <span className="link">Contact your administrator</span></>}
    >
      {sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="shieldCheck" size={16} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
              We never confirm whether an address is registered — that protects your colleagues from account discovery.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <ResendTimer seconds={45} label="Resend link" onResend={() => toast('ok', 'Link resent', `A new reset link was sent to ${email} (demo).`)} />
            <span className="link" style={{ fontSize: '12.5px' }} onClick={() => { setSent(false); setEmail('') }}>Use a different email</span>
          </div>
          <button className="btn btn-sec" style={{ height: 44, fontSize: '13.5px', justifyContent: 'center', width: '100%' }} onClick={() => go('login1')}>
            <Icon name="arrowLeft" size={15} />Return to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Work email</label>
            <LoginInput icon="mail" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
          </div>
          <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading}>
            {loading ? <Spinner /> : <>Send reset link<Icon name="arrowRight" size={15} /></>}
          </button>
          <div style={{ fontSize: '12px', color: 'var(--mut)', lineHeight: 1.55 }}>
            Signed in with SSO? Your password is managed by your identity provider — <span className="link" onClick={() => go('login1')}>sign in with SSO</span> instead.
          </div>
        </form>
      )}
    </AuthShell>
  )
}
