import Icon from './Icon.jsx'
import { PROTO_META } from '../data/protocolSchema.js'

// Brand mark for a protocol / DB client — a vendor logo when one exists on disk,
// otherwise a brand-coloured icon.
export default function ProtoMark({ id, size = 40 }) {
  const m = PROTO_META[id] || {}
  if (m.logo) return <img src={`assets/logos/${m.logo}.svg`} alt={m.name} style={{ height: Math.round(size * 0.72), maxWidth: size * 2.2, objectFit: 'contain' }} />
  return <Icon name={m.icon || 'link'} size={size} style={{ color: m.color || 'var(--mut)' }} />
}
