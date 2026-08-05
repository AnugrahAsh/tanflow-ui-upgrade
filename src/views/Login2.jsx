import Icon from '../components/Icon.jsx'
import { useLoginForm, BrandBadge, LoginInput, EyeBtn, LoginCheck, Spinner, LoginShell } from '../components/LoginKit.jsx'

const SSO = [['Okta', 'sso'], ['Azure AD', 'windows'], ['Google', 'globe']]

export default function Login2() {
  const f = useLoginForm()
  return (
    <LoginShell style={{ background: '#0B1224', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Mesh background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-14%', left: '-8%', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,98,254,.5), transparent 62%)', filter: 'blur(20px)', animation: 'loginFloat 13s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-6%', width: 660, height: 660, borderRadius: '50%', background: 'radial-gradient(circle, rgba(105,65,198,.45), transparent 64%)', filter: 'blur(20px)', animation: 'loginFloat 17s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
      </div>

      <form onSubmit={f.submit} style={{ position: 'relative', width: '100%', maxWidth: 424, background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)', boxShadow: '0 24px 70px -20px rgba(4,10,30,.6)', padding: 'clamp(28px, 4vw, 40px)', animation: 'loginRise .45s ease-out' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <BrandBadge size={52} radius="var(--r)" style={{ boxShadow: '0 8px 22px -8px rgba(15,98,254,.5)' }} />
          <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)', marginTop: 16 }}>Sign in to Tanflow</div>
          <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 4 }}>Identity Security Cloud · Meridian Global Bank</div>
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <LoginInput icon="mail" type="email" placeholder="Work email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
          <LoginInput icon="lock" type={f.show ? 'text' : 'password'} placeholder="Password" value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn show={f.show} onClick={() => f.setShow((s) => !s)} />} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '12.5px', color: 'var(--ink-2)' }}><LoginCheck on={f.remember} onClick={() => f.setRemember((v) => !v)} />Remember me</label>
            <span className="link" style={{ fontSize: '12.5px' }} onClick={f.forgot}>Forgot password?</span>
          </div>
          <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={f.loading}>{f.loading ? <Spinner /> : 'Sign in'}</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 18px', color: 'var(--faint)', fontSize: '11px', fontWeight: 600 }}><span style={{ flex: 1, height: 1, background: 'var(--line)' }} />OR CONTINUE WITH<span style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {SSO.map(([name, ic]) => (
            <button key={name} type="button" onClick={() => f.sso(name)} style={{ height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--surface)', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', transition: 'all .12s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-line)'; e.currentTarget.style.background = 'var(--accent-bg)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'var(--surface)' }}><Icon name={ic} size={15} style={{ color: 'var(--mut)' }} />{name}</button>
          ))}
        </div>
        <div style={{ fontSize: '11.75px', color: 'var(--faint)', marginTop: 24, textAlign: 'center', lineHeight: 1.6 }}>By continuing you agree to the <span className="link" style={{ color: 'var(--faint)' }}>Terms</span> & <span className="link" style={{ color: 'var(--faint)' }}>Privacy Policy</span>.</div>
      </form>
    </LoginShell>
  )
}
