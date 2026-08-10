import Icon from './Icon.jsx'
import { Logo, LoginShell } from './LoginKit.jsx'

/* Centred status screen for 404 / 403 / 503 / maintenance.
   Follows the `.empty` vocabulary (icon tile, title, sub, action) but at page
   scale, with the brand mark and the same status strip the shell uses. */

const TONES = {
  mut: { c: 'var(--mut)', bg: 'var(--surface-3)', b: 'var(--line)' },
  warn: { c: 'var(--warn)', bg: 'var(--warn-bg)', b: 'var(--warn-line)' },
  bad: { c: 'var(--bad)', bg: 'var(--bad-bg)', b: 'var(--bad-line)' },
  accent: { c: 'var(--accent)', bg: 'var(--accent-bg)', b: 'var(--accent-line)' },
}

/* `embedded` renders the body only — for use inside the app shell, where the
   real header and status bar are already on screen. */
export default function StatusScreen({ code, icon, tone = 'mut', title, sub, detail, actions, meta, embedded }) {
  const t = TONES[tone]

  const body = (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: embedded ? '48px 24px' : '20px 24px 60px' }}>
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center', animation: 'loginRise .4s ease-out' }}>
        <span style={{ width: 58, height: 58, borderRadius: 'var(--r)', background: t.bg, border: `1px solid ${t.b}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={26} style={{ color: t.c }} />
        </span>
        {code && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: t.c, marginTop: 18 }}>ERROR {code}</div>}
        <div style={{ fontSize: 26, fontWeight: 760, letterSpacing: '-.022em', color: 'var(--ink)', marginTop: code ? 6 : 18 }}>{title}</div>
        <div style={{ fontSize: '13.75px', color: 'var(--mut)', marginTop: 8, lineHeight: 1.6, maxWidth: 430, marginLeft: 'auto', marginRight: 'auto' }}>{sub}</div>
        {detail && (
          <div style={{ marginTop: 20, padding: '13px 15px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', textAlign: 'left' }}>{detail}</div>
        )}
        {actions && <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>{actions}</div>}
        {meta && <div style={{ fontSize: '11.75px', color: 'var(--faint)', marginTop: 22, fontFamily: 'var(--mono)' }}>{meta}</div>}
      </div>
    </div>
  )

  if (embedded) return <div style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>{body}</div>

  return (
    <LoginShell style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '22px 26px', flex: 'none' }}><Logo height={26} /></div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: 520, textAlign: 'center', animation: 'loginRise .4s ease-out' }}>
          <span style={{ width: 58, height: 58, borderRadius: 'var(--r)', background: t.bg, border: `1px solid ${t.b}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={26} style={{ color: t.c }} />
          </span>

          {code && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: t.c, marginTop: 18 }}>ERROR {code}</div>}
          <div style={{ fontSize: 26, fontWeight: 760, letterSpacing: '-.022em', color: 'var(--ink)', marginTop: code ? 6 : 18 }}>{title}</div>
          <div style={{ fontSize: '13.75px', color: 'var(--mut)', marginTop: 8, lineHeight: 1.6, maxWidth: 430, marginLeft: 'auto', marginRight: 'auto' }}>{sub}</div>

          {detail && (
            <div style={{ marginTop: 20, padding: '13px 15px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', textAlign: 'left' }}>
              {detail}
            </div>
          )}

          {actions && <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>{actions}</div>}
          {meta && <div style={{ fontSize: '11.75px', color: 'var(--faint)', marginTop: 22, fontFamily: 'var(--mono)' }}>{meta}</div>}
        </div>
      </div>

      <div style={{ flex: 'none', padding: '14px 26px', borderTop: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: 'var(--mut)', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />All systems operational</span>
        <span style={{ opacity: .4 }}>·</span><span>Tanflow Cloud v6.2.1</span>
        <span style={{ marginLeft: 'auto' }}><span className="link">Status page</span> · <span className="link">Support</span></span>
      </div>
    </LoginShell>
  )
}

// Shared detail row used by several status screens.
export const DetailRow = ({ k, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '5px 0', fontSize: '12.25px' }}>
    <span style={{ color: 'var(--mut)', flex: 'none' }}>{k}</span>
    <span style={{ color: 'var(--ink)', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
  </div>
)
