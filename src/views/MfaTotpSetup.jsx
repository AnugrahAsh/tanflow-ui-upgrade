import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, Spinner, OtpInput } from '../components/LoginKit.jsx'

const POINTS = [
  ['phone', 'Any TOTP app works', 'Tanflow Authenticator, Google Authenticator, Authy, 1Password.'],
  ['clock', 'Codes rotate every 30s', 'We accept one step either side for clock drift.'],
  ['lock', 'The secret never leaves', 'It is stored encrypted and shown only during enrolment.'],
]
const SECRET = 'JBSW Y3DP EHPK 3PXP MFA7 TANF'

// Deterministic decorative QR — a real one would be rendered from the otpauth URI.
const MODULES = 25
const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= MODULES - 7) || (r >= MODULES - 7 && c < 7)
const cell = (r, c) => {
  if (isFinder(r, c)) {
    // Finder squares: 7×7 ring with a 3×3 solid core.
    const R = r < 7 ? r : r - (MODULES - 7)
    const C = c < 7 ? c : c - (MODULES - 7)
    const ring = R === 0 || R === 6 || C === 0 || C === 6
    const core = R >= 2 && R <= 4 && C >= 2 && C <= 4
    return ring || core
  }
  return ((r * 7 + c * 13 + ((r * c) % 5)) % 3) === 0
}

export default function MfaTotpSetup() {
  const { go, toast } = useApp()
  const [showSecret, setShowSecret] = useState(false)
  const [code, setCode] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  const verify = (val) => {
    const entered = val ?? code
    if (entered.length < 6) { toast('warn', 'Code incomplete', 'Enter all 6 digits from your authenticator.'); return }
    if (entered === '000000') { setInvalid(true); setCode(''); toast('warn', 'Incorrect code', 'That code did not match — check your device clock.'); return }
    setLoading(true)
    setTimeout(() => { toast('ok', 'Authenticator enrolled', 'TOTP is now active on your account (demo).'); go('mfa-backup-codes') }, 700)
  }

  return (
    <AuthShell
      heading={<>Scan once,<br />sign in forever.</>}
      headingSub="Your authenticator generates a fresh code every 30 seconds — no network needed."
      aside={<AuthPoints items={POINTS} />}
      step="Step 2 of 3"
      icon="phone"
      title="Set up your authenticator app"
      sub="Scan this QR code with your authenticator, then enter the 6-digit code it shows."
      back="Choose another method"
      onBack={() => go('mfa-setup')}
      width={430}
    >
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* QR */}
        <div style={{ padding: 12, background: '#fff', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', flex: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MODULES}, 1fr)`, width: 160, height: 160 }}>
            {Array.from({ length: MODULES * MODULES }).map((_, i) => {
              const r = Math.floor(i / MODULES), c = i % MODULES
              return <span key={i} style={{ background: cell(r, c) ? '#111827' : 'transparent' }} />
            })}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }}>Can’t scan?</div>
          <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 5, lineHeight: 1.5 }}>Enter this setup key manually in your app.</div>
          <div style={{ marginTop: 10, padding: '9px 11px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--mono)', fontSize: '11.75px', letterSpacing: '.04em', color: 'var(--ink)', wordBreak: 'break-all' }}>
            {showSecret ? SECRET : '•••• •••• •••• •••• •••• ••••'}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 9 }}>
            <span className="link" style={{ fontSize: '12px' }} onClick={() => setShowSecret((s) => !s)}>{showSecret ? 'Hide key' : 'Show key'}</span>
            <span className="link" style={{ fontSize: '12px' }} onClick={() => toast('ok', 'Copied', 'Setup key copied to your clipboard (demo).')}>Copy key</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: 10, lineHeight: 1.5 }}>Issuer <b style={{ color: 'var(--ink-2)' }}>Tanflow</b> · account tribhuwan.rao</div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Enter the 6-digit code</label>
        <OtpInput value={code} onChange={(v) => { setCode(v); setInvalid(false) }} onComplete={(v) => verify(v)} invalid={invalid} autoFocus={false} />
        {invalid && <div style={{ fontSize: '11.75px', color: 'var(--bad)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="warnTri" size={12} />That code didn’t match. Codes rotate every 30 seconds.</div>}
      </div>

      <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', marginTop: 16 }} disabled={loading} onClick={() => verify()}>
        {loading ? <Spinner /> : <>Verify and continue<Icon name="arrowRight" size={15} /></>}
      </button>
    </AuthShell>
  )
}
