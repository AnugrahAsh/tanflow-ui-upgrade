import Icon from '../Icon.jsx'
import { Avatar, Badge } from '../primitives.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { NOTIFS } from '../../data/mockData.js'

const USER_ITEMS = [
  ['user', 'My profile'],
  ['shieldCheck', 'My access & entitlements'],
  ['clock', 'My approvals (3)'],
  ['settings', 'Preferences'],
]

export default function Flyout() {
  const { flyout, toast, go } = useApp()

  return (
    <div className={`flyout ${flyout ? 'show' : ''}`} id="flyout" onClick={(e) => e.stopPropagation()}>
      {flyout === 'user' && (
        <>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--hair)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar name="Anika Rao" cls="av-lg" color="#3E4784" />
            <div>
              <div style={{ fontWeight: 650, fontSize: '13.5px' }}>Anika Rao</div>
              <div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>anika.rao@meridianbank.com</div>
              <div style={{ marginTop: 5 }}><Badge tone="acc" label="Global Security Admin" dot={false} /></div>
            </div>
          </div>
          <div style={{ padding: 8 }}>
            {USER_ITEMS.map(([icon, label]) => (
              <button key={label} className="pal-it" onClick={() => toast('ok', label, 'Opens in the full product.')}>
                <Icon name={icon} size={15} />{label}
              </button>
            ))}
            <div className="divider" style={{ margin: '6px 4px' }} />
            <button className="pal-it" style={{ color: 'var(--bad)' }} onClick={() => toast('warn', 'Signed out', 'Session ended (demo).')}>
              <Icon name="logout" size={15} />Sign out
            </button>
          </div>
        </>
      )}
      {flyout === 'notif' && (
        <>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--hair)', display: 'flex', alignItems: 'center' }}>
            <b style={{ fontSize: 13 }}>Notifications</b>
            <span className="tag tag-acc" style={{ marginLeft: 8 }}>3 new</span>
            <span className="link" style={{ marginLeft: 'auto' }} onClick={() => toast('ok', 'Notifications', 'All marked as read.')}>Mark all read</span>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {NOTIFS.map((n, i) => (
              <div className="notif-it" key={i} onClick={() => go('alerts')}>
                <div className="nf-ic" style={{ background: `var(--${n.c}-bg)`, color: `var(--${n.c})` }}><Icon name={n.ic} size={14} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nf-t">{n.t}</div><div className="nf-s">{n.s}</div><div className="nf-time">{n.time}</div>
                </div>
                {n.unread && <span className="nf-unread" />}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--hair)', textAlign: 'center' }}>
            <span className="link" onClick={() => go('alerts')}>View all in Alert Center <Icon name="chevR" size={11} /></span>
          </div>
        </>
      )}
    </div>
  )
}
