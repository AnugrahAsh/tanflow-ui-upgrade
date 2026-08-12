import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, Spinner, LoginShell } from '../components/LoginKit.jsx'
import AuroraPleatsGL from '../components/AuroraPleatsGL.jsx'

/* Login variant 6 — full-bleed animated aurora with a single centred card.
   No brand panel: the artwork is the page, the card is just the sign-in. */

export default function Login6() {
  const { toast } = useApp()
  const f = useLoginForm()

  return (
    <LoginShell style={{ background: '#03102f' }}>
      <AuroraPleatsGL speed={1.9} style={{ position: 'fixed' }} />
      {/* Slight darkening so the white card reads cleanly at any light phase. */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(3,12,44,.35) 0%, rgba(2,8,30,.62) 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div
          className="card"
          style={{
            width: '100%', maxWidth: 412, background: 'var(--surface)', borderColor: 'rgba(255,255,255,.5)',
            boxShadow: '0 30px 80px -20px rgba(2,8,30,.6), 0 8px 24px -8px rgba(2,8,30,.4)',
            padding: 'clamp(28px, 4vw, 40px)', animation: 'loginRise .4s ease-out',
          }}
        >
          <form onSubmit={f.submit}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Logo height={30} /></div>

            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 15 }}>
              <button type="button" className="btn btn-sec" style={{ height: 44, fontSize: '13.5px', justifyContent: 'center', width: '100%' }} onClick={() => f.sso('SAML')}>
                <Icon name="sso" size={16} />Continue with single sign-on
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '3px 0', color: 'var(--faint)', fontSize: '12px' }}>
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />or use your password<span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email <span style={{ color: 'var(--bad)' }}>*</span></label>
                <LoginInput type="email" placeholder="name@company.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Password <span style={{ color: 'var(--bad)' }}>*</span></label>
                <LoginInput type={f.show ? 'text' : 'password'} value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn show={f.show} onClick={() => f.setShow((s) => !s)} />} />
                <div style={{ textAlign: 'right', marginTop: 8 }}><span className="link" style={{ fontSize: '12.5px' }} onClick={f.forgot}>Forgot password?</span></div>
              </div>

              <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', marginTop: 2 }} disabled={f.loading}>
                {f.loading ? <Spinner /> : 'Sign in'}
              </button>
            </div>

            <div style={{ fontSize: '12.75px', color: 'var(--mut)', marginTop: 18, textAlign: 'center' }}>
              Don’t have an account? <span className="link" onClick={() => toast('ok', 'Account provisioning', 'Accounts are created by your identity team (demo).')}>Create new account</span>
            </div>
          </form>
        </div>
      </div>
    </LoginShell>
  )
}
