import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, LoginCheck, Spinner } from '../components/LoginKit.jsx'

/* §3 — what an invitee sees when they open a share link.
   The administrator's side of this lives in views/SharingProfiles.jsx. */

const POINTS = [
  ['eye', 'You are a viewer', 'Read-only by default — you cannot type into the session.'],
  ['recordings', 'Everything is recorded', 'Your view is captured and retained with the session.'],
  ['clock', 'The link is time-boxed', 'It stops working when the window closes or the host revokes it.'],
]

const INVITE = {
  host: 'Tribhuwan Rao',
  org: 'Meridian Global Bank',
  target: 'BTSPAMDEMO01',
  proto: 'SSH',
  profile: 'Read-only viewer',
  email: 'auditor@kpmg-ext.com',
  expiresIn: 8 * 60, // seconds
}
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function SharePublic() {
  const { go, toast } = useApp()
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [left, setLeft] = useState(INVITE.expiresIn)

  useEffect(() => {
    if (left <= 0) return undefined
    const t = setInterval(() => setLeft((n) => n - 1), 1000)
    return () => clearInterval(t)
  }, [left])

  const expired = left <= 0
  const ok = email.trim().toLowerCase() === INVITE.email && agree
  const join = () => {
    if (!agree) { toast('warn', 'Confirm first', 'Accept the recording notice before joining.'); return }
    if (email.trim().toLowerCase() !== INVITE.email) { toast('warn', 'Email does not match', 'This link is bound to the address it was sent to.'); return }
    setLoading(true)
    setTimeout(() => go('guest-session'), 700)
  }

  const Row = ({ k, v, mono }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '7px 0', borderBottom: '1px solid var(--hair)' }}>
      <span style={{ fontSize: '12.25px', color: 'var(--mut)', flex: 'none' }}>{k}</span>
      <span className={mono ? 'mono' : undefined} style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{v}</span>
    </div>
  )

  return (
    <AuthShell
      heading={<>You’ve been invited<br />to watch a session.</>}
      headingSub="Session sharing lets an operator bring you into a live privileged session — under the same recording and policy controls they work under."
      aside={<AuthPoints items={POINTS} />}
      icon={expired ? 'ban' : 'share2'}
      title={expired ? 'This link has expired' : 'Join a shared session'}
      sub={expired
        ? 'Single-use invitations expire quickly by design. Ask the host to mint a new link.'
        : <><b style={{ color: 'var(--ink)' }}>{INVITE.host}</b> at {INVITE.org} invited you to watch a live session.</>}
      width={410}
      foot={expired ? undefined : <>By joining you agree to the <span className="link">acceptable-use terms</span>.</>}
    >
      {expired ? (
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--bad-bg)', border: '1px solid var(--bad-line)', borderRadius: 'var(--r-sm)' }}>
          <Icon name="ban" size={16} style={{ color: 'var(--bad)', flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Nothing was shared with you. Contact {INVITE.host} if you still need access.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '4px 13px 8px' }}>
            <Row k="Target" v={`${INVITE.target} · ${INVITE.proto}`} mono />
            <Row k="Host" v={INVITE.host} />
            <Row k="Your access" v={INVITE.profile} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '9px 0 4px' }}>
              <span style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Link expires in</span>
              <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: left < 120 ? 'var(--bad)' : 'var(--ink)' }}>{mmss(left)}</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Confirm your email</label>
            <LoginInput icon="mail" type="email" placeholder="the address this link was sent to" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 7 }}>This invitation is bound to one address — it can’t be forwarded.</div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '12.75px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
            <span style={{ marginTop: 1 }}><LoginCheck on={agree} onClick={() => setAgree((v) => !v)} /></span>
            I understand this session is recorded, including everything I see, and that the host can end my access at any time.
          </label>

          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', opacity: ok ? 1 : .55, cursor: ok ? 'pointer' : 'not-allowed' }} disabled={loading || !ok} onClick={join}>
            {loading ? <Spinner /> : <><Icon name="play" size={15} />Join session</>}
          </button>
        </div>
      )}
    </AuthShell>
  )
}
