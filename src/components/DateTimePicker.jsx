import Icon from './Icon.jsx'

/* §7 — Horizon-native date / date-time field.
   Replaces the react-datepicker wrapper the app carried a CSS carve-out for:
   this uses the platform control styled with `.inp`, so no vendor CSS and no
   `.form-control` override is needed. */

export default function DateTimePicker({ value, onChange, withTime = true, label, help, min, max, disabled, required, style }) {
  const type = withTime ? 'datetime-local' : 'date'
  const field = (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        className="inp" type={type} value={value || ''} min={min} max={max} disabled={disabled} required={required}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ paddingRight: 30, colorScheme: 'light', ...style }}
      />
      <Icon name={withTime ? 'clock' : 'calendar'} size={14} style={{ position: 'absolute', right: 9, color: 'var(--faint)', pointerEvents: 'none' }} />
    </div>
  )
  if (!label) return field
  return (
    <div className="field">
      <label>{label}{required && <span style={{ color: 'var(--bad)' }}> *</span>}</label>
      {field}
      {help && <div className="f-help">{help}</div>}
    </div>
  )
}

// Quick-pick relative windows, used next to an expiry field.
export function DurationChips({ value, onChange, options = ['1 hour', '8 hours', '24 hours', '7 days', '30 days'] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map((o) => {
        const on = o === value
        return (
          <button key={o} type="button" onClick={() => onChange?.(o)}
            style={{ padding: '5px 10px', borderRadius: 'var(--r-sm)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: on ? 'var(--accent-bg)' : 'var(--surface)', border: `1px solid ${on ? 'var(--accent)' : 'var(--line-2)'}`, color: on ? 'var(--accent)' : 'var(--ink-2)' }}>{o}</button>
        )
      })}
    </div>
  )
}
