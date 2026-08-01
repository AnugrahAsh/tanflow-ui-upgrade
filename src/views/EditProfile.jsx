import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Field, SubLabel } from './formKit.jsx'
import { PROFILE } from '../data/mockData.js'

const TIMEZONES = ['Server Default', 'Europe/London', 'America/New_York', 'Asia/Kolkata', 'Asia/Singapore', 'UTC']

export default function EditProfile() {
  const { go, toast } = useApp()
  const [name, setName] = useState(PROFILE.name)
  const save = () => { toast('ok', 'Profile updated', `${name || 'Your profile'} saved (demo).`); go('my-profile') }

  return (
    <>
      <button className="btn btn-sec btn-sm" onClick={() => go('my-profile')} style={{ marginBottom: 12 }}><Icon name="chevL" />Back</button>
      <PageHead title="Edit Profile" sub="Update your account details — name, contact and organization." />

      <div className="card">
        <div className="card-pad">
          <SubLabel style={{ margin: '0 0 12px' }}>Profile Picture</SubLabel>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: PROFILE.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, flex: 'none' }}>{PROFILE.initials}</div>
            <div>
              <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Change photo', 'Upload a new profile picture (demo).')}><Icon name="upload" />Change photo</button>
              <div className="f-help" style={{ marginTop: 6 }}>Optional. PNG or JPG, max 5MB. Defaults to initials.</div>
            </div>
          </div>

          <div className="divider" style={{ margin: '20px 0' }} />

          <SubLabel style={{ margin: '0 0 12px' }}>Basic Details</SubLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
            <Field label="FULL NAME" required>
              <input className="inp" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="USERNAME" help="Your sign-in handle — set at creation and cannot be changed.">
              <input className="inp" defaultValue={PROFILE.handle} disabled style={{ background: 'var(--surface-2)', color: 'var(--mut)' }} />
            </Field>
            <Field label="EMAIL ADDRESS"><input className="inp" type="email" defaultValue={PROFILE.email} /></Field>
            <Field label="PHONE NUMBER"><input className="inp" defaultValue={PROFILE.phone} inputMode="tel" /></Field>
            <Field label="ROLE"><input className="inp" defaultValue={PROFILE.role} /></Field>
            <Field label="ORGANIZATION"><input className="inp" defaultValue={PROFILE.organization} /></Field>
            <Field label="TIMEZONE" full>
              <select className="sel" defaultValue={PROFILE.timezone}>{TIMEZONES.map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
          </div>
        </div>
      </div>

      <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn btn-sec" onClick={() => go('my-profile')}>Cancel</button>
        <button className="btn btn-pri" onClick={save}><Icon name="check" />Save Changes</button>
      </div>
    </>
  )
}
