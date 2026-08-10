import Icon from './Icon.jsx'

/* §7 — last-login stamp. Small, but it is how a user notices a sign-in that
   wasn't theirs, so it names the device and the origin. */

export default function LastLogin({ when = 'Yesterday, 23:26', ip = '10.20.4.11', device = 'Chrome · macOS', place = 'London, GB', onReview }) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)' }}>
      <div className="hrow" style={{ gap: 7, marginBottom: 5 }}>
        <Icon name="clock" size={12} style={{ color: 'var(--faint)', flex: 'none' }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>Last sign-in</span>
      </div>
      <div style={{ fontSize: '12.25px', fontWeight: 600, color: 'var(--ink)' }}>{when}</div>
      <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 2, lineHeight: 1.5 }}>
        {device} · <span className="mono">{ip}</span>{place ? ` · ${place}` : ''}
      </div>
      {onReview && (
        <span className="link" style={{ fontSize: '11.5px', display: 'inline-block', marginTop: 6 }} onClick={onReview}>Not you? Review activity</span>
      )}
    </div>
  )
}
