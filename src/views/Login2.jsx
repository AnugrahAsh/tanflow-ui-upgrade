import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, Spinner, LoginShell } from '../components/LoginKit.jsx'
import WireframeDottedGlobe from '../components/WireframeDottedGlobe.jsx'

/* Login variant 2 — same form as Login1, brand panel backed by the pleated
   aurora artwork instead of the gradient + globe. Swap BG for the .jpg original
   (see public/assets/bg/README.md); nothing else needs to change. */
const BG = '/assets/bg/aurora-pleats.svg'

const PILLARS = [
  ['alerts', 'AUTHENTICATION', 'Phishing-resistant MFA on privileged roles'],
  ['shieldCheck', 'ACCOUNTABILITY', 'Every session written to the audit trail'],
  ['ban', 'NETWORK', 'Restrictions evaluated before access is issued'],
]
const hair = '1px solid rgba(255,255,255,.16)'

export default function Login2() {
  const { toast } = useApp()
  const f = useLoginForm()

  return (
    <LoginShell style={{ display: 'flex', background: 'var(--bg)' }} className="auth-split">
      {/* ── Brand panel — artwork background ────────────────────────────── */}
      <div
        className="auth-brand"
        style={{
          flex: '1.05', minWidth: 0, position: 'relative', overflow: 'hidden',
          backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: '60% 55%', backgroundColor: '#04123F',
          color: '#EAF0FB', padding: 'clamp(40px, 5vw, 76px)', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}
      >
        {/* Legibility scrim — the artwork is bright low-centre, the copy is not. */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(3,10,38,.86) 0%, rgba(4,17,62,.62) 46%, rgba(4,20,74,.28) 100%)', pointerEvents: 'none' }} />

        {/* Rotating globe, anchored bottom-left and cropped by the panel edge — same as Login1. */}
        <WireframeDottedGlobe
          size={680}
          style={{
            position: 'absolute', left: -160, bottom: -175, opacity: .5,
            maskImage: 'radial-gradient(circle at 42% 62%, #000 42%, rgba(0,0,0,.35) 72%, transparent 92%)',
            WebkitMaskImage: 'radial-gradient(circle at 42% 62%, #000 42%, rgba(0,0,0,.35) 72%, transparent 92%)',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 560 }}>
          <div className="hrow" style={{ gap: 18 }}>
            <Logo variant="white" height={28} />
            <span style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,.22)' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', lineHeight: 1.5, color: '#BBD0EE' }}>IDENTITY &amp; ACCESS<br />MANAGEMENT</span>
          </div>

          <div style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 780, lineHeight: 1.12, letterSpacing: '-.028em', marginTop: 'clamp(32px, 5vh, 58px)', textShadow: '0 2px 24px rgba(2,8,30,.5)' }}>
            Privileged access,<br />governed end to end.
          </div>
          <div style={{ fontSize: '14.5px', color: '#C3D6F2', marginTop: 18, lineHeight: 1.6, maxWidth: 430 }}>
            One console for every identity, entitlement and approval across your estate.
          </div>

          <div style={{ marginTop: 'clamp(30px, 5vh, 52px)', borderTop: hair, maxWidth: 570 }}>
            {PILLARS.map(([ic, label, text]) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '22px 150px 1fr', gap: 16, alignItems: 'center', padding: '15px 0', borderBottom: hair }}>
                <Icon name={ic} size={17} style={{ color: '#8FDCFF' }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', color: '#EAF0FB' }}>{label}</span>
                <span style={{ fontSize: '13.25px', color: '#C3D6F2', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form panel — identical to Login1 ────────────────────────────── */}
      <div className="auth-form" style={{ flex: '0 0 clamp(400px, 40%, 520px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <form onSubmit={f.submit} style={{ width: '100%', maxWidth: 372, animation: 'loginRise .4s ease-out' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.11em', color: 'var(--accent)' }}>CONSOLE ACCESS</div>
          <div style={{ fontSize: 26, fontWeight: 750, letterSpacing: '-.022em', color: 'var(--ink)', marginTop: 8 }}>Sign in</div>
          <div style={{ fontSize: '13.5px', color: 'var(--mut)', marginTop: 6 }}>Use your Tanflow account to continue.</div>

          <button type="button" className="btn btn-sec" style={{ height: 44, fontSize: '13.5px', justifyContent: 'center', width: '100%', marginTop: 24, background: 'var(--surface)' }} onClick={() => f.sso('SAML')}>
            <Icon name="sso" size={16} />Continue with single sign-on
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--faint)', fontSize: '12px' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />or use your password<span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email <span style={{ color: 'var(--bad)' }}>*</span></label>
              <LoginInput type="email" placeholder="name@company.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Password <span style={{ color: 'var(--bad)' }}>*</span></label>
              <LoginInput type={f.show ? 'text' : 'password'} value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn show={f.show} onClick={() => f.setShow((s) => !s)} />} />
              <div style={{ textAlign: 'right', marginTop: 8 }}><span className="link" style={{ fontSize: '12.5px' }} onClick={f.forgot}>Forgot password?</span></div>
            </div>
            <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', marginTop: 4 }} disabled={f.loading}>
              {f.loading ? <Spinner /> : 'Sign in'}
            </button>
          </div>

          <div style={{ fontSize: '12.75px', color: 'var(--mut)', marginTop: 18, textAlign: 'center' }}>
            Don’t have an account? <span className="link" onClick={() => toast('ok', 'Account provisioning', 'Accounts are created by your identity team (demo).')}>Create new account</span>
          </div>
        </form>
      </div>
    </LoginShell>
  )
}
