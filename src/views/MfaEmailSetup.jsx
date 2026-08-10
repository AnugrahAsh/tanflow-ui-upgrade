import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, Spinner, OtpInput, ResendTimer } from '../components/LoginKit.jsx'

const POINTS = [
  ['mail', 'Uses your work mailbox', 'Codes go to the address on your identity record.'],
  ['warnTri', 'Only as strong as email', 'If your mailbox is compromised, so is this factor.'],
  ['clock', 'Codes last 5 minutes', 'Each code is single-use and expires quickly.'],
]
const REGISTERED = 'tribhuwan.rao@meridianbank.com'

export default function MfaEmailSetup() {
  const { go, toast } = useApp()
  const [email] = useState(REGISTERED)
  const [stage, setStage] = useState('confirm') // confirm | code
  const [code, setCode] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  const send = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setStage('code') }, 650)
  }
  const verify = (val) => {
    const entered = val ?? code
    if (entered.length < 6) { toast('warn', 'Code incomplete', 'Enter all 6 digits.'); return }
    if (entered === '000000') { setInvalid(true); setCode(''); toast('warn', 'Incorrect code', 'That code did not match.'); return }
    setLoading(true)
    setTimeout(() => { toast('ok', 'Email verified', 'Email one-time codes are now active (demo).'); go('mfa-backup-codes') }, 700)
  }

  return (
    <AuthShell
      heading={<>A code in your inbox,<br />whenever you sign in.</>}
      headingSub="Simple and universal — best used alongside a phishing-resistant factor."
      aside={<AuthPoints items={POINTS} />}
      step="Step 2 of 3"
      icon="mail"
      title={stage === 'confirm' ? 'Use email one-time codes' : 'Check your inbox'}
      sub={stage === 'confirm'
        ? 'Codes are sent to the email address on your identity record.'
        : <>Enter the code we sent to <b style={{ color: 'var(--ink)' }}>{email}</b>.</>}
      back={stage === 'confirm' ? 'Choose another method' : 'Back'}
      onBack={() => (stage === 'confirm' ? go('mfa-setup') : setStage('confirm'))}
    >
      {stage === 'confirm' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Registered email</label>
            <LoginInput icon="mail" value={email} readOnly style={{ background: 'var(--surface-2)' }} rightSlot={<Icon name="lock" size={14} style={{ color: 'var(--faint)' }} />} />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 7 }}>Managed by your directory — ask an administrator to change it.</div>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="warnTri" size={16} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Email codes are a basic factor. A <span className="link" onClick={() => go('mfa-webauthn')}>passkey</span> is stronger and faster.</div>
          </div>
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading} onClick={send}>
            {loading ? <Spinner /> : <>Send verification code<Icon name="arrowRight" size={15} /></>}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>6-digit code</label>
            <OtpInput value={code} onChange={(v) => { setCode(v); setInvalid(false) }} onComplete={(v) => verify(v)} invalid={invalid} />
            {invalid && <div style={{ fontSize: '11.75px', color: 'var(--bad)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="warnTri" size={12} />That code didn’t match.</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <ResendTimer seconds={30} onResend={() => toast('ok', 'Code resent', `A new code was sent to ${email} (demo).`)} />
            <span style={{ fontSize: '12px', color: 'var(--faint)' }}>Expires in 5 minutes</span>
          </div>
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading} onClick={() => verify()}>
            {loading ? <Spinner /> : <>Verify and continue<Icon name="arrowRight" size={15} /></>}
          </button>
        </div>
      )}
    </AuthShell>
  )
}
