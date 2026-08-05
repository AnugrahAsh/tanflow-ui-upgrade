import Icon from '../components/Icon.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, LoginCheck, Spinner, LoginShell } from '../components/LoginKit.jsx'

const FEATURES = [
  ['shieldCheck', 'Phishing-resistant MFA & passkeys', 'FIDO2 first, with policy-driven step-up.'],
  ['jit', 'Just-in-time privileged access', 'Zero standing privilege, time-boxed by ticket.'],
  ['recordings', 'Full session recording & command control', 'Every keystroke captured, first-match-wins rules.'],
]

export default function Login1() {
  const f = useLoginForm('tribhuwan.rao@meridianbank.com')
  return (
    <LoginShell style={{ display: 'flex', background: 'var(--surface)' }}>
      {/* Brand panel */}
      <div style={{ flex: '1.15', minWidth: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #0A1120 0%, #101B30 52%, #16305C 100%)', color: '#EAF0FB', padding: 'clamp(40px, 5vw, 72px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -160, right: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,.42), transparent 68%)', filter: 'blur(12px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(circle at 30% 40%, #000, transparent 78%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}><Logo variant="white" height={30} /></div>
        <div style={{ position: 'relative', maxWidth: 520 }}>
          <div style={{ fontSize: 'clamp(30px, 3.4vw, 46px)', fontWeight: 780, lineHeight: 1.08, letterSpacing: '-.025em' }}>Secure every identity.<br />Govern every session.</div>
          <div style={{ fontSize: '14.5px', color: '#9FB2D4', marginTop: 18, lineHeight: 1.6, maxWidth: 440 }}>The identity security cloud trusted to protect privileged access across the world's most regulated enterprises.</div>
          <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map(([ic, t, s]) => (
              <div key={t} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'rgba(91,141,239,.16)', border: '1px solid rgba(91,141,239,.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={17} style={{ color: '#8AB0F5' }} /></span>
                <div><div style={{ fontSize: '14px', fontWeight: 650 }}>{t}</div><div style={{ fontSize: '12.5px', color: '#8496B8', marginTop: 2 }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: '#7488AC', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D07F', boxShadow: '0 0 0 3px rgba(52,208,127,.2)' }} />All systems operational</span>
          <span style={{ opacity: .4 }}>·</span><span>SOC 2 Type II</span><span style={{ opacity: .4 }}>·</span><span>ISO 27001</span><span style={{ opacity: .4 }}>·</span><span>FIDO2 Certified</span>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ flex: '0 0 clamp(400px, 38%, 500px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <form onSubmit={f.submit} style={{ width: '100%', maxWidth: 372, animation: 'loginRise .4s ease-out' }}>
          <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>Sign in</div>
          <div style={{ fontSize: '13.5px', color: 'var(--mut)', marginTop: 5 }}>Welcome back to Tanflow Identity Cloud.</div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Work email</label>
              <LoginInput icon="mail" type="email" placeholder="you@company.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' }}>Password</label>
                <span className="link" style={{ fontSize: '12px' }} onClick={f.forgot}>Forgot password?</span>
              </div>
              <LoginInput icon="lock" type={f.show ? 'text' : 'password'} placeholder="••••••••••" value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn show={f.show} onClick={() => f.setShow((s) => !s)} />} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' }}><LoginCheck on={f.remember} onClick={() => f.setRemember((v) => !v)} />Keep me signed in on this device</label>
            <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={f.loading}>{f.loading ? <Spinner /> : <>Sign in<Icon name="arrowRight" size={15} /></>}</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0', color: 'var(--faint)', fontSize: '11.5px', fontWeight: 600 }}><span style={{ flex: 1, height: 1, background: 'var(--line)' }} />OR<span style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
          <button type="button" className="btn btn-sec" style={{ height: 44, fontSize: '13.5px', justifyContent: 'center', width: '100%' }} onClick={() => f.sso('SAML')}><Icon name="sso" size={16} />Continue with single sign-on</button>

          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 26, textAlign: 'center', lineHeight: 1.6 }}>Trouble signing in? <span className="link">Contact your administrator</span><br /><span style={{ color: 'var(--faint)' }}>Protected by Tanflow adaptive access · </span><span className="link" style={{ color: 'var(--faint)' }}>Privacy</span></div>
        </form>
      </div>
    </LoginShell>
  )
}
