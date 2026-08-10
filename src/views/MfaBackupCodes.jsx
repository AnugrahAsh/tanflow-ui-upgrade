import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { AuthShell, AuthPoints, LoginCheck, Spinner } from '../components/LoginKit.jsx'

const POINTS = [
  ['key2', 'Ten single-use codes', 'Each one signs you in exactly once, then burns.'],
  ['lock', 'Shown only now', 'We store hashes — we cannot show them to you again.'],
  ['refresh', 'Regenerate any time', 'Creating a new set invalidates every unused code.'],
]
const CODES = ['4K7Q-9WTM', 'P2XD-J8LR', 'B6NC-3HVE', 'ZQ5T-M1KA', 'W9FD-7RUP', 'H3JS-XN42', 'V8LM-QK6B', 'T1RY-D5CW', 'G7PA-2ZNF', 'E4UH-9BTX']

export default function MfaBackupCodes() {
  const { go, toast } = useApp()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const finish = () => {
    if (!saved) { toast('warn', 'Confirm first', 'Tick the box to confirm you have stored your codes.'); return }
    setLoading(true)
    setTimeout(() => { toast('ok', 'Two-factor enabled', 'Your account is now protected (demo).'); go('overview') }, 700)
  }

  return (
    <AuthShell
      heading={<>Your way back in,<br />if all else fails.</>}
      headingSub="Backup codes are the last resort when a device is lost, broken or replaced."
      aside={<AuthPoints items={POINTS} />}
      step="Step 3 of 3"
      icon="key2"
      title="Save your backup codes"
      sub="Store these somewhere safe and offline — a password manager or a locked drawer. They will not be shown again."
      width={430}
    >
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)', marginBottom: 16 }}>
        <Icon name="warnTri" size={16} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
        <div style={{ fontSize: '12.25px', color: 'var(--ink-2)', lineHeight: 1.55 }}>
          Anyone holding a code can complete your second factor. Treat them like passwords — never email or message them.
        </div>
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }}>10 unused codes</span>
          <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Generated just now</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--hair)' }}>
          {CODES.map((c, i) => (
            <div key={c} style={{ background: 'var(--surface)', padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: '10.5px', color: 'var(--faint)', fontFamily: 'var(--mono)', width: 16, flex: 'none' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, letterSpacing: '.03em', color: 'var(--ink)' }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-sec btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('ok', 'Copied', 'All 10 backup codes copied to your clipboard (demo).')}><Icon name="copy" size={13} />Copy</button>
        <button className="btn btn-sec btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('ok', 'Downloaded', 'tanflow-backup-codes.txt saved (demo).')}><Icon name="download" size={13} />Download</button>
        <button className="btn btn-sec btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('ok', 'Printing', 'Sent to your printer (demo).')}><Icon name="reports" size={13} />Print</button>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '13px', color: 'var(--ink-2)', marginTop: 18, lineHeight: 1.5 }}>
        <span style={{ marginTop: 1 }}><LoginCheck on={saved} onClick={() => setSaved((v) => !v)} /></span>
        I have saved these codes somewhere safe and understand they won’t be shown again.
      </label>

      <button className="btn btn-pri" style={{ height: 44, fontSize: '14px', justifyContent: 'center', width: '100%', marginTop: 16, opacity: saved ? 1 : .55, cursor: saved ? 'pointer' : 'not-allowed' }} disabled={loading || !saved} onClick={finish}>
        {loading ? <Spinner /> : <><Icon name="check" size={15} />Finish setup</>}
      </button>
    </AuthShell>
  )
}
