import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints } from '../components/LoginKit.jsx'

const POINTS = [
  ['shieldCheck', 'Start with the strongest', 'A passkey cannot be phished, relayed or replayed.'],
  ['key2', 'Always keep a fallback', 'Backup codes get you in when a device is lost.'],
  ['users', 'Set by your organisation', 'Meridian Global Bank requires one factor before access.'],
]

const OPTIONS = [
  { id: 'mfa-webauthn', icon: 'fingerprint', name: 'Security key or passkey', desc: 'Touch ID, Windows Hello, a phone or a hardware key.', badge: 'Phishing-resistant', tone: 'ok', rec: true },
  { id: 'mfa-totp', icon: 'phone', name: 'Authenticator app', desc: 'Time-based 6-digit codes from any TOTP app.', badge: 'Strong', tone: 'ok' },
  { id: 'mfa-sms', icon: 'chat', name: 'Text message', desc: 'A one-time code sent to your mobile number.', badge: 'Basic', tone: 'warn' },
  { id: 'mfa-email', icon: 'mail', name: 'Email one-time code', desc: 'A one-time code sent to your registered email.', badge: 'Basic', tone: 'warn' },
]
const TONE = { ok: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' }, warn: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' } }

export default function MfaSetup() {
  const { go } = useApp()
  return (
    <AuthShell
      heading={<>Protect your account<br />in under a minute.</>}
      headingSub="Choose how you'll confirm it's you when signing in. You can add more factors later from your profile."
      aside={<AuthPoints items={POINTS} />}
      step="Step 1 of 3"
      icon="mfa"
      title="Set up two-factor authentication"
      sub="Your organisation requires a second factor. Pick the method you'll use most — we recommend a passkey."
      width={430}
      foot={<>Need help choosing? <span className="link">Read the enrolment guide</span></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map((o) => {
          const t = TONE[o.tone]
          return (
            <button key={o.id} onClick={() => go(o.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 13, width: '100%', textAlign: 'left', padding: '14px', borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: `1px solid ${o.rec ? 'var(--accent)' : 'var(--line-2)'}`, cursor: 'pointer', position: 'relative' }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon name={o.icon} size={18} style={{ color: 'var(--accent)' }} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13.75px', fontWeight: 700, color: 'var(--ink)' }}>{o.name}</span>
                  <span style={{ fontSize: '10.25px', fontWeight: 700, color: t.c, background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-xs)', padding: '2px 6px' }}>{o.badge}</span>
                  {o.rec && <span style={{ fontSize: '10.25px', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-xs)', padding: '2px 6px' }}>Recommended</span>}
                </span>
                <span style={{ display: 'block', fontSize: '12.25px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.5 }}>{o.desc}</span>
              </span>
              <Icon name="chevR" size={16} style={{ color: 'var(--faint)', flex: 'none', marginTop: 10 }} />
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 18, padding: '13px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
        <Icon name="key2" size={16} style={{ color: 'var(--mut)', flex: 'none', marginTop: 1 }} />
        <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
          Whichever you choose, you'll get <b style={{ color: 'var(--ink)' }}>10 backup codes</b> at the end. Store them somewhere safe — they are your way back in if you lose the device.
        </div>
      </div>
    </AuthShell>
  )
}
