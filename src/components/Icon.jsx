import { ICONS } from '../lib/icons.js'

// Idiomatic replacement for the original `ic(name, size)` helper.
// Renders the registered path markup inside a stroked 24x24 SVG.
export default function Icon({ name, size = 16, className, style, ...rest }) {
  const inner = ICONS[name] || ICONS.overview
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: inner }}
      {...rest}
    />
  )
}
