import { createContext, useContext, useState, useRef, useLayoutEffect, useCallback } from 'react'

const TooltipContext = createContext(null)
export const useTooltip = () => useContext(TooltipContext)

// Renders the chart hover tooltip content (title + coloured rows).
// rows: [{ c, n, v }]
export function TipContent({ title, rows }) {
  return (
    <>
      <div className="vt-t">{title}</div>
      {rows.map((r, i) => (
        <div className="vt-row" key={i}>
          <span className="sw" style={{ background: r.c }} />{r.n}<b>{r.v}</b>
        </div>
      ))}
    </>
  )
}

// Provides showTip/hideTip and renders a single viewport-positioned tooltip,
// replicating the original global #viz-tip behaviour with edge clamping.
export function TooltipProvider({ children }) {
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, content: null })
  const ref = useRef(null)

  const showTip = useCallback((x, y, content) => setTip({ visible: true, x, y, content }), [])
  const hideTip = useCallback(() => setTip((t) => (t.visible ? { ...t, visible: false } : t)), [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !tip.visible) return
    const r = el.getBoundingClientRect()
    let L = tip.x + 14, T = tip.y + 14
    if (L + r.width > window.innerWidth - 12) L = tip.x - r.width - 14
    if (T + r.height > window.innerHeight - 12) T = tip.y - r.height - 14
    el.style.left = L + 'px'
    el.style.top = T + 'px'
  }, [tip])

  return (
    <TooltipContext.Provider value={{ showTip, hideTip }}>
      {children}
      <div className="viz-tip" ref={ref} style={{ opacity: tip.visible ? 1 : 0 }}>
        {tip.content}
      </div>
    </TooltipContext.Provider>
  )
}
