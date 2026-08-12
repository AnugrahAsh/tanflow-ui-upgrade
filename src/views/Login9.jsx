import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { LOCK_SECONDS, MAX_ATTEMPTS } from '../components/login/authModel.js'

/* The plain sign-in page on a white field (/login9).

   Identical to Login8 — same panel, same wordmark, same form — with the navy
   backdrop swapped for plain white. It reuses the .l8-* styles and adds .l9 to
   the root, so the two pages cannot drift apart on anything but the backdrop.

   Demo shortcut: any password of 4+ characters signs in. */

const YEAR = 2026

export default function Login9() {
  const { go, toast } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [caps, setCaps] = useState(false)
  const [touched, setTouched] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockLeft, setLockLeft] = useState(0)

  useEffect(() => {
    if (lockLeft <= 0) return undefined
    const t = setInterval(() => setLockLeft((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [lockLeft])

  const userErr = touched && !username.trim() ? 'Enter your username.' : ''
  const passErr = touched && !password ? 'Enter your password.' : ''

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
      toast('ok', 'Signed in', `Welcome back, ${username.trim()}.`)
      go('overview')
    }, 280)
  }

  return (
    <div className="l8 l9">
      <main className="l8-in">
        <form className="l8-card" onSubmit={signIn} noValidate>
          <div className="l8-body">
            <span className="l8-mark-box">
              <img className="l8-mark" src="assets/brand/logo-color.png" alt="Tanflow" />
            </span>

            <div className="l8-head">
              <h1 className="l8-h">Sign in</h1>
              <p className="l8-sub">Use your Tanflow account to continue.</p>
            </div>

            {lockLeft > 0 && (
              <div className="lg-banner" data-tone="bad">
                <Icon name="warnTri" size={13} />
                <span>Too many failed attempts. Try again in {lockLeft}s.</span>
              </div>
            )}
            {lockLeft === 0 && attempts > 0 && (
              <div className="lg-banner" data-tone="warn">
                <Icon name="warnTri" size={13} />
                <span>
                  That username or password was not recognized. {MAX_ATTEMPTS - attempts}{' '}
                  {MAX_ATTEMPTS - attempts === 1 ? 'attempt' : 'attempts'} left.
                </span>
              </div>
            )}

            <div className="field">
              <label htmlFor="l9-user">Username<span className="lg-req"> *</span></label>
              <input
                id="l9-user"
                className="inp"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              {userErr && <span className="lg-err"><Icon name="warnTri" size={11} />{userErr}</span>}
            </div>

            <div className="field">
              <label htmlFor="l9-pass">Password<span className="lg-req"> *</span></label>
              <span className="lg-pw">
                <input
                  id="l9-pass"
                  className="inp"
                  type={reveal ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
                />
                <button type="button" className="lg-eye" onClick={() => setReveal((v) => !v)} aria-label={reveal ? 'Hide password' : 'Show password'}>
                  <Icon name={reveal ? 'eyeOff' : 'eye'} size={15} />
                </button>
              </span>
              {passErr ? <span className="lg-err"><Icon name="warnTri" size={11} />{passErr}</span>
                : caps ? <span className="f-help">Caps Lock is on.</span> : null}
            </div>

            <div className="l8-row">
              <label className="lg-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember this device</span>
              </label>
              <button type="button" className="link" onClick={() => go('forgot-password')}>Forgot Password?</button>
            </div>

            <button type="submit" className="btn btn-pri l8-submit" disabled={busy || lockLeft > 0}>
              {lockLeft > 0 ? `Locked · ${lockLeft}s` : busy ? 'Signing in…' : 'Login'}
            </button>
          </div>
        </form>

        <p className="l8-copy">Sign-in attempts are recorded · ©{YEAR} Tanflow</p>
      </main>
    </div>
  )
}
