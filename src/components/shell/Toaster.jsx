import Icon from '../Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'

const ICON_FOR = { ok: 'shieldCheck', warn: 'warnTri' }

export default function Toaster() {
  const { toasts } = useApp()
  return (
    <div className="toasts" id="toasts">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          style={t.leaving ? { transition: 'all .35s', opacity: 0, transform: 'translateY(6px)' } : undefined}
        >
          <Icon name={ICON_FOR[t.type] || 'ban'} size={15} />
          <div>
            <div className="tst-t">{t.title}</div>
            {t.sub && <div className="tst-s">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
