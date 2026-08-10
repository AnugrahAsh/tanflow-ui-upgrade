import { useState, useRef, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

// Shared login behaviour + primitives used across the login1…login5 designs.
// Submitting or choosing an SSO provider drops the user into the console (demo).
export function useLoginForm(defaultEmail = '') {
  const { go, toast } = useApp()
  const [email, setEmail] = useState(defaultEmail)
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  const enter = (to = 'overview') => { setLoading(true); setTimeout(() => go(to), 650) }
  // Password sign-in hands off to the second factor; SSO and passkey are already
  // phishing-resistant, so they drop straight into the console.
  const submit = (e) => {
    e?.preventDefault?.()
    if (loading) return
    if (!email.trim() || !pw) { toast('warn', 'Missing credentials', 'Enter your email and password to continue (demo).'); return }
    enter('mfa-verify')
  }
  const sso = (provider) => { if (loading) return; toast('ok', `${provider} SSO`, `Redirecting to ${provider} to authenticate (demo).`); enter() }
  const passkey = () => { if (loading) return; toast('ok', 'Passkey', 'Waiting for your authenticator — Touch ID, Windows Hello or a security key (demo).'); enter() }
  const forgot = () => go('forgot-password')

  return { email, setEmail, pw, setPw, show, setShow, remember, setRemember, loading, submit, sso, passkey, forgot }
}

export function Logo({ variant = 'color', height = 30, style }) {
  const src = variant === 'white' ? 'assets/brand/tanflow-logo-1200w-white.png' : 'assets/brand/tanflow-logo-1200w.png'
  return <img src={src} alt="Tanflow" style={{ height, width: 'auto', display: 'block', ...style }} />
}

export function BrandBadge({ size = 44, radius = 'var(--r)', style }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none', ...style }}>
      <img src="assets/brand/tanflow-icon.svg" alt="Tanflow" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </span>
  )
}

export function Spinner({ color = '#fff', size = 16 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${color}`, borderTopColor: 'transparent', display: 'inline-block', animation: 'spin .6s linear infinite' }} />
}

// Themeable text/password input with a leading icon and optional trailing slot.
export function LoginInput({ icon, dark, rightSlot, style, ...props }) {
  const [foc, setFoc] = useState(false)
  const c = dark
    ? { bg: 'rgba(255,255,255,.05)', border: foc ? '#5B8DEF' : 'rgba(255,255,255,.15)', ink: '#EAF0FB', ic: foc ? '#8AB0F5' : '#7C8AA5', ring: '0 0 0 3px rgba(91,141,239,.22)' }
    : { bg: 'var(--surface)', border: foc ? 'var(--accent)' : 'var(--line-2)', ink: 'var(--ink)', ic: foc ? 'var(--accent)' : 'var(--faint)', ring: 'var(--sh-focus)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 13px', borderRadius: 'var(--r-sm)', background: c.bg, border: `1px solid ${c.border}`, boxShadow: foc ? c.ring : 'none', transition: 'border-color .12s, box-shadow .12s', ...style }}>
      {icon && <Icon name={icon} size={16} style={{ color: c.ic, flex: 'none' }} />}
      <input {...props} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, color: c.ink }} />
      {rightSlot}
    </div>
  )
}

export function EyeBtn({ show, onClick, dark }) {
  return <button type="button" onClick={onClick} aria-label={show ? 'Hide password' : 'Show password'} style={{ display: 'inline-flex', alignItems: 'center', color: dark ? '#7C8AA5' : 'var(--faint)', padding: 2 }}><Icon name={show ? 'eyeOff' : 'eye'} size={16} /></button>
}

// Small square checkbox (light + dark).
export function LoginCheck({ on, onClick, dark }) {
  return (
    <span onClick={onClick} role="checkbox" aria-checked={on} style={{ width: 17, height: 17, borderRadius: 'var(--r-xs)', flex: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--accent)' : (dark ? 'rgba(255,255,255,.06)' : 'var(--surface)'), border: `1.5px solid ${on ? 'var(--accent)' : (dark ? 'rgba(255,255,255,.22)' : 'var(--line-2)')}` }}>
      {on && <Icon name="check" size={12} style={{ color: '#fff' }} />}
    </span>
  )
}

// Full-viewport shell so a login route renders without the app chrome.
export function LoginShell({ children, style, className }) {
  return <div className={className} style={{ position: 'fixed', inset: 0, overflowY: 'auto', fontFamily: 'var(--sans)', ...style }}>{children}</div>
}

/* ── Pre-auth shell ─────────────────────────────────────────────────────────
   The split-screen from Login1, generalised so every pre-auth surface
   (recovery, MFA challenge, MFA enrolment, logout notice, guest share) sits on
   one shell. `aside` swaps the marketing column for step-specific context. */

const TRUST = ['SOC 2 Type II', 'ISO 27001', 'FIDO2 Certified']

export function AuthBrandPanel({ heading, sub, aside }) {
  return (
    <div className="auth-brand" style={{ flex: '1.15', minWidth: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0A1120 0%, #101B30 52%, #16305C 100%)', color: '#EAF0FB', padding: 'clamp(40px, 5vw, 72px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'absolute', top: -160, right: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,.42), transparent 68%)', filter: 'blur(12px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(circle at 30% 40%, #000, transparent 78%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}><Logo variant="white" height={30} /></div>
      <div style={{ position: 'relative', maxWidth: 520 }}>
        <div style={{ fontSize: 'clamp(28px, 3.1vw, 42px)', fontWeight: 780, lineHeight: 1.1, letterSpacing: '-.025em' }}>{heading}</div>
        {sub && <div style={{ fontSize: '14.5px', color: '#9FB2D4', marginTop: 18, lineHeight: 1.6, maxWidth: 440 }}>{sub}</div>}
        {aside && <div className="auth-aside" style={{ marginTop: 34 }}>{aside}</div>}
      </div>
      <div className="auth-trust" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: '#7488AC', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D07F', boxShadow: '0 0 0 3px rgba(52,208,127,.2)' }} />All systems operational</span>
        {TRUST.map((t) => <span key={t} style={{ display: 'contents' }}><span style={{ opacity: .4 }}>·</span><span>{t}</span></span>)}
      </div>
    </div>
  )
}

// Bullet list for the brand panel (matches Login1's feature rows).
export function AuthPoints({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {items.map(([ic, t, s]) => (
        <div key={t} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
          <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'rgba(91,141,239,.16)', border: '1px solid rgba(91,141,239,.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={17} style={{ color: '#8AB0F5' }} /></span>
          <div><div style={{ fontSize: '14px', fontWeight: 650 }}>{t}</div><div style={{ fontSize: '12.5px', color: '#8496B8', marginTop: 2 }}>{s}</div></div>
        </div>
      ))}
    </div>
  )
}

export function AuthShell({ heading, headingSub, aside, icon, title, sub, step, back, onBack, children, foot, width = 380 }) {
  return (
    <LoginShell style={{ display: 'flex', background: 'var(--surface)' }} className="auth-split">
      <AuthBrandPanel heading={heading} sub={headingSub} aside={aside} />
      <div className="auth-form" style={{ flex: `0 0 clamp(400px, 40%, 520px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: width, animation: 'loginRise .4s ease-out' }}>
          {back && <div style={{ marginBottom: 18 }}><button type="button" className="btn btn-sec btn-sm" onClick={onBack}><Icon name="arrowLeft" size={14} />{back}</button></div>}
          {step && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>{step}</div>}
          {icon && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ width: 44, height: 44, borderRadius: 'var(--r)', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={21} style={{ color: 'var(--accent)' }} />
              </span>
            </div>
          )}
          <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{title}</div>
          {sub && <div style={{ fontSize: '13.5px', color: 'var(--mut)', marginTop: 6, lineHeight: 1.6 }}>{sub}</div>}
          <div style={{ marginTop: 24 }}>{children}</div>
          {foot && <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 26, textAlign: 'center', lineHeight: 1.6 }}>{foot}</div>}
        </div>
      </div>
    </LoginShell>
  )
}

/* ── One-time-code input ──────────────────────────────────────────────────── */
export function OtpInput({ length = 6, value, onChange, onComplete, invalid, autoFocus = true }) {
  const refs = useRef([])
  useEffect(() => { if (autoFocus) refs.current[0]?.focus() }, [autoFocus])

  const setAt = (i, ch) => {
    const next = (value + '').padEnd(length, ' ').split('')
    next[i] = ch
    const joined = next.join('').replace(/\s+$/, '')
    onChange(joined)
    return joined
  }
  const onKey = (i) => (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (value[i]) setAt(i, '')
      else if (i > 0) { setAt(i - 1, ''); refs.current[i - 1]?.focus() }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
  }
  const onInput = (i) => (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (!digits) return
    if (digits.length > 1) { // paste
      const joined = digits.slice(0, length)
      onChange(joined)
      refs.current[Math.min(joined.length, length - 1)]?.focus()
      if (joined.length === length) onComplete?.(joined)
      return
    }
    const joined = setAt(i, digits)
    if (i < length - 1) refs.current[i + 1]?.focus()
    if (joined.replace(/\s/g, '').length === length) onComplete?.(joined)
  }

  return (
    <div style={{ display: 'flex', gap: 9 }}>
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] || ''
        return (
          <input
            key={i} ref={(el) => { refs.current[i] = el }} value={ch} onChange={onInput(i)} onKeyDown={onKey(i)}
            inputMode="numeric" autoComplete="one-time-code" maxLength={length} aria-label={`Digit ${i + 1}`}
            style={{
              flex: 1, minWidth: 0, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)',
              color: invalid ? 'var(--bad)' : 'var(--ink)', background: 'var(--surface)', outline: 'none',
              border: `1.5px solid ${invalid ? 'var(--bad)' : ch ? 'var(--accent)' : 'var(--line-2)'}`,
              borderRadius: 'var(--r-sm)', transition: 'border-color .12s, box-shadow .12s',
            }}
            onFocus={(e) => { e.target.select(); e.target.style.boxShadow = 'var(--sh-focus)' }}
            onBlur={(e) => { e.target.style.boxShadow = 'none' }}
          />
        )
      })}
    </div>
  )
}

// Countdown "Resend code" control shared by the OTP surfaces.
export function ResendTimer({ seconds = 30, onResend, label = 'Resend code' }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return undefined
    const t = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(t)
  }, [left])
  if (left > 0) return <span style={{ fontSize: '12.5px', color: 'var(--faint)' }}>{label} in {left}s</span>
  return <span className="link" style={{ fontSize: '12.5px' }} onClick={() => { setLeft(seconds); onResend?.() }}>{label}</span>
}

// Password rule meter used by reset + enrolment surfaces.
export const PW_RULES = [
  ['At least 12 characters', (v) => v.length >= 12],
  ['Upper and lower case', (v) => /[a-z]/.test(v) && /[A-Z]/.test(v)],
  ['A number', (v) => /\d/.test(v)],
  ['A symbol', (v) => /[^A-Za-z0-9]/.test(v)],
]
export function PasswordRules({ value }) {
  const passed = PW_RULES.filter(([, fn]) => fn(value)).length
  const pct = (passed / PW_RULES.length) * 100
  const tone = passed <= 1 ? 'var(--bad)' : passed <= 3 ? 'var(--warn-core)' : 'var(--ok)'
  const word = passed <= 1 ? 'Weak' : passed <= 3 ? 'Fair' : 'Strong'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: tone, transition: 'width .18s, background .18s' }} />
        </div>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: value ? tone : 'var(--faint)' }}>{value ? word : '—'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
        {PW_RULES.map(([text, fn]) => {
          const ok = fn(value)
          return (
            <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '11.75px', color: ok ? 'var(--ok)' : 'var(--mut)' }}>
              <Icon name={ok ? 'check' : 'x'} size={12} style={{ color: ok ? 'var(--ok)' : 'var(--faint)', flex: 'none' }} />{text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
