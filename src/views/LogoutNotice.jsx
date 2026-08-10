import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints } from '../components/LoginKit.jsx'

const POINTS = [
  ['shieldCheck', 'Tokens revoked', 'Your session token was invalidated on the gateway, not just this browser.'],
  ['recordings', 'Sessions sealed', 'Any recordings from your session were hash-chained and closed.'],
  ['clock', 'Idle timeout is policy', 'Meridian Global Bank ends inactive sessions after 30 minutes.'],
]

// ?reason=expired | idle | revoked | signout  (defaults to a clean sign-out)
const REASONS = {
  signout: { icon: 'logout', title: 'You’ve been signed out', sub: 'Your session was ended and every token revoked. Sign in again whenever you’re ready.', tone: null },
  expired: { icon: 'clock', title: 'Your session expired', sub: 'For your security, sessions end after a fixed lifetime. Sign in again to continue where you left off.', tone: 'warn' },
  idle: { icon: 'clock', title: 'Signed out for inactivity', sub: 'You were away for 30 minutes, so Tanflow closed your session automatically.', tone: 'warn' },
  revoked: { icon: 'ban', title: 'Your session was revoked', sub: 'An administrator ended this session. Contact your security team if you believe this was a mistake.', tone: 'bad' },
}
const TONE = { warn: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' }, bad: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)' } }

export default function LogoutNotice() {
  const { go } = useApp()
  const [sp] = useSearchParams()
  const r = REASONS[sp.get('reason')] || REASONS.signout
  const t = r.tone ? TONE[r.tone] : null

  return (
    <AuthShell
      heading={<>Session closed.<br />Nothing left behind.</>}
      headingSub="Signing out revokes the token at the gateway and seals every recording it produced."
      aside={<AuthPoints items={POINTS} />}
      icon={r.icon}
      title={r.title}
      sub={r.sub}
      foot={<>Signed in on a shared computer? <span className="link">Close every window</span> to be sure.</>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {t && (
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: t.bg, border: `1px solid ${t.b}`, borderRadius: 'var(--r-sm)' }}>
            <Icon name={r.icon} size={16} style={{ color: t.c, flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Any work in an open session console was not lost — recordings and transcripts are retained under your organisation’s policy.
            </div>
          </div>
        )}
        <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} onClick={() => go('login1')}>
          Sign in again<Icon name="arrowRight" size={15} />
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sec" style={{ flex: 1, height: 42, justifyContent: 'center', fontSize: '13px' }} onClick={() => go('forgot-password')}><Icon name="key2" size={14} />Reset password</button>
          <button className="btn btn-sec" style={{ flex: 1, height: 42, justifyContent: 'center', fontSize: '13px' }}><Icon name="book" size={14} />Get help</button>
        </div>
      </div>
    </AuthShell>
  )
}
