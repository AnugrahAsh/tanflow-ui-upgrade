import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, LoginCheck, Spinner, OtpInput, ResendTimer } from '../components/LoginKit.jsx'

const POINTS = [
  ['fingerprint', 'Phishing-resistant first', 'Passkeys and security keys cannot be replayed or relayed.'],
  ['ban', 'Fatigue protection', 'Repeated pushes are throttled and flagged to the SOC.'],
  ['monitor', 'Device-bound trust', 'Remembering a device records it against your identity.'],
]

// Enrolled factors for this identity, in policy-preferred order.
const METHODS = [
  { id: 'totp', icon: 'phone', name: 'Authenticator app', hint: 'Tanflow Authenticator · 6-digit code', badge: 'Strong' },
  { id: 'passkey', icon: 'fingerprint', name: 'Security key or passkey', hint: 'Touch ID, Windows Hello or a hardware key', badge: 'Phishing-resistant' },
  { id: 'push', icon: 'bell', name: 'Push with number match', hint: 'Approve on iPhone 15 · Meridian', badge: 'Strong' },
  { id: 'sms', icon: 'chat', name: 'Text message', hint: 'SMS to ••• ••• 4417', badge: 'Basic' },
  { id: 'email', icon: 'mail', name: 'Email one-time code', hint: 't•••••••@meridianbank.com', badge: 'Basic' },
  { id: 'backup', icon: 'key2', name: 'Backup code', hint: 'Use one of your 10 recovery codes', badge: 'Recovery' },
]
const BADGE_TONE = {
  'Phishing-resistant': { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' },
  Strong: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' },
  Basic: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
  Recovery: { c: 'var(--mut)', bg: 'var(--surface-3)', b: 'var(--line)' },
}
const Badge = ({ text }) => {
  const t = BADGE_TONE[text]
  return <span style={{ fontSize: '10.25px', fontWeight: 700, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-xs)', padding: '2px 6px', whiteSpace: 'nowrap' }}>{text}</span>
}

export default function MfaVerify() {
  const { go, toast } = useApp()
  const [method, setMethod] = useState('totp')
  const [chooser, setChooser] = useState(false)
  const [code, setCode] = useState('')
  const [backup, setBackup] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [left, setLeft] = useState(5) // attempts before the challenge burns
  const active = METHODS.find((m) => m.id === method)

  // Passkey + push wait for the authenticator rather than a typed code.
  const waiting = method === 'passkey' || method === 'push'
  useEffect(() => { setCode(''); setBackup(''); setInvalid(false) }, [method])

  const succeed = () => { setLoading(true); setTimeout(() => go('overview'), 700) }
  const verify = (val) => {
    const entered = val ?? (method === 'backup' ? backup : code)
    if (method === 'backup' ? entered.trim().length < 8 : entered.length < 6) {
      toast('warn', 'Code incomplete', method === 'backup' ? 'Backup codes are 8 characters.' : 'Enter all 6 digits.'); return
    }
    // Demo: 000000 is treated as the wrong code so the error state is reachable.
    if (entered === '000000') {
      setInvalid(true); setLeft((n) => Math.max(0, n - 1)); setCode('')
      toast('warn', 'Incorrect code', `That code did not match. ${left - 1} attempt${left - 1 === 1 ? '' : 's'} left.`); return
    }
    succeed()
  }

  const methodPanel = (
    <>
      {waiting ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {method === 'push' ? (
            <div style={{ textAlign: 'center', padding: '22px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface-2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>Tap this number on your phone</div>
              <div style={{ fontSize: 46, fontWeight: 780, letterSpacing: '.04em', color: 'var(--accent)', fontFamily: 'var(--mono)', margin: '10px 0 4px' }}>42</div>
              <div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Sent to iPhone 15 · Meridian</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '26px 16px', border: '1px solid var(--line)', borderRadius: 'var(--r)', background: 'var(--surface-2)' }}>
              <Icon name="fingerprint" size={34} style={{ color: 'var(--accent)' }} />
              <div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)', marginTop: 10 }}>Waiting for your authenticator</div>
              <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 4, lineHeight: 1.5 }}>Follow the prompt from your browser — Touch ID, Windows Hello, a phone or a security key.</div>
            </div>
          )}
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading} onClick={succeed}>
            {loading ? <Spinner /> : method === 'push' ? <>I approved it<Icon name="arrowRight" size={15} /></> : <><Icon name="fingerprint" size={15} />Use authenticator</>}
          </button>
        </div>
      ) : method === 'backup' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Backup code</label>
            <LoginInput icon="key2" placeholder="XXXX-XXXX" value={backup} onChange={(e) => setBackup(e.target.value.toUpperCase())} autoFocus style={{ fontFamily: 'var(--mono)' }} />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 7 }}>Each backup code works once. Using one marks it spent.</div>
          </div>
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading} onClick={() => verify()}>
            {loading ? <Spinner /> : <>Verify<Icon name="arrowRight" size={15} /></>}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>
              {method === 'totp' ? 'Code from your authenticator app' : method === 'sms' ? 'Code sent by text message' : 'Code sent to your email'}
            </label>
            <OtpInput value={code} onChange={(v) => { setCode(v); setInvalid(false) }} onComplete={(v) => verify(v)} invalid={invalid} />
            {invalid && (
              <div style={{ fontSize: '11.75px', color: 'var(--bad)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="warnTri" size={12} />Incorrect code — {left} attempt{left === 1 ? '' : 's'} remaining before this challenge is locked.
              </div>
            )}
          </div>
          {(method === 'sms' || method === 'email') && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <ResendTimer seconds={30} onResend={() => toast('ok', 'Code resent', `A new code was sent (demo).`)} />
              <span style={{ fontSize: '12px', color: 'var(--faint)' }}>Codes expire in 5 minutes</span>
            </div>
          )}
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading} onClick={() => verify()}>
            {loading ? <Spinner /> : <>Verify and continue<Icon name="arrowRight" size={15} /></>}
          </button>
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)', marginTop: 16 }}>
        <LoginCheck on={remember} onClick={() => setRemember((v) => !v)} />Trust this device for 30 days
      </label>

      <button type="button" className="btn btn-sec" style={{ height: 42, fontSize: '13.5px', justifyContent: 'center', width: '100%', marginTop: 16 }} onClick={() => setChooser(true)}>
        <Icon name="refresh" size={15} />Use another method
      </button>
    </>
  )

  const chooserPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {METHODS.map((m) => {
        const on = m.id === method
        return (
          <button key={m.id} onClick={() => { setMethod(m.id); setChooser(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 13px', borderRadius: 'var(--r-sm)', background: on ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`, cursor: 'pointer' }}>
            <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: on ? 'var(--surface)' : 'var(--surface-2)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={m.icon} size={16} style={{ color: on ? 'var(--accent)' : 'var(--mut)' }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: '13.25px', fontWeight: 650, color: 'var(--ink)' }}>{m.name}</span><Badge text={m.badge} />
              </span>
              <span style={{ display: 'block', fontSize: '11.75px', color: 'var(--mut)', marginTop: 2 }}>{m.hint}</span>
            </span>
            {on && <Icon name="check" size={16} style={{ color: 'var(--accent)', flex: 'none' }} />}
          </button>
        )
      })}
    </div>
  )

  return (
    <AuthShell
      heading={<>One more step<br />to prove it’s you.</>}
      headingSub="Your password was accepted. Tanflow now needs a second factor before the session is issued."
      aside={<AuthPoints items={POINTS} />}
      step="Step 2 of 2"
      icon={chooser ? 'mfa' : active.icon}
      title={chooser ? 'Choose a verification method' : 'Two-factor verification'}
      sub={chooser
        ? 'Pick any factor enrolled to your account.'
        : <>{active.hint} · signing in as <b style={{ color: 'var(--ink)' }}>tribhuwan.rao@meridianbank.com</b></>}
      back={chooser ? 'Back to verification' : 'Cancel and sign out'}
      onBack={() => (chooser ? setChooser(false) : go('login1'))}
      foot={chooser ? undefined : <>Lost every factor? <span className="link">Contact your administrator</span> for an identity-verified reset.</>}
    >
      {chooser ? chooserPanel : methodPanel}
    </AuthShell>
  )
}
