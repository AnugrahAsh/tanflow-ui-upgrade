import Icon from '../components/Icon.jsx'
import { PageHead, CardHeader } from '../components/ui.jsx'
import { Avatar, Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const DEVICES = [
  ['MacBook Pro 16"', 'FIDO2 passkey · managed', 'London, GB', 'Now'],
  ['iPhone 15 Pro', 'Tanflow Verify · push', 'London, GB', '2 hrs ago'],
  ['YubiKey 5C', 'FIDO2 security key', 'Hardware', 'Registered Mar 2026'],
]

export default function MyProfile() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="My Profile"
        sub="Your identity, security factors and active sessions."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'Edit profile', 'Update contact details & preferences (demo).')}><Icon name="edit" />Edit profile</button>}
      />
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Identity" />
          <div className="card-pad">
            <div className="hrow" style={{ gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--hair)' }}>
              <Avatar name="Anika Rao" cls="av-lg" color="#3E4784" />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Anika Rao</div>
                <div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 1 }}>Global Security Admin · anika.rao@meridianbank.com</div>
                <div className="hrow" style={{ marginTop: 8, gap: 6 }}><Badge tone="acc" label="Global Security Admin" dot={false} /><Badge tone="ok" label="MFA enrolled" /></div>
              </div>
            </div>
            <div className="dl" style={{ marginTop: 14 }}>
              <div className="dl-k">Identity ID</div><div className="dl-v mono" style={{ fontSize: '11.5px' }}>U10001 · UPN anika.rao@meridianbank.com</div>
              <div className="dl-k">Department</div><div className="dl-v">Security Engineering</div>
              <div className="dl-k">Manager</div><div className="dl-v">CISO Office</div>
              <div className="dl-k">Source of truth</div><div className="dl-v">Workday HR (authoritative)</div>
              <div className="dl-k">Last sign-in</div><div className="dl-v num">Now · London, GB · FIDO2</div>
            </div>
          </div>
        </div>
        <div className="stack">
          <div className="card">
            <CardHeader title="Security factors" sub="Registered authenticators" />
            <div className="card-pad" style={{ paddingTop: 8, paddingBottom: 10 }}>
              {DEVICES.map((d) => (
                <div className="hrow" key={d[0]} style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div><div style={{ fontSize: '12.5px', fontWeight: 600 }}>{d[0]}</div><div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{d[1]} · {d[2]}</div></div>
                  <span style={{ fontSize: '11px', color: 'var(--faint)' }}>{d[3]}</span>
                </div>
              ))}
              <button className="btn btn-sec" style={{ width: '100%', marginTop: 12 }} onClick={() => toast('ok', 'Add authenticator', 'Register a new passkey or security key (demo).')}><Icon name="plus" />Add authenticator</button>
            </div>
          </div>
          <div className="card">
            <CardHeader title="Preferences" />
            <div className="card-pad">
              <div className="dl">
                <div className="dl-k">Language</div><div className="dl-v">English (UK)</div>
                <div className="dl-k">Timezone</div><div className="dl-v">Europe/London</div>
                <div className="dl-k">Session</div><div className="dl-v"><StatusBadge status="Active" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
