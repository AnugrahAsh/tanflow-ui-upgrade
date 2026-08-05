import Icon from '../components/Icon.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, LoginCheck, Spinner, LoginShell } from '../components/LoginKit.jsx'

const STATS = [['46,480', 'identities governed'], ['99.99%', 'auth uptime'], ['3ms', 'median policy check']]

export default function Login4() {
  const f = useLoginForm()
  return (
    <LoginShell style={{ background: '#F4F6FA', display: 'flex' }}>
      {/* Editorial brand side */}
      <div style={{ flex: '1.3', minWidth: 0, position: 'relative', overflow: 'hidden', padding: 'clamp(40px, 5vw, 76px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: '8%', right: '-6%', width: 420, height: 420, pointerEvents: 'none', opacity: .5 }}>
          <svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" stroke="#C3D3F0" strokeWidth="1">
            {[30, 55, 80].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}
            <circle cx="100" cy="45" r="4" fill="#0F62FE" stroke="none" /><circle cx="155" cy="120" r="4" fill="#6941C6" stroke="none" /><circle cx="60" cy="150" r="3" fill="#0E7A46" stroke="none" />
          </svg>
        </div>
        <Logo variant="color" height={30} />
        <div style={{ position: 'relative', maxWidth: 640 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '11.5px', fontWeight: 700, letterSpacing: '.04em', color: 'var(--accent-a)', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 999, padding: '4px 11px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />IDENTITY SECURITY CLOUD</div>
          <div style={{ fontSize: 'clamp(34px, 4.6vw, 60px)', fontWeight: 820, lineHeight: 1.03, letterSpacing: '-.035em', color: 'var(--ink)', marginTop: 22 }}>Identity security<br />for the modern<br />enterprise.</div>
          <div style={{ fontSize: '15px', color: 'var(--mut)', marginTop: 20, maxWidth: 460, lineHeight: 1.6 }}>Govern access, vault every credential and record every privileged session — from one console your auditors will actually trust.</div>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 'clamp(24px, 4vw, 52px)', flexWrap: 'wrap' }}>
          {STATS.map(([n, l]) => (
            <div key={l}><div style={{ fontSize: 'clamp(24px, 2.6vw, 32px)', fontWeight: 780, letterSpacing: '-.02em', color: 'var(--ink)' }}>{n}</div><div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: 2 }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Form side */}
      <div style={{ flex: '0 0 clamp(400px, 40%, 520px)', background: 'var(--surface)', borderLeft: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 36px', boxShadow: '-24px 0 60px -40px rgba(17,24,39,.25)' }}>
        <form onSubmit={f.submit} style={{ width: '100%', maxWidth: 380, animation: 'loginRise .4s ease-out' }}>
          <div style={{ fontSize: 25, fontWeight: 780, letterSpacing: '-.02em', color: 'var(--ink)' }}>Sign in</div>
          <div style={{ fontSize: '13.5px', color: 'var(--mut)', marginTop: 5 }}>Use your corporate credentials to continue.</div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email</label>
              <LoginInput icon="mail" type="email" placeholder="you@company.com" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)' }}>Password</label>
                <span className="link" style={{ fontSize: '12px' }} onClick={f.forgot}>Forgot?</span>
              </div>
              <LoginInput icon="lock" type={f.show ? 'text' : 'password'} placeholder="••••••••••" value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn show={f.show} onClick={() => f.setShow((s) => !s)} />} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)' }}><LoginCheck on={f.remember} onClick={() => f.setRemember((v) => !v)} />Remember this device for 30 days</label>
            <button type="submit" className="btn btn-pri" style={{ height: 45, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={f.loading}>{f.loading ? <Spinner /> : 'Sign in'}</button>
            <button type="button" className="btn btn-sec" style={{ height: 45, fontSize: '13.5px', justifyContent: 'center', width: '100%' }} onClick={() => f.sso('SAML')}><Icon name="sso" size={16} />Single sign-on</button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--faint)', marginTop: 28, textAlign: 'center' }}>Need an account? Access is provisioned by your identity team.</div>
        </form>
      </div>
    </LoginShell>
  )
}
