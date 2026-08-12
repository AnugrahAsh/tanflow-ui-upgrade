import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Logo } from '../components/LoginKit.jsx'
import DottedGlobe from '../components/login/DottedGlobe.jsx'
import WaveField from '../components/login/WaveField.jsx'
import {
  DEMO_LAST4, DEMO_OTP, EXPIRY_DAYS, LOCK_SECONDS, MAX_ATTEMPTS, OTP_LENGTH,
  RESEND_SECONDS, RULES, SCORE_LABEL, SCORE_TONE, VERIFY_METHODS, maskEmail, passwordScore,
} from '../components/login/authModel.js'
import { probeDeviceAgent } from '../components/login/deviceAgent.js'
import { useApp } from '../context/AppContext.jsx'

/* The primary sign-in surface (/login).

   One page carries the whole pre-auth flow — sign-in, password-expiry warning,
   OTP challenge, recovery and password reset — because every step shares the
   same artwork and only the card swaps. `step` drives which card renders.

   Demo shortcuts: any password of 4+ characters succeeds, a username of
   "expired" routes through the expiry warning, and the OTP is DEMO_OTP. */

const YEAR = 2026

// Card-local versions of the shared field/banner/meter shapes, so the login
// surface can use its own (taller) input scale without touching the app's.
function Field({ label, required, error, hint, htmlFor, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}{required && <span className="lg-req"> *</span>}</label>
      {children}
      {error ? <span className="lg-err"><Icon name="warnTri" size={11} />{error}</span>
        : hint ? <span className="f-help">{hint}</span> : null}
    </div>
  )
}

function Banner({ tone, children }) {
  const ic = tone === 'bad' || tone === 'warn' ? 'warnTri' : 'info'
  return <div className="lg-banner" data-tone={tone}><Icon name={ic} size={13} /><span>{children}</span></div>
}

export default function Login() {
  const { go, toast } = useApp()
  const [step, setStep] = useState('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [caps, setCaps] = useState(false)
  const [touched, setTouched] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [channel, setChannel] = useState('email')
  const [last4, setLast4] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockLeft, setLockLeft] = useState(0)
  const [resendLeft, setResendLeft] = useState(0)
  const [remember, setRemember] = useState(true)
  const [device, setDevice] = useState(null)
  const [probing, setProbing] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (lockLeft <= 0) return undefined
    const t = setInterval(() => setLockLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [lockLeft])

  useEffect(() => {
    if (resendLeft <= 0) return undefined
    const t = setInterval(() => setResendLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [resendLeft])

  // Each step moves focus to its first input so the flow stays keyboard-only.
  useEffect(() => {
    const root = cardRef.current
    if (!root) return
    const target = root.querySelector('input:not([type="hidden"])') || root.querySelector('h1')
    if (!target) return
    if (target.tagName === 'H1') target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [step])

  const userErr = touched && !username.trim() ? 'Enter your username.' : ''
  const passErr = touched && !password ? 'Enter your password.' : ''
  const score = useMemo(() => passwordScore(next), [next])
  const mismatch = confirm.length > 0 && next !== confirm

  const toStep = (s) => { setStep(s); setTouched(false); setOtp(''); setOtpErr('') }

  const signIn = (e) => {
    if (e) e.preventDefault()
    if (lockLeft > 0) return
    setTouched(true)
    if (!username.trim() || !password) return
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (password.length < 4) {
        const n = attempts + 1
        setAttempts(n)
        if (n >= MAX_ATTEMPTS) { setLockLeft(LOCK_SECONDS); setAttempts(0) }
        return
      }
      setAttempts(0)
      setResendLeft(RESEND_SECONDS)
      toStep(username.trim().toLowerCase() === 'expired' ? 'expiry' : 'otp')
    }, 280)
  }

  const checkDevice = async () => {
    setProbing(true)
    const res = await probeDeviceAgent()
    setProbing(false)
    setDevice(res)
    if (res.ok) toast('ok', 'Device attested', `Device ${String(res.deviceId).slice(0, 12)}… is bound to this account.`)
  }

  const verifyOtp = (value) => {
    const code = typeof value === 'string' ? value : otp
    if (code.length !== OTP_LENGTH) { setOtpErr(`Enter the ${OTP_LENGTH}-digit code.`); return }
    if (code !== DEMO_OTP) { setOtpErr('That code is not valid or has expired.'); return }
    if (step === 'reset-otp') { toStep('reset'); return }
    toast('ok', 'Signed in', `Welcome back, ${username.trim() || 'admin'}.`)
    go('overview')
  }

  const resetDone = () => {
    if (score < 3 || mismatch || !next) return
    toStep('done')
  }

  const otpTarget = channel === 'sms'
    ? 'Enter the 6-digit code sent to your mobile number'
    : 'Enter the 6-digit code sent to your email address'

  const eye = (
    <button type="button" className="lg-eye" onClick={() => setReveal((v) => !v)} aria-label={reveal ? 'Hide password' : 'Show password'}>
      <Icon name={reveal ? 'eyeOff' : 'eye'} size={15} />
    </button>
  )

  const card = () => {
    if (step === 'signin') {
      return (
        <form className="lg-card" onSubmit={signIn} noValidate>
          <header className="lg-card-h">
            <span className="lg-eyebrow">Console access</span>
            <h1 className="lg-h">Welcome</h1>
            <p className="lg-sub">Please sign in to your account to continue.</p>
          </header>

          {lockLeft > 0 && (
            <Banner tone="bad">
              Too many failed attempts. Try again in {lockLeft}s, or reset your password.
            </Banner>
          )}
          {lockLeft === 0 && attempts > 0 && (
            <Banner tone="warn">
              That username or password was not recognized. {MAX_ATTEMPTS - attempts}{' '}
              {MAX_ATTEMPTS - attempts === 1 ? 'attempt' : 'attempts'} left before the account is locked.
            </Banner>
          )}

          <Field label="Username" required error={userErr} htmlFor="lg-user">
            <input
              id="lg-user"
              className="inp"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

          <Field label="Password" required error={passErr} hint={caps ? 'Caps Lock is on.' : undefined} htmlFor="lg-pass">
            <span className="lg-pw">
              <input
                id="lg-pass"
                className="inp"
                type={reveal ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
              />
              {eye}
            </span>
          </Field>

          <div className="lg-row lg-row-split">
            <label className="lg-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember this device</span>
            </label>
            <button type="button" className="link" onClick={() => toStep('forgot')}>Forgot Password?</button>
          </div>

          {remember && (
            <div className="lg-device" data-state={device ? (device.ok ? 'ok' : 'bad') : 'idle'}>
              <Icon name={device ? (device.ok ? 'checkC' : 'warnTri') : 'monitor'} size={13} />
              <span className="lg-device-t">
                {probing
                  ? 'Contacting the IDAM Device Agent…'
                  : device
                    ? (device.ok ? 'Device attested and bound to this sign-in.' : device.reason)
                    : 'Device binding requires the IDAM Device Agent.'}
              </span>
              {!probing && (
                <button type="button" className="link" onClick={checkDevice}>
                  {device ? 'Retry' : 'Check device'}
                </button>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-pri lg-submit" disabled={busy || lockLeft > 0}>
            {lockLeft > 0 ? `Locked · ${lockLeft}s` : busy ? 'Signing in…' : 'Login'}
          </button>
        </form>
      )
    }

    if (step === 'expiry') {
      return (
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); toStep('reset') }} noValidate>
          <header className="lg-card-h">
            <span className="lg-eyebrow">Action required</span>
            <h1 className="lg-h">Your password expires soon</h1>
            <p className="lg-sub">
              This password expires in {EXPIRY_DAYS} days. Set a new one now, or continue and be
              prompted again at the next sign-in.
            </p>
          </header>

          <Banner tone="warn">
            Privileged roles cannot be used once a password has expired. Reset before it lapses to
            avoid losing console access.
          </Banner>

          <button type="submit" className="btn btn-pri lg-submit">Set a new password</button>
          <div className="lg-row lg-row-split">
            <button type="button" className="link" onClick={() => toStep('otp')}>Continue for now</button>
            <button type="button" className="link" onClick={() => toStep('signin')}>Return to login</button>
          </div>
        </form>
      )
    }

    if (step === 'otp' || step === 'reset-otp') {
      return (
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); verifyOtp() }} noValidate>
          <header className="lg-card-h">
            <span className="lg-eyebrow">Step 2 of 2</span>
            <h1 className="lg-h">OTP Verification</h1>
            <p className="lg-sub">{otpTarget}</p>
          </header>

          <Field label="One-time code" required error={otpErr} htmlFor="lg-otp">
            <input
              id="lg-otp"
              className="inp lg-otp mono"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              placeholder="••••••"
              value={otp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)
                setOtp(v)
                setOtpErr('')
                // Auto-submit the moment the code is complete.
                if (v.length === OTP_LENGTH) setTimeout(() => verifyOtp(v), 80)
              }}
            />
          </Field>

          <div className="lg-hintline">
            <Icon name="info" size={12} />
            <span>Sent to {channel === 'sms' ? `••• ••• ${DEMO_LAST4}` : maskEmail(username)}. Demo code {DEMO_OTP}.</span>
          </div>

          <button type="submit" className="btn btn-pri lg-submit">Verify</button>
          <div className="lg-row lg-row-split">
            <button
              type="button"
              className="link"
              disabled={resendLeft > 0}
              onClick={() => { setResendLeft(RESEND_SECONDS); toast('info', 'Code resent', 'A new one-time code has been issued.') }}
            >
              {resendLeft > 0 ? `Resend in ${resendLeft}s` : 'Resend code'}
            </button>
            <button type="button" className="link" onClick={() => toStep('signin')}>Return to login</button>
          </div>
        </form>
      )
    }

    if (step === 'forgot') {
      return (
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); if (username.trim()) toStep(channel === 'sms' ? 'mobile' : 'reset-otp') }} noValidate>
          <header className="lg-card-h">
            <span className="lg-eyebrow">Account recovery</span>
            <h1 className="lg-h">Reset password</h1>
            <p className="lg-sub">Please confirm your username and reset your password.</p>
          </header>

          <Field label="Username" required htmlFor="lg-fuser">
            <input id="lg-fuser" className="inp" placeholder="Please enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>

          <div className="lg-choose">
            <div className="lg-choose-h">How would you like to verify your identity?</div>
            {VERIFY_METHODS.map((v) => (
              <button
                key={v.id}
                type="button"
                className="lg-choice"
                data-on={channel === v.id || undefined}
                onClick={() => setChannel(v.id)}
              >
                <span className="lg-choice-ic"><Icon name={v.icon} size={15} /></span>
                <span className="lg-choice-m">
                  <span className="lg-choice-t">{v.label}</span>
                  <span className="lg-choice-s">{v.hint}</span>
                </span>
                <Icon name={channel === v.id ? 'checkC' : 'chevR'} size={13} />
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-pri lg-submit" disabled={!username.trim()}>Continue</button>
          <div className="lg-row"><button type="button" className="link" onClick={() => toStep('signin')}>Return to login</button></div>
        </form>
      )
    }

    if (step === 'mobile') {
      const verifyLast4 = () => (last4 === DEMO_LAST4 ? toStep('reset-otp') : setOtpErr('Those digits do not match the number on file.'))
      return (
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); verifyLast4() }} noValidate>
          <header className="lg-card-h">
            <span className="lg-eyebrow">Account recovery</span>
            <h1 className="lg-h">Verify mobile number</h1>
            <p className="lg-sub">Enter the last 4 digits of your mobile number:</p>
          </header>

          <Field label="Last 4 digits" required error={otpErr} htmlFor="lg-last4">
            <input
              id="lg-last4"
              className="inp lg-otp mono"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={last4}
              onChange={(e) => { setLast4(e.target.value.replace(/\D/g, '').slice(0, 4)); setOtpErr('') }}
            />
          </Field>

          <div className="lg-hintline">
            <Icon name="info" size={12} />
            <span>Demo number ends {DEMO_LAST4}.</span>
          </div>

          <button type="submit" className="btn btn-pri lg-submit">Verify mobile number</button>
          <div className="lg-row"><button type="button" className="link" onClick={() => toStep('forgot')}>Back</button></div>
        </form>
      )
    }

    if (step === 'reset') {
      return (
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); resetDone() }} noValidate>
          <header className="lg-card-h">
            <span className="lg-eyebrow">Account recovery</span>
            <h1 className="lg-h">Set a new password</h1>
            <p className="lg-sub">Please enter your new password.</p>
          </header>

          <Field label="Enter password" required htmlFor="lg-new">
            <span className="lg-pw">
              <input
                id="lg-new"
                className="inp"
                type={reveal ? 'text' : 'password'}
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
              {eye}
            </span>
          </Field>

          {next && (
            <div className="lg-strength">
              <div className="lg-strength-h">
                <span>Strength</span>
                <span data-tone={SCORE_TONE[score]}>{SCORE_LABEL[score]}</span>
              </div>
              <div className={`meter m-${SCORE_TONE[score]}`}><i style={{ width: `${(score / 4) * 100}%` }} /></div>
              <ul className="lg-rules">
                {RULES.map((r) => (
                  <li key={r.id} data-ok={r.test(next) || undefined}>
                    <Icon name={r.test(next) ? 'checkC' : 'x'} size={11} />{r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Field label="Re-enter password" required error={mismatch ? 'Both passwords must match.' : ''} htmlFor="lg-conf">
            <input
              id="lg-conf"
              className="inp"
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>

          <button type="submit" className="btn btn-pri lg-submit" disabled={score < 3 || mismatch || !confirm}>
            Reset password
          </button>
        </form>
      )
    }

    return (
      <div className="lg-card">
        <div className="lg-done">
          <span className="lg-done-ic"><Icon name="checkC" size={22} /></span>
          <h1 className="lg-h">Success</h1>
          <p className="lg-sub">Your password has been reset successfully. Use the link below to log in.</p>
        </div>
        <button type="button" className="btn btn-pri lg-submit" onClick={() => { setPassword(''); toStep('signin') }}>Log in</button>
      </div>
    )
  }

  return (
    <div className="lg">
      <WaveField />
      <div className="lg-orb" aria-hidden="true">
        <DottedGlobe size={810} />
      </div>

      <section className="lg-art">
        <div className="lg-art-in">
          <header className="lg-lockup">
            <Logo variant="white" height={44} />
            <span className="lg-descriptor">Identity &amp; Access Management</span>
          </header>

          <div className="lg-hero">
            <h2 className="lg-hero-h">Privileged access, governed end to end.</h2>
            <p className="lg-hero-s">
              One console for every identity, entitlement and approval across your estate.
            </p>
          </div>
        </div>
      </section>

      <section className="lg-panel" ref={cardRef} aria-live="polite">{card()}</section>

      <footer className="lg-foot">
        <span className="lg-foot-l">
          <span className="lg-env"><span className="lg-env-dot" />Production</span>
          <span className="lg-foot-sep" />
          <span className="lg-foot-x"><Icon name="lock" size={11} />TLS 1.3</span>
          <span className="lg-foot-sep" />
          <span className="lg-foot-x">Sign-in attempts are recorded</span>
        </span>
        <span className="lg-foot-r">©{YEAR} Tanflow · All rights reserved</span>
      </footer>
    </div>
  )
}
