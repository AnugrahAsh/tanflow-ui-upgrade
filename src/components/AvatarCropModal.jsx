import { useState, useRef } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

/* §7 — profile-picture upload and crop. Pure DOM: the "image" is transformed
   inside a round mask, so there is no canvas dependency and no vendor CSS. */

const BOX = 260

export default function AvatarCropModal({ name = 'Anika Rao', onClose, onSave }) {
  const { toast } = useApp()
  const [src, setSrc] = useState(null)
  const [zoom, setZoom] = useState(1.2)
  const [rot, setRot] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const fileRef = useRef(null)
  const dragRef = useRef(null)

  const pick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast('warn', 'Not an image', 'Choose a PNG, JPG or WebP file.'); return }
    if (file.size > 5 * 1024 * 1024) { toast('warn', 'File too large', 'Profile pictures must be under 5 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setSrc(reader.result); setZoom(1.2); setRot(0); setPos({ x: 0, y: 0 }) }
    reader.readAsDataURL(file)
  }

  const startDrag = (e) => {
    if (!src) return
    e.preventDefault()
    const sx = e.clientX, sy = e.clientY, o = { ...pos }
    dragRef.current = true
    const move = (ev) => setPos({ x: o.x + (ev.clientX - sx), y: o.y + (ev.clientY - sy) })
    const end = () => { dragRef.current = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', end)
  }

  const save = () => {
    if (!src) { toast('warn', 'No image', 'Choose a picture to upload first.'); return }
    onSave?.(src)
    toast('ok', 'Profile picture updated', 'Your new picture is visible to your organisation (demo).')
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.45)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(480px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="user" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>Profile picture</div><div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>{name}</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          {/* crop stage */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div onMouseDown={startDrag}
              style={{ width: BOX, height: BOX, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: 'var(--surface-3)', border: '1px solid var(--line-2)', cursor: src ? 'grab' : 'default', flex: 'none' }}>
              {src ? (
                <img src={src} alt="" draggable={false}
                  style={{ position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${zoom}) rotate(${rot}deg)`, transformOrigin: 'center', userSelect: 'none', pointerEvents: 'none' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--faint)' }}>
                  <Icon name="upload" size={26} />
                  <span style={{ fontSize: '12.25px', maxWidth: 170, textAlign: 'center', lineHeight: 1.5 }}>Choose an image to crop</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 0 0 2px rgba(15,98,254,.35)', pointerEvents: 'none' }} />
            </div>
          </div>

          {src && (
            <>
              <div style={{ marginTop: 16 }}>
                <div className="hrow" style={{ justifyContent: 'space-between', fontSize: '11.75px', color: 'var(--mut)', marginBottom: 5 }}><span>Zoom</span><span className="mono">{zoom.toFixed(2)}×</span></div>
                <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <div className="hrow" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-sec btn-sm" onClick={() => setRot((r) => r - 90)}><Icon name="refresh" size={13} style={{ transform: 'scaleX(-1)' }} />Rotate left</button>
                <button className="btn btn-sec btn-sm" onClick={() => setRot((r) => r + 90)}><Icon name="refresh" size={13} />Rotate right</button>
                <button className="btn btn-sec btn-sm" onClick={() => { setZoom(1.2); setRot(0); setPos({ x: 0, y: 0 }) }}>Reset</button>
                <button className="btn btn-sec btn-sm" style={{ marginLeft: 'auto' }} onClick={() => fileRef.current?.click()}><Icon name="upload" size={13} />Replace</button>
              </div>
              <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 10 }}>Drag the picture to reposition it inside the circle.</div>
            </>
          )}

          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} style={{ display: 'none' }} />

          {!src && (
            <button className="btn btn-sec" style={{ width: '100%', justifyContent: 'center', height: 42, marginTop: 16 }} onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={15} />Choose image
            </button>
          )}

          <div style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: 12, lineHeight: 1.5 }}>PNG, JPG or WebP · up to 5 MB · stored with your identity record.</div>

          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!src} style={!src ? { opacity: .55, cursor: 'not-allowed' } : undefined} onClick={save}><Icon name="check" />Save picture</button>
          </div>
        </div>
      </div>
    </div>
  )
}
