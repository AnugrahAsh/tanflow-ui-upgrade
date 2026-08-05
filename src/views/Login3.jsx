import Icon from '../components/Icon.jsx'
import { useLoginForm, Logo, LoginInput, EyeBtn, Spinner, LoginShell } from '../components/LoginKit.jsx'

const STATUS = ['eu-central-1a', 'TLS 1.3 · AES-256-GCM', 'p95 142ms', 'operational']

export default function Login3() {
  const f = useLoginForm()
  return (
    <LoginShell style={{ background: '#070B14', color: '#EAF0FB', display: 'flex', flexDirection: 'column' }}>
      {/* Accent bar + grid */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #0F62FE, #6941C6, #0F62FE)', flex: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(91,141,239,.09) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(circle at 50% 35%, #000, transparent 72%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 560, height: 360, background: 'radial-gradient(ellipse, rgba(15,98,254,.28), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <form onSubmit={f.submit} style={{ width: '100%', maxWidth: 396, animation: 'loginRise .45s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Logo variant="white" height={28} />
            <div style={{ marginTop: 26, width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(91,141,239,.35)', background: 'rgba(91,141,239,.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px -4px rgba(15,98,254,.5)' }}><Icon name="shieldCheck" size={22} style={{ color: '#8AB0F5' }} /></div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em', marginTop: 16 }}>Authenticate to continue</div>
            <div style={{ fontSize: '12.75px', color: '#8496B8', marginTop: 5 }}>Access to a <b style={{ color: '#C7D4EC' }}>production</b> tenant is monitored and recorded.</div>
          </div>

          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 13 }}>
            <LoginInput dark icon="mail" type="email" placeholder="Corporate email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} autoComplete="username" />
            <LoginInput dark icon="lock" type={f.show ? 'text' : 'password'} placeholder="Password" value={f.pw} onChange={(e) => f.setPw(e.target.value)} autoComplete="current-password" rightSlot={<EyeBtn dark show={f.show} onClick={() => f.setShow((s) => !s)} />} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><span className="link" style={{ fontSize: '12.25px', color: '#8AB0F5' }} onClick={f.forgot}>Forgot password?</span></div>
            <button type="submit" className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', boxShadow: '0 8px 24px -8px rgba(15,98,254,.7)' }} disabled={f.loading}>{f.loading ? <Spinner /> : <>Sign in<Icon name="arrowRight" size={15} /></>}</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: '#5B6B88', fontSize: '11px', fontWeight: 600 }}><span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />OR<span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} /></div>
          <button type="button" onClick={f.passkey} style={{ height: 44, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, border: '1px solid rgba(255,255,255,.16)', borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,.04)', color: '#EAF0FB', fontSize: '13.5px', fontWeight: 600, transition: 'all .12s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}><Icon name="fingerprint" size={17} style={{ color: '#8AB0F5' }} />Use a passkey</button>
        </form>
      </div>

      {/* Status bar */}
      <div style={{ position: 'relative', flex: 'none', borderTop: '1px solid rgba(255,255,255,.08)', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--mono)', fontSize: '11px', color: '#6B7C9C', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#34D07F' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D07F' }} />Tanflow Cloud</span>
        {STATUS.map((s) => <span key={s} style={{ display: 'inline-flex', gap: 14 }}><span style={{ opacity: .35 }}>·</span>{s}</span>)}
      </div>
    </LoginShell>
  )
}
