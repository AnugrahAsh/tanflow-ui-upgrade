import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }

const METHODS = [
  { key: 'totp', icon: 'phone', title: 'Authenticator app (TOTP)', desc: 'Time-based codes via Tanflow Authenticator, Google Authenticator, Authy, or any compatible TOTP app.', badge: ['Strong', 'ok'], spec: '6 digits · 30s · ±1 step' },
  { key: 'email', icon: 'mail', title: 'Email one-time code', desc: 'A short code delivered to the user’s registered email address at every sign-in.', badge: ['Basic', 'warn'], spec: '6 digits · 5-min code', link: ['Email Management', 'email-management'] },
  { key: 'sms', icon: 'chat', title: 'SMS one-time code', desc: 'A short code delivered via text message to the user’s registered mobile number at every sign-in.', badge: ['Basic', 'warn'], spec: '6 digits · 5-min code', link: ['SMS Management', 'sms-management'] },
  { key: 'passkey', icon: 'fingerprint', title: 'Security key / passkey', desc: 'Phishing-resistant WebAuthn/FIDO2: Touch ID, Windows Hello, a phone, or a hardware key.', badge: ['Phishing-resistant', 'ok'], spec: 'WebAuthn · FIDO2' },
]

const CFG = [
  ['Authenticator app (TOTP)', [
    ['Issuer label', 'Tanflow'],
    ['Code length', '6 digits'],
    ['Period', '30 seconds'],
    ['Accepted drift', '±1 step (30s either side)'],
    ['Backup codes', '10 single-use codes issued at enrolment'],
  ]],
  ['Email & SMS one-time code', [
    ['Code length', '6 digits'],
    ['Validity', '5 minutes'],
    ['Resend cooldown', '30 seconds'],
    ['Email delivery', 'smtp.tanflow.local:587 · STARTTLS'],
    ['SMS delivery', 'Gateway configured · sender “TANFLOW”'],
  ]],
  ['Security key / passkey', [
    ['Relying party', 'tanflow.local'],
    ['Attestation', 'None (any authenticator)'],
    ['User verification', 'Preferred'],
    ['Resident key', 'Discouraged — roaming keys supported'],
  ]],
  ['Verification & recovery', [
    ['Attempts per challenge', '5, then the code burns'],
    ['Lockout', '15-minute cooldown after 5 failures'],
    ['Recovery', 'Admin reset with identity verification'],
  ]],
]

function MethodBadge({ tone, text }) {
  const map = { ok: { c: 'var(--ok)', bg: 'var(--ok-bg)', b: 'var(--ok-line)' }, warn: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' } }
  const s = map[tone]
  return <span style={{ fontSize: '10.75px', fontWeight: 700, color: s.c, background: s.bg, border: `1px solid ${s.b}`, borderRadius: 'var(--r-xs)', padding: '2px 7px', whiteSpace: 'nowrap' }}>{text}</span>
}

function MfaConfigDrawer() {
  const { toast } = useApp()
  return (
    <>
      <div className="drawer-h">
        <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.015em' }}>MFA Configuration</div>
          <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: 4, lineHeight: 1.5 }}>Parameters applied the moment enforcement is on. They are tenant-wide — they do not vary by user or group.</div>
        </div>
      </div>
      <div className="drawer-body">
        {CFG.map(([title, rows]) => (
          <div key={title}>
            <div style={{ ...label, margin: '18px 0 6px' }}>{title}</div>
            <div className="dl">
              {rows.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></div>))}
            </div>
          </div>
        ))}
        <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 18, padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)' }}>
          <Icon name="lock" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}>These parameters are versioned in the audit log and enforced tenant-wide. Changing them opens a change request.</div>
        </div>
        <button className="btn btn-sec" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }} onClick={() => toast('ok', 'Edit MFA parameters', 'Opens a change request for tenant-wide MFA parameters (demo).')}><Icon name="edit" />Edit parameters</button>
      </div>
    </>
  )
}

function Applies({ icon, title, open, onOpen, desc }) {
  return (
    <div className="hrow" style={{ gap: 11, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--hair)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={15} style={{ color: 'var(--mut)' }} /></span>
      <div style={{ minWidth: 0 }}>
        <div className="hrow" style={{ gap: 8 }}><span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{title}</span>{open && <span className="link" style={{ fontSize: '12px' }} onClick={onOpen}>open</span>}</div>
        <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )
}

const INITIAL = { enforced: false, methods: { totp: true, email: true, sms: true, passkey: true } }

export default function Mfa() {
  const { go, toast, openDrawer } = useApp()
  const [saved, setSaved] = useState(INITIAL)
  const [work, setWork] = useState(INITIAL)

  const dirty = JSON.stringify(saved) !== JSON.stringify(work)
  const enforced = work.enforced
  const selected = Object.values(work.methods).filter(Boolean).length
  const setEnforced = () => setWork((w) => ({ ...w, enforced: !w.enforced }))
  const toggleMethod = (k) => setWork((w) => ({ ...w, methods: { ...w.methods, [k]: !w.methods[k] } }))
  const save = () => { setSaved(work); toast('ok', 'MFA policy saved', `Enforcement ${work.enforced ? 'on' : 'off'}, ${selected} method${selected === 1 ? '' : 's'} allowed — published tenant-wide (demo).`) }

  return (
    <>
      <PageHead
        title="Multi-Factor Authentication"
        sub="Turn MFA enforcement on or off and pick which verification methods users may enrol in."
        actions={<button className="btn btn-sec" onClick={() => openDrawer(<MfaConfigDrawer />)}><Icon name="settings" />MFA Configuration</button>}
      />

      {/* Enforcement banner */}
      <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ width: 52, height: 52, borderRadius: 'var(--r)', background: enforced ? 'var(--accent-bg)' : 'var(--surface-3)', border: `1px solid ${enforced ? 'var(--accent-line)' : 'var(--line)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon name="shieldCheck" size={24} style={{ color: enforced ? 'var(--accent)' : 'var(--faint)' }} />
        </span>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="hrow" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-.01em' }}>MFA enforcement is {enforced ? 'on' : 'off'}</span>
            {enforced
              ? <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--ok)', background: 'var(--ok-bg)', border: '1px solid var(--ok-line)', borderRadius: 999, padding: '2px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />Second factor required</span>
              : <span className="hrow" style={{ gap: 5, fontSize: '11.5px', fontWeight: 600, color: 'var(--mut)', background: 'var(--surface-3)', border: '1px solid var(--line)', borderRadius: 999, padding: '2px 9px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--faint)' }} />Password only</span>}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.5 }}>{enforced ? 'Local-login users must present a second factor after their password. Their enrolled methods are challenged at every sign-in.' : 'Local-login users sign in with their password only. Turn this on to require a second factor.'}</div>
        </div>
        <div className="hrow" style={{ gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.09em', color: 'var(--faint)' }}>ENFORCEMENT</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: enforced ? 'var(--accent)' : 'var(--ink-2)', marginTop: 2 }}>{enforced ? 'On' : 'Off'}</div>
          </div>
          <span className={`toggle ${enforced ? 'on' : ''}`} style={{ transform: 'scale(1.35)', transformOrigin: 'center' }} onClick={setEnforced} role="switch" aria-checked={enforced} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 336px', gap: 16, alignItems: 'start' }}>
        {/* Allowed methods */}
        <div>
          <div className="hrow" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Allowed methods</div>
              <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: 2, maxWidth: 560, lineHeight: 1.5 }}>Users will be offered these options at enrolment. SAML users bypass this layer — their identity provider handles MFA.</div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--mut)', whiteSpace: 'nowrap' }}>{selected} of {METHODS.length} selected</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
            {METHODS.map((m) => {
              const on = work.methods[m.key]
              return (
                <div key={m.key} onClick={() => toggleMethod(m.key)} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderTop: `3px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`, borderRadius: 'var(--r)', padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'border-color .12s' }}>
                  <div className="hrow" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={m.icon} size={19} style={{ color: 'var(--accent)' }} /></span>
                    <span style={{ width: 20, height: 20, borderRadius: 'var(--r-xs)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--accent)' : 'var(--surface)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line-2)'}` }}>{on && <Icon name="check" size={13} style={{ color: '#fff' }} />}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{m.title}</div>
                  <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 5, lineHeight: 1.5, flex: 1 }}>{m.desc}</div>
                  <div className="hrow" style={{ gap: 9, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hair)', flexWrap: 'wrap' }}>
                    <MethodBadge tone={m.badge[1]} text={m.badge[0]} />
                    <span className="mono" style={{ fontSize: '11px', color: 'var(--mut)' }}>{m.spec}</span>
                    {m.link && <span className="link" style={{ fontSize: '11.5px', marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); go(m.link[1]) }}>{m.link[0]}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-pad">
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Sign-in preview</div>
            <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 2 }}>What a local-login user will see</div>
            <div style={{ marginTop: 14, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
              <div className="hrow" style={{ gap: 6, padding: '8px 11px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E0524D' }} /><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E9B02E' }} /><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3BB06B' }} />
                <span className="mono" style={{ fontSize: '11px', color: 'var(--mut)', marginLeft: 6 }}>tanflow.local/login</span>
              </div>
              <div style={{ padding: '26px 18px', textAlign: 'center' }}>
                <Icon name={enforced ? 'lock' : 'unlock'} size={30} style={{ color: enforced ? 'var(--accent)' : 'var(--faint)' }} />
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', marginTop: 10 }}>{enforced ? 'Password + second factor' : 'Password only'}</div>
                <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 6, lineHeight: 1.5 }}>{enforced ? 'After their password, users are challenged for one of the allowed methods before the portal loads.' : 'With enforcement off, users go straight to the portal after their password. The methods you pick stay available for voluntary enrolment.'}</div>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Where this applies</div>
            <Applies icon="user" title="Local-login users" desc="Governed by this page — password, then a second factor when enforcement is on." />
            <Applies icon="sso" title="SAML users" open onOpen={() => go('sso')} desc="Bypass this layer entirely. Their identity provider owns MFA." />
            <Applies icon="keyRound" title="Vault reveal" open onOpen={() => go('vault')} desc="Always challenges, independently of enforcement. That gate cannot be turned off." />
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="card card-pad" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="hrow" style={{ gap: 10 }}>
          <Icon name={dirty ? 'edit' : 'check'} size={16} style={{ color: dirty ? 'var(--warn)' : 'var(--ok)', flex: 'none' }} />
          <div>
            <div style={{ fontWeight: 650, fontSize: '13.5px', color: 'var(--ink)' }}>{dirty ? 'Unsaved changes' : 'No unsaved changes'}</div>
            <div style={{ fontSize: '12px', color: 'var(--mut)' }}>{dirty ? 'Publish to apply this policy across the tenant.' : 'This screen matches what the node is enforcing right now.'}</div>
          </div>
        </div>
        <div className="hrow" style={{ gap: 8 }}>
          <button className="btn btn-sec" disabled={!dirty} style={{ opacity: dirty ? 1 : .5, cursor: dirty ? 'pointer' : 'default' }} onClick={() => setWork(saved)}>Reset</button>
          <button className="btn btn-pri" disabled={!dirty} style={{ opacity: dirty ? 1 : .5, cursor: dirty ? 'pointer' : 'default' }} onClick={save}><Icon name="check" />Save changes</button>
        </div>
      </div>
    </>
  )
}
