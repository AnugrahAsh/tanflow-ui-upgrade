import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginInput, Spinner } from '../components/LoginKit.jsx'

const POINTS = [
  ['shieldCheck', 'Cannot be phished', 'The credential is bound to tanflow.local and never leaves your device.'],
  ['zap', 'Fastest sign-in', 'One touch — no codes to type, nothing to mistype.'],
  ['keyRound', 'Nothing shared', 'Only a public key reaches us; the private key stays with you.'],
]
const KINDS = [
  ['fingerprint', 'This device', 'Touch ID, Face ID or Windows Hello'],
  ['phone', 'A phone or tablet', 'Scan a QR code to use a nearby device'],
  ['keyRound', 'A hardware key', 'YubiKey, Titan or any FIDO2 key'],
]

export default function MfaWebauthnSetup() {
  const { go, toast } = useApp()
  const [stage, setStage] = useState('intro') // intro | waiting | name
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)

  const register = () => {
    setStage('waiting')
    setTimeout(() => { setStage('name'); setLabel('MacBook Pro · Touch ID') }, 1600)
  }
  const finish = () => {
    if (!label.trim()) { toast('warn', 'Name required', 'Give this passkey a name you’ll recognise.'); return }
    setLoading(true)
    setTimeout(() => { toast('ok', 'Passkey registered', `${label.trim()} can now sign you in (demo).`); go('mfa-backup-codes') }, 700)
  }

  return (
    <AuthShell
      heading={<>The strongest factor<br />is the simplest one.</>}
      headingSub="Passkeys replace codes with a single touch — and cannot be phished, relayed or replayed."
      aside={<AuthPoints items={POINTS} />}
      step="Step 2 of 3"
      icon="fingerprint"
      title={stage === 'name' ? 'Name this passkey' : 'Register a passkey'}
      sub={stage === 'name'
        ? 'Give it a name so you can tell your devices apart later.'
        : 'Your browser will ask you to confirm with your device. Nothing secret is sent to Tanflow.'}
      back="Choose another method"
      onBack={() => go('mfa-setup')}
    >
      {stage === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {KINDS.map(([ic, t, s]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={15} style={{ color: 'var(--accent)' }} /></span>
                <div><div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{t}</div><div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 1 }}>{s}</div></div>
              </div>
            ))}
          </div>
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} onClick={register}>
            <Icon name="fingerprint" size={16} />Register passkey
          </button>
        </div>
      )}

      {stage === 'waiting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: '30px 16px', border: '1px solid var(--accent-line)', background: 'var(--accent-bg)', borderRadius: 'var(--r)' }}>
            <Spinner color="var(--accent)" size={28} />
            <div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)', marginTop: 14 }}>Waiting for your device</div>
            <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 4, lineHeight: 1.5 }}>Confirm the prompt from your browser to finish registering.</div>
          </div>
          <button className="btn btn-sec" style={{ height: 42, fontSize: '13.5px', justifyContent: 'center', width: '100%' }} onClick={() => setStage('intro')}>Cancel</button>
        </div>
      )}

      {stage === 'name' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--ok-bg)', border: '1px solid var(--ok-line)', borderRadius: 'var(--r-sm)' }}>
            <Icon name="check" size={16} style={{ color: 'var(--ok)', flex: 'none', marginTop: 1 }} />
            <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>Passkey created and bound to <b style={{ color: 'var(--ink)' }}>tanflow.local</b>.</div>
          </div>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Passkey name</label>
            <LoginInput icon="monitor" placeholder="e.g. Work laptop" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
          </div>
          <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%' }} disabled={loading} onClick={finish}>
            {loading ? <Spinner /> : <>Save and continue<Icon name="arrowRight" size={15} /></>}
          </button>
        </div>
      )}
    </AuthShell>
  )
}
