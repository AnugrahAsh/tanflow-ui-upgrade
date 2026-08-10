import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import RecordingExportModal from './RecordingExportModal.jsx'
import SessionTypescript from './SessionTypescript.jsx'

const DURATION = 662 // 11:02
const SPEED_MULT = [1, 1.5, 2]
const fmtPos = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const toSec = (t) => { const [m, s] = t.split(':').map(Number); return m * 60 + s }
// [label time, description, seconds] — seconds drive the seek + timeline markers.
const BOOKMARKS = [['0:53', 'login'], ['3:32', 'window opened'], ['6:37', 'config change'], ['9:16', 'file transfer'], ['10:36', 'logout']].map(([t, l]) => [t, l, toSec(t)])
const SPEEDS = ['1x', '1.5x', '2x']
// deterministic little activity waveform
const wavePath = (seed, amp, base) => {
  const pts = []
  for (let x = 0; x <= 100; x += 2) { const y = base - amp * Math.abs(Math.sin((x * 0.6 + seed) * 0.7) * Math.cos((x + seed) * 0.23)); pts.push(`${x} ${y.toFixed(1)}`) }
  return 'M ' + pts.join(' L ')
}

// Simplified recorded Windows "Server Manager" screen (decorative).
function MockScreen() {
  const roles = [['Local Server', '#C0392B'], ['All Servers', '#C0392B'], ['File and Storage', '#5A5F66']]
  return (
    <div style={{ background: 'linear-gradient(160deg,#0f3b6e,#0a1f3f)', padding: '18px 22px', minHeight: 280, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1000, background: '#fff', borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,.4)' }}>
        <div style={{ background: '#f3f3f3', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#222', fontWeight: 600 }}>
          <span className="hrow" style={{ gap: 7 }}><Icon name="server" size={13} />Server Manager · Dashboard</span>
          <span style={{ color: '#666', letterSpacing: 2 }}>— ▢ ✕</span>
        </div>
        <div style={{ display: 'flex', minHeight: 220 }}>
          <div style={{ width: 150, background: '#1c1c1c', color: '#ddd', fontSize: 12.5, padding: '8px 0', flex: 'none' }}>
            {['Dashboard', 'Local Server', 'All Servers', 'File and Storage ▸', 'IIS'].map((s, i) => (
              <div key={s} style={{ padding: '8px 14px', background: i === 0 ? '#0a6cbf' : 'transparent', color: i === 0 ? '#fff' : '#ccc' }}>{i === 0 ? '▦ ' : ''}{s}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: '16px 20px', color: '#222' }}>
            <div style={{ color: '#0a6cbf', fontSize: 15, fontWeight: 600, marginBottom: 14 }}>WELCOME TO SERVER MANAGER</div>
            <div className="hrow" style={{ gap: 22, alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ width: 130, height: 78, background: '#e8871e', color: '#fff', fontSize: 12, fontWeight: 700, padding: 10, flex: 'none' }}>QUICK START</div>
              <div style={{ color: '#0a6cbf', fontSize: 13, lineHeight: 1.9 }}>{['1. Configure this local server', '2. Add roles and features', '3. Add other servers to manage', '4. Create a server group'].map((t) => <div key={t}>{t}</div>)}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#333', letterSpacing: '.03em' }}>ROLES AND SERVER GROUPS</div>
            <div style={{ fontSize: 11, color: '#777', margin: '3px 0 10px' }}>Roles: 1 | Server groups: 1 | Servers total: 1</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {roles.map(([r, c]) => (
                <div key={r} style={{ border: '1px solid #e2e2e2' }}>
                  <div style={{ background: c, color: '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}><span>{r}</span><span>1</span></div>
                  <div style={{ padding: '8px 10px', fontSize: 11.5, color: '#333', lineHeight: 1.7 }}>Manageability<br />Events<br />Services<br />Performance</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: '#1c1c1c', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="grid" size={15} style={{ color: '#9aa' }} />
          <div style={{ flex: 1, maxWidth: 260, background: '#2a2a2a', borderRadius: 20, padding: '5px 12px', color: '#8a9', fontSize: 12 }}>🔍 Type here to search</div>
          <Icon name="folder" size={15} style={{ color: '#9aa' }} /><Icon name="list" size={15} style={{ color: '#9aa' }} />
          <div style={{ marginLeft: 'auto', color: '#cdd', fontSize: 11, textAlign: 'right', lineHeight: 1.3 }}>3:12 AM<br /><span style={{ color: '#8a9' }}>10.16.2.9</span></div>
        </div>
      </div>
    </div>
  )
}

export default function RecordingPlayer({ rec, onClose }) {
  const { toast } = useApp()
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0)
  const [screen, setScreen] = useState(true)
  const [keys, setKeys] = useState(true)
  const [logs, setLogs] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [fs, setFs] = useState(false)
  const [pos, setPos] = useState(0)
  const seek = (d) => setPos((p) => Math.max(0, Math.min(DURATION, p + d)))
  useEffect(() => {
    if (!playing) return undefined
    const mult = SPEED_MULT[speed]
    const t = setInterval(() => setPos((p) => (p >= DURATION ? DURATION : p + mult)), 500)
    return () => clearInterval(t)
  }, [playing, speed])
  useEffect(() => { if (pos >= DURATION && playing) setPlaying(false) }, [pos, playing])
  const pct = (pos / DURATION) * 100
  const chip = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, background: '#161b2e', color: '#c7cede', fontSize: 12, cursor: 'pointer', border: '1px solid #232a44' }
  const chipOn = { ...chip, background: '#241d47', color: '#e9e2ff', borderColor: '#7c5cf0' }
  // The bookmark the playhead currently sits in (last one at/before pos).
  const activeMark = BOOKMARKS.reduce((acc, b) => (pos + 0.5 >= b[2] ? b[2] : acc), null)
  const jump = (t, l, sec) => { setPos(sec); toast('ok', `Seek ${t}`, `Jumped to “${l}” (demo).`) }

  return (
    <div style={{ position: fs ? 'fixed' : 'relative', inset: fs ? 0 : undefined, zIndex: fs ? 300 : undefined, background: '#0a0e1c', borderRadius: fs ? 0 : 'var(--r)', overflow: 'hidden', marginBottom: fs ? 0 : 16, boxShadow: 'var(--sh-lg)', display: 'flex', flexDirection: 'column', height: fs ? '100vh' : undefined }}>
      {/* header */}
      <div className="hrow" style={{ justifyContent: 'space-between', padding: '12px 16px', background: '#0b1020', flex: 'none' }}>
        <button className="hrow" onClick={onClose} style={{ gap: 7, background: '#161b2e', color: '#c7cede', borderRadius: 'var(--r-sm)', padding: '7px 12px', fontSize: 13, fontWeight: 600, border: '1px solid #232a44' }}><Icon name="chevL" size={14} />Exit</button>
        <div className="hrow" style={{ gap: 10 }}><Icon name="calendar" size={15} style={{ color: '#a78bfa' }} /><span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Session Recording</span><span className="mono" style={{ fontSize: 11.5, color: '#8b93a7', background: '#141a2c', border: '1px solid #232a44', borderRadius: 'var(--r-sm)', padding: '4px 10px' }}>{rec.recId}</span></div>
        <button className="hrow" onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#161b2e', color: '#c7cede', border: '1px solid #232a44', justifyContent: 'center' }}><Icon name="x" size={15} /></button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>{screen ? <MockScreen /> : <div style={{ minHeight: 280, background: '#0a0e1c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a6480', fontSize: 13 }}>Screen stream hidden</div>}</div>

          {/* waveform */}
          <div style={{ background: '#0a0e1c', padding: '10px 16px 0', flex: 'none' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos(Math.max(0, Math.min(DURATION, ((e.clientX - r.left) / r.width) * DURATION))) }}>
              <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: '100%', height: 64, display: 'block' }}>
                <defs><linearGradient id="wv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f6df6" stopOpacity=".5" /><stop offset="1" stopColor="#2f6df6" stopOpacity="0" /></linearGradient></defs>
                <path d={wavePath(3, 9, 22) + ' L 100 24 L 0 24 Z'} fill="url(#wv)" />
                {screen && <path d={wavePath(3, 9, 22)} fill="none" stroke="#4d84ff" strokeWidth=".6" />}
                {keys && <path d={wavePath(11, 7, 20)} fill="none" stroke="#22c55e" strokeWidth=".6" />}
              </svg>
              {BOOKMARKS.map(([t, l, sec]) => (
                <div key={t} title={`${t} — ${l}`} onClick={(e) => { e.stopPropagation(); jump(t, l, sec) }}
                  style={{ position: 'absolute', top: 0, bottom: 0, left: `${(sec / DURATION) * 100}%`, width: 2, marginLeft: -1, background: activeMark === sec ? '#a78bfa' : 'rgba(167,139,250,.45)', cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: -3, left: -2.5, width: 7, height: 7, borderRadius: '50%', background: activeMark === sec ? '#a78bfa' : '#6d5bb0' }} />
                </div>
              ))}
              <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${pct}%`, width: 2, background: '#fff', boxShadow: '0 0 6px rgba(255,255,255,.6)', pointerEvents: 'none' }}><span style={{ position: 'absolute', top: -4, left: -3, width: 8, height: 8, borderRadius: '50%', background: '#fff' }} /></div>
            </div>
            <div className="hrow" style={{ justifyContent: 'space-between', fontSize: 11, color: '#6b7590', marginTop: 2 }}><span className="mono" style={{ color: '#c7cede' }}>{fmtPos(pos)}</span><span>11:02</span></div>
            <div className="hrow" style={{ gap: 8, padding: '10px 0', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: '#5a6480' }}>BOOKMARKS</span>
              {BOOKMARKS.map(([t, l, sec]) => <button key={t} title={`Jump to ${t} — ${l}`} style={activeMark === sec ? chipOn : chip} onClick={() => jump(t, l, sec)}><Icon name="clock" size={12} style={{ color: '#a78bfa' }} />{t} {l}</button>)}
            </div>
          </div>

          {/* controls */}
          <div className="hrow" style={{ justifyContent: 'space-between', padding: '12px 16px', background: '#0b1020', flex: 'none', flexWrap: 'wrap', gap: 10 }}>
            <div className="hrow" style={{ gap: 8 }}>
              <button style={chip} onClick={() => setSpeed((s) => (s + 1) % SPEEDS.length)}>{SPEEDS[speed]}</button>
              <button style={{ ...chip, borderColor: screen ? '#3b82f6' : '#232a44' }} onClick={() => setScreen((v) => !v)}><span style={{ width: 9, height: 9, borderRadius: 3, background: '#3b82f6' }} />Screen</button>
              <button style={{ ...chip, borderColor: keys ? '#22c55e' : '#232a44' }} onClick={() => setKeys((v) => !v)}><span style={{ width: 9, height: 9, borderRadius: 3, background: '#22c55e' }} />Keys</button>
            </div>
            <div className="hrow" style={{ gap: 14 }}>
              <button title="Back 15s" onClick={() => seek(-15)} style={{ color: '#c7cede' }}><Icon name="chevL" size={20} /></button>
              <button onClick={() => setPlaying((p) => !p)} style={{ width: 52, height: 52, borderRadius: '50%', background: '#7C3AED', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,.5)' }}><Icon name={playing ? 'pause' : 'play'} size={20} /></button>
              <button title="Forward 15s" onClick={() => seek(15)} style={{ color: '#c7cede' }}><Icon name="chevR" size={20} /></button>
            </div>
            <div className="hrow" style={{ gap: 8 }}>
              <button style={chip} onClick={() => setExportOpen(true)}><Icon name="download" size={13} />Export</button>
              <button style={{ ...chip, background: logs ? '#7C3AED' : '#161b2e', color: '#fff', borderColor: logs ? '#7C3AED' : '#232a44' }} onClick={() => setLogs((v) => !v)}><Icon name="reports" size={13} />Logs</button>
              <button style={chip} onClick={() => setFs((v) => !v)}><Icon name={fs ? 'x' : 'external'} size={14} /></button>
            </div>
          </div>
        </div>

        {/* keystroke logs panel */}
        {logs && (
          <div style={{ width: 320, flex: 'none', background: '#0b1020', borderLeft: '1px solid #1c2340', display: 'flex', flexDirection: 'column' }}>
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '14px 16px' }}>
              <span className="hrow" style={{ gap: 8, color: '#fff', fontSize: 14, fontWeight: 700 }}><Icon name="reports" size={15} style={{ color: '#a78bfa' }} />Keystroke Logs <span style={{ color: '#6b7590' }}>0</span></span>
              <button onClick={() => setLogs(false)} style={{ color: '#8b93a7' }}><Icon name="x" size={15} /></button>
            </div>
            <div style={{ padding: '0 16px 14px' }}><input placeholder="Filter keystrokes…" style={{ width: '100%', background: '#141a2c', border: '1px solid #232a44', borderRadius: 'var(--r-sm)', padding: '8px 11px', color: '#c7cede', fontSize: 12.5 }} /></div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}><SessionTypescript compact /></div>
          </div>
        )}
      </div>

      {exportOpen && <RecordingExportModal rec={rec} onClose={() => setExportOpen(false)} />}
    </div>
  )
}
