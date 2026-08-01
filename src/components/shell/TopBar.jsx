import Icon from '../Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'

export default function TopBar() {
  const { go, toast, openPalette, toggleFlyout } = useApp()
  return (
    <header className="topbar">
      <div className="hdr-brand" onClick={() => go('overview')} title="Tanflow home">
        <img className="logo" src="assets/brand/tanflow-white.png" alt="tanflow" />
        <span className="brand-sub">Identity Security Cloud</span>
      </div>
      <button className="gsearch" onClick={openPalette}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <span className="gs-hint">Search identities, sessions, policies, resources…</span>
        <kbd>⌘K</kbd>
      </button>
      <button
        className="tenant"
        onClick={() => toast('ok', 'Environment selector', 'Connected to Meridian Global Bank — Production (eu-central-1). Switch tenants or environments here in the full product.')}
        title="Tenant / environment"
      >
        <span className="t-dot" />
        <span className="t-name">Meridian Global Bank</span>
        <span className="t-env">Prod</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5M7 9l5-5 5 5" /></svg>
      </button>
      <div className="top-actions">
        <button className="icon-btn" title="Tanflow Copilot" onClick={() => toast('ok', 'Tanflow Copilot', 'AI assistant is analyzing your identity posture…')} aria-label="AI Copilot">
          <Icon name="sparkle" size={20} />
        </button>
        <button className="icon-btn" title="My tasks & approvals" onClick={() => go('requests')} aria-label="Tasks">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
        </button>
        <button className="icon-btn" title="Notifications" onClick={(e) => { e.stopPropagation(); toggleFlyout('notif') }} aria-label="Notifications">
          <Icon name="bell" size={20} />
          <span className="dot" />
        </button>
        <button className="icon-btn" title="Reports" onClick={() => go('reports')} aria-label="Reports">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 13l3-3 4 4 5-6" /></svg>
        </button>
        <button className="icon-btn" title="Help & documentation" onClick={() => toast('ok', 'Help center', 'Documentation opens in a new tab in the full product.')} aria-label="Help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
        </button>
        <button className="icon-btn" title="Platform settings" onClick={() => go('settings')} aria-label="Settings">
          <Icon name="settings" size={20} />
        </button>
        <div className="top-divider" />
        <span className="av top-avatar" style={{ background: '#3E4784' }} onClick={(e) => { e.stopPropagation(); toggleFlyout('user') }}>AR</span>
      </div>
    </header>
  )
}
