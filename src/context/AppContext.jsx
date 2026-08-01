import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

let toastSeq = 0

export function AppProvider({ children }) {
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])
  const [drawer, setDrawer] = useState(null) // React node or null
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [flyout, setFlyout] = useState(null) // 'notif' | 'user' | null
  const timers = useRef({})

  // ── Toasts ──────────────────────────────────────────────────────────────
  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const toast = useCallback((type, title, sub) => {
    const id = ++toastSeq
    setToasts((list) => [...list, { id, type, title, sub, leaving: false }])
    timers.current[id] = setTimeout(() => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
      timers.current[id] = setTimeout(() => removeToast(id), 360)
    }, 4200)
  }, [removeToast])

  // ── Overlays ────────────────────────────────────────────────────────────
  const openDrawer = useCallback((node) => { setFlyout(null); setPaletteOpen(false); setDrawer(node) }, [])
  const closeDrawer = useCallback(() => setDrawer(null), [])
  const openPalette = useCallback(() => { setFlyout(null); setDrawer(null); setPaletteOpen(true) }, [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])
  const toggleFlyout = useCallback((mode = 'notif') => setFlyout((cur) => (cur === mode ? null : mode)), [])
  const closeFlyout = useCallback(() => setFlyout(null), [])
  const closeOverlays = useCallback(() => { setDrawer(null); setFlyout(null); setPaletteOpen(false) }, [])

  // ── Navigation ──────────────────────────────────────────────────────────
  const go = useCallback((id) => { closeOverlays(); navigate(`/${id}`) }, [navigate, closeOverlays])

  const value = {
    toasts, toast, removeToast,
    drawer, openDrawer, closeDrawer,
    paletteOpen, openPalette, closePalette,
    flyout, toggleFlyout, closeFlyout,
    closeOverlays, go,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
