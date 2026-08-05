import { useState } from 'react'
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

  const enter = () => { setLoading(true); setTimeout(() => go('overview'), 650) }
  const submit = (e) => {
    e?.preventDefault?.()
    if (loading) return
    if (!email.trim() || !pw) { toast('warn', 'Missing credentials', 'Enter your email and password to continue (demo).'); return }
    enter()
  }
  const sso = (provider) => { if (loading) return; toast('ok', `${provider} SSO`, `Redirecting to ${provider} to authenticate (demo).`); enter() }
  const passkey = () => { if (loading) return; toast('ok', 'Passkey', 'Waiting for your authenticator — Touch ID, Windows Hello or a security key (demo).'); enter() }
  const forgot = () => toast('ok', 'Password reset', 'A reset link would be sent to your registered email (demo).')

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
export function LoginShell({ children, style }) {
  return <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', fontFamily: 'var(--sans)', ...style }}>{children}</div>
}
