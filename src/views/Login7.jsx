import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, Spinner, LoginShell } from '../components/LoginKit.jsx'
import AuroraPleatsGL from '../components/AuroraPleatsGL.jsx'

/* Login variant 7 — Login6 with the solid card swapped for a frosted glass
   pane. Same geometry and same edges (our `--r` corner, 1px hairline); only
   the surface changes: translucency, a backdrop blur, and a top-edge highlight
   so the pane catches light the way glass does. */

const glass = {
  background: 'rgba(255,255,255,.10)',
  backdropFilter: 'blur(30px) saturate(1.7)',
  WebkitBackdropFilter: 'blur(30px) saturate(1.7)',
  border: '1px solid rgba(255,255,255,.22)',
  borderRadius: 'var(--r)',
  boxShadow: '0 30px 80px -20px rgba(2,8,30,.62), inset 0 1px 0 rgba(255,255,255,.30)',
}
const label = { fontSize: '12.5px', fontWeight: 600, color: 'rgba(234,240,251,.88)', display: 'block', marginBottom: 6 }

export default function Login7() {
  const { toast } = useApp()
  const f = useLoginForm()

  return (
    <LoginShell style={{ background: '#03102f' }}>
      <AuroraPleatsGL speed={1.9} style={{ position: 'fixed' }} />
      {/* Slight darkening so the glass reads as glass and the text stays legible. */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(3,12,44,.30) 0%, rgba(2,8,30,.58) 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 412, padding: 'clamp(28px, 4vw, 40px)', animation: 'loginRise .4s ease-out', ...glass }}>
          <form onSubmit={f.submit}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Logo variant="white" height={30} /></div>

            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 15 }}>
              <button
                type="button"
                onClick={() => f.sso('SAML')}
                className="hrow"
                style={{ height: 44, width: '100%', justifyContent: 'center', gap: 9, fontSize: '13.5px', fontWeight: 600, color: '#EAF0FB', background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.26)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
              >
                <Icon name="sso" size={16} />Continue with single sign-on
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '3px 0', color: 'rgba(234,240,251,.6)', fontSize: '12px' }}>
                <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.2)' }} />or use your password<span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.2)' }} />
              </div>

              <div>
                <label style={label}>Email <span style={{ color: '#FF9AA2' }}>*</span></label>
                <LoginInput dark type="email" placeholder="name@company.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
              </div>

              <div>
                <label style={label}>Password <span style={{ color: '#FF9AA2' }}>*</span></label>
                <LoginInput dark type={f.show ? 'text' : 'password'} value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn dark show={f.show} onClick={() => f.setShow((s) => !s)} />} />
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <span style={{ fontSize: '12.5px', color: '#8AB0F5', cursor: 'pointer', fontWeight: 600 }} onClick={f.forgot}>Forgot password?</span>
                </div>
              </div>

              <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', marginTop: 2, background: "blue", color: "white" }} disabled={f.loading}>
                {f.loading ? <Spinner /> : 'Sign in'}
              </button>
            </div>

            <div style={{ fontSize: '12.75px', color: 'rgba(234,240,251,.66)', marginTop: 18, textAlign: 'center' }}>
              Don’t have an account?{' '}
              <span style={{ color: '#8AB0F5', cursor: 'pointer', fontWeight: 600 }} onClick={() => toast('ok', 'Account provisioning', 'Accounts are created by your identity team (demo).')}>Create new account</span>
            </div>
          </form>
        </div>
      </div>
    </LoginShell>
  )
}
