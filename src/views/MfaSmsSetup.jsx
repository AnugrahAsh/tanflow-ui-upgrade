import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, Spinner, OtpInput, ResendTimer } from '../components/LoginKit.jsx'

const POINTS = [
  ['chat', 'Works on any phone', 'No app needed — useful as a fallback factor.'],
  ['warnTri', 'Weaker than a passkey', 'SMS can be intercepted by SIM-swap attacks.'],
  ['clock', 'Codes last 5 minutes', 'Each code is single-use and expires quickly.'],
]

export default function MfaSmsSetup() {
  const { go, toast } = useApp()
  const [phone, setPhone] = useState('')
  const [stage, setStage] = useState('number') // number | code
  const [code, setCode] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  const send = (e) => {
    e?.preventDefault?.()
    if (phone.replace(/\D/g, '').length < 8) { toast('warn', 'Number required', 'Enter a mobile number including country code.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStage('code') }, 650)
  }
  const verify = (val) => {
    const entered = val ?? code
    if (entered.length < 6) { toast('warn', 'Code incomplete', 'Enter all 6 digits.'); return }
    if (entered === '000000') { setInvalid(true); setCode(''); toast('warn', 'Incorrect code', 'That code did not match.'); return }
    setLoading(true)
    setTimeout(() => { toast('ok', 'Mobile number verified', 'SMS one-time codes are now active (demo).'); go('mfa-backup-codes') }, 700)
  }

  return (
    <AuthShell
      heading={<>A code by text,<br />whenever you sign in.</>}
      headingSub="Keep SMS as a fallback and pair it with a stronger factor when you can."
      aside={<AuthPoints items={POINTS} />}
      step="Step 2 of 3"
      icon="chat"
      title={stage === 'number' ? 'Add your mobile number' : 'Verify your number'}
      sub={stage === 'number'
        ? 'We’ll text a 6-digit code to confirm the number belongs to you.'
        : <>Enter the code we sent to <b style={{ color: 'var(--ink)' }}>{phone}</b>.</>}
      back={stage === 'number' ? 'Choose another method' : 'Change number'}
      onBack={() => (stage === 'number' ? go('mfa-setup') : setStage('number'))}
    >
      {stage === 'number' ? (
        <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Mobile number</label>
            <LoginInput icon="phone" type="tel" placeholder="+44 7700 900000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" autoFocus />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 7 }}>Include your country code. Standard message rates apply.</div>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="warnTri" size={16} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>SMS is the weakest factor your policy allows. Consider a <span className="link" onClick={() => go('mfa-webauthn')}>passkey</span> instead.</div>
          </div>
          <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading}>
            {loading ? <Spinner /> : <>Send code<Icon name="arrowRight" size={15} /></>}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>6-digit code</label>
            <OtpInput value={code} onChange={(v) => { setCode(v); setInvalid(false) }} onComplete={(v) => verify(v)} invalid={invalid} />
            {invalid && <div style={{ fontSize: '11.75px', color: 'var(--bad)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="warnTri" size={12} />That code didn’t match.</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <ResendTimer seconds={30} onResend={() => toast('ok', 'Code resent', `A new code was sent to ${phone} (demo).`)} />
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
