import Icon from '../components/Icon.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, LoginCheck, Spinner, LoginShell } from '../components/LoginKit.jsx'

const POINTS = ['Privileged access, zero standing privilege', 'Every session recorded end-to-end', 'Passwordless, phishing-resistant sign-in']

export default function Login5() {
  const f = useLoginForm()
  return (
    <LoginShell style={{ background: '#EAEEF4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#C6D2E6 1.1px, transparent 1.1px)', backgroundSize: '22px 22px', opacity: .6, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 900, minHeight: 540, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--line)', boxShadow: '0 30px 80px -28px rgba(17,24,39,.4)', overflow: 'hidden', display: 'flex', animation: 'loginRise .45s ease-out' }}>
        {/* Colored testimonial panel */}
        <div style={{ flex: '1', minWidth: 0, position: 'relative', overflow: 'hidden', background: 'linear-gradient(158deg, #0F2A6B 0%, #123B8F 46%, #3457C4 100%)', color: '#EAF0FB', padding: 'clamp(30px, 3.4vw, 46px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', bottom: -120, left: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,160,255,.35), transparent 66%)', filter: 'blur(10px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}><Logo variant="white" height={26} /></div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', fontWeight: 740, lineHeight: 1.18, letterSpacing: '-.02em' }}>Welcome back.</div>
            <div style={{ fontSize: '13.5px', color: '#AEC0E4', marginTop: 10, lineHeight: 1.6, maxWidth: 320 }}>Pick up right where you left off across your identity and privileged-access estate.</div>
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {POINTS.map((p) => (
                <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '13px', color: '#DCE6F8' }}><span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(120,160,255,.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="check" size={12} style={{ color: '#9FC0FF' }} /></span>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,.14)', paddingTop: 18 }}>
            <div style={{ fontSize: '13.5px', fontStyle: 'italic', color: '#DCE6F8', lineHeight: 1.55 }}>“Tanflow cut our privileged-access risk by 92% in one quarter.”</div>
            <div style={{ fontSize: '11.5px', color: '#8CA2CC', marginTop: 8 }}>CISO · Meridian Global Bank</div>
          </div>
        </div>

        {/* Form panel */}
        <div style={{ flex: '0 0 clamp(320px, 44%, 400px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(30px, 3.4vw, 44px)' }}>
          <form onSubmit={f.submit} style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ fontSize: 21, fontWeight: 760, letterSpacing: '-.02em', color: 'var(--ink)' }}>Sign in to your workspace</div>
            <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 5 }}>Enter your details to continue.</div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <LoginInput icon="mail" type="email" placeholder="Work email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
              <LoginInput icon="lock" type={f.show ? 'text' : 'password'} placeholder="Password" value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn show={f.show} onClick={() => f.setShow((s) => !s)} />} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '12.5px', color: 'var(--ink-2)' }}><LoginCheck on={f.remember} onClick={() => f.setRemember((v) => !v)} />Remember me</label>
                <span className="link" style={{ fontSize: '12.5px' }} onClick={f.forgot}>Forgot?</span>
              </div>
              <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={f.loading}>{f.loading ? <Spinner /> : <>Sign in<Icon name="arrowRight" size={15} /></>}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--faint)', fontSize: '11px', fontWeight: 600 }}><span style={{ flex: 1, height: 1, background: 'var(--line)' }} />OR<span style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
            <button type="button" className="btn btn-sec" style={{ height: 44, fontSize: '13px', justifyContent: 'center', width: '100%' }} onClick={() => f.sso('SAML')}><Icon name="sso" size={15} />Continue with SSO</button>
            <div style={{ fontSize: '11.75px', color: 'var(--faint)', marginTop: 22, textAlign: 'center' }}>Secured by Tanflow adaptive access.</div>
          </form>
        </div>
      </div>
    </LoginShell>
  )
}
