import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)' }
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const RAIL = [
  { id: 'overview', icon: 'shieldCheck', title: 'Session overview' },
  { id: 'clipboard', icon: 'copy', title: 'Clipboard' },
  { id: 'files', icon: 'folder', title: 'File transfer' },
  { id: 'share', icon: 'share2', title: 'Share session' },
  { id: 'devices', icon: 'settings', title: 'Devices & redirection' },
  { id: 'activity', icon: 'commands', title: 'Session activity', dot: true },
]
const FS = {
  'C:': [['Users', 'folder'], ['Windows', 'folder'], ['Program Files', 'folder'], ['Program Files (x86)', 'folder'], ['inetpub', 'folder'], ['PerfLogs', 'folder'], ['pagefile.sys', 'restricted']],
  'C:/Users': [['Administrator', 'folder'], ['Public', 'folder'], ['svc-deploy', 'folder'], ['desktop.ini', 'file']],
  'C:/Windows': [['System32', 'folder'], ['SysWOW64', 'folder'], ['Temp', 'folder'], ['explorer.exe', 'file'], ['notepad.exe', 'file']],
  'C:/inetpub': [['wwwroot', 'folder'], ['logs', 'folder'], ['temp', 'folder']],
}
const CMDS = [
  ['00:12', 'Get-Service payments-gw', false],
  ['00:34', 'Restart-Service replication-agent', false],
  ['01:05', 'net user svc_deploy /active:yes', false],
  ['02:18', 'Stop-Computer -Force — blocked (policy deny)', true],
  ['03:02', 'Export-EventLog Security', false],
]
const hms = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':')

/* ─── Remote desktop mock (Windows Server Manager over RDP) ─────────────── */
function RemoteDesktop() {
  const groups = [['Local Server', '#C1362C'], ['All Servers', '#C1362C'], ['File and Storage', '#5B6470']]
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0C4A73 0%, #1466A0 55%, #2C7FBE 100%)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: 'clamp(16px, 3vw, 40px)', minHeight: 0 }}>
        <div style={{ background: '#F0F0F0', borderRadius: 3, boxShadow: '0 12px 40px rgba(0,0,0,.35)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,.2)' }}>
          <div style={{ height: 34, background: '#FFF', borderBottom: '1px solid #E1E1E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 0 12px', flex: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: '#333' }}><Icon name="server" size={15} style={{ color: '#4a72b0' }} />Server Manager · Dashboard</div>
            <div style={{ display: 'flex' }}>{['minimize2', 'maximize', 'x'].map((i) => <span key={i} style={{ width: 40, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}><Icon name={i} size={13} /></span>)}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <div style={{ width: 190, background: '#2B2B2B', color: '#DDD', padding: '10px 0', flex: 'none', fontSize: 13 }}>
              {[['Dashboard', true], ['Local Server'], ['All Servers'], ['File and Storage ▸'], ['IIS']].map(([t, on]) => (
                <div key={t} style={{ padding: '9px 16px', background: on ? '#1F6FC2' : 'transparent', color: on ? '#fff' : '#CFCFCF', display: 'flex', alignItems: 'center', gap: 8 }}>{on && <Icon name="grid" size={13} />}{t}</div>
              ))}
            </div>
            <div style={{ flex: 1, background: '#F4F4F4', padding: '18px 22px', overflow: 'auto', minWidth: 0 }}>
              <div style={{ fontSize: 17, color: '#1F6FC2', fontWeight: 500 }}>WELCOME TO SERVER MANAGER</div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 150, height: 96, background: '#D97E1E', color: '#fff', fontSize: 12, fontWeight: 700, padding: 12, flex: 'none' }}>QUICK START</div>
                <div style={{ fontSize: 13, color: '#1F6FC2', display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 4 }}>
                  {['1. Configure this local server', '2. Add roles and features', '3. Add other servers to manage', '4. Create a server group'].map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#444', marginTop: 22 }}>ROLES AND SERVER GROUPS</div>
              <div style={{ fontSize: 11.5, color: '#777', marginTop: 3 }}>Roles: 1 | Server groups: 1 | Servers total: 1</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 12 }}>
                {groups.map(([t, c]) => (
                  <div key={t} style={{ background: '#fff', border: '1px solid #E0E0E0' }}>
                    <div style={{ background: c, color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '6px 10px', display: 'flex', justifyContent: 'space-between' }}>{t}<span>1</span></div>
                    <div style={{ padding: '10px 12px', fontSize: 12, color: '#444', display: 'flex', flexDirection: 'column', gap: 5 }}>{['Manageability', 'Events', 'Services', 'Performance'].map((r) => <span key={r}>{r}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 40, background: '#1B1B1B', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', flex: 'none' }}>
        <Icon name="windows" size={17} style={{ color: '#4a9fe0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2B2B2B', borderRadius: 3, padding: '5px 12px', width: 230, color: '#8A8A8A', fontSize: 12 }}><Icon name="search" size={13} />Type here to search</div>
        <Icon name="folder" size={16} style={{ color: '#E0B54A' }} />
        <Icon name="server" size={16} style={{ color: '#9AB4D4' }} />
        <div style={{ marginLeft: 'auto', textAlign: 'right', color: '#DDD', fontSize: 11.5, lineHeight: 1.3 }}><div>3:12 AM</div><div style={{ color: '#9A9A9A' }}>192.168.1.80</div></div>
      </div>
    </div>
  )
}

/* ─── Reusable bits ─────────────────────────────────────────────────────── */
const Tile = ({ k, v, u }) => (
  <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '9px 11px' }}>
    <div style={lbl}>{k}</div>
    <div style={{ fontSize: 18, fontWeight: 750, color: 'var(--ink)', marginTop: 3 }}>{v}{u && <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--mut)', marginLeft: 3 }}>{u}</span>}</div>
  </div>
)
const QAct = ({ icon, text, danger, onClick }) => (
  <button onClick={onClick} className="hrow" style={{ gap: 8, padding: '10px 11px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', fontSize: '12.5px', fontWeight: 600, color: danger ? 'var(--bad)' : 'var(--ink-2)', background: 'var(--surface)', justifyContent: 'flex-start' }}><Icon name={icon} size={14} style={{ color: danger ? 'var(--bad)' : 'var(--mut)' }} />{text}</button>
)
const Toggle = ({ on, onClick }) => <span className={`toggle ${on ? 'on' : ''}`} onClick={onClick} />

export default function SessionConsole() {
  const { toast } = useApp()
  const navigate = useNavigate()
  const { target } = useParams()
  const [sp] = useSearchParams()
  const proto = sp.get('proto') || 'RDP'
  const host = sp.get('host') || '192.168.1.80'
  const env = (sp.get('env') || 'Prod')
  const user = sp.get('user') || (proto === 'RDP' ? 'Administrator' : 'root')
  const name = target || 'TANFLOWAD01'

  const [tab, setTab] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [fs, setFs] = useState(false)
  const [sec, setSec] = useState(0)
  const [logo, setLogo] = useState({ x: 18, y: 74 })
  const [tel, setTel] = useState({ lat: 20, jit: 0.9, rx: 4.9, tx: 2.2 })
  const [clip, setClip] = useState('WARN replica lag 42s on shard eu-2')
  const [path, setPath] = useState('C:')
  const [expires, setExpires] = useState('10 min')
  const [recipient, setRecipient] = useState('')
  const [participants, setParticipants] = useState([
    { name: 'You', role: 'Owner · full control', live: true },
    { name: 'S. Okafor (SOC)', role: 'Watching · read-only' },
    { name: 'Change #4821', role: 'Approver · idle' },
  ])
  const [dev, setDev] = useState({ clip: true, file: true, audio: true, printer: false, drive: false })
  const movedRef = useRef(false)

  useEffect(() => { const t = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(t) }, [])
  useEffect(() => {
    const t = setInterval(() => setTel((v) => ({ lat: 17 + Math.round(Math.random() * 7), jit: +(0.5 + Math.random() * 0.9).toFixed(1), rx: +(v.rx + 0.1).toFixed(1), tx: +(v.tx + 0.05).toFixed(1) })), 2000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const toggleFs = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.() }
  const close = () => { if (document.fullscreenElement) document.exitFullscreen?.(); navigate(-1) }
  const listing = FS[path] || [['(folder is empty)', 'info']]
  const up = () => { if (path.includes('/')) setPath(path.slice(0, path.lastIndexOf('/'))) }
  const dt = (k) => setDev((d) => ({ ...d, [k]: !d[k] }))

  // Draggable glass logo — mouse + touch, distinguishing a click (reopen) from
  // a drag (move). Works for real pointers and synthetic mouse events alike.
  const startDrag = (e) => {
    const pt = e.touches ? e.touches[0] : e
    const sx = pt.clientX, sy = pt.clientY, ox = logo.x, oy = logo.y
    movedRef.current = false
    document.body.style.userSelect = 'none'
    const move = (ev) => {
      const p = ev.touches ? ev.touches[0] : ev
      const dx = p.clientX - sx, dy = p.clientY - sy
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true
      setLogo({ x: clamp(ox + dx, 6, window.innerWidth - 66), y: clamp(oy + dy, 60, window.innerHeight - 66) })
      if (ev.cancelable) ev.preventDefault()
    }
    const end = () => {
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end)
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end)
      if (!movedRef.current) setCollapsed(false) // reopen on a click (no drag) — covers envs that skip the click event
    }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', end)
    window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', end)
  }

  const panel = useMemo(() => ({
    overview: (
      <>
        <div style={{ ...lbl, marginBottom: 8 }}>Live telemetry</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <Tile k="Latency" v={tel.lat} u="ms" /><Tile k="Jitter" v={tel.jit} u="ms" /><Tile k="Received" v={tel.rx} u="MB" /><Tile k="Sent" v={tel.tx} u="MB" />
        </div>
        <div style={{ marginTop: 16, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
          <div className="hrow" style={{ gap: 8, padding: '9px 12px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hair)' }}><Icon name="shieldCheck" size={14} style={{ color: 'var(--ok)' }} /><span style={{ fontSize: '12.5px', fontWeight: 700 }}>Secure channel</span></div>
          <div style={{ padding: '4px 12px' }}>
            {[['Gateway', 'eu-central-1a'], ['Cipher', 'AES-256-GCM · TLS 1.3'], ['Credential', 'Vaulted · rotates on check-in', 'ok'], ['MFA', 'FIDO2 · verified']].map(([k, v, tone]) => (
              <div key={k} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--hair)' }}><span style={{ fontSize: '12px', color: 'var(--mut)' }}>{k}</span><span style={{ fontSize: '12px', fontWeight: 600, color: tone === 'ok' ? 'var(--ok)' : 'var(--ink)', textAlign: 'right' }}>{v}</span></div>
            ))}
          </div>
        </div>
        <div style={{ ...lbl, margin: '18px 0 8px' }}>Quick actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <QAct icon="lock" text="Lock screen" onClick={() => toast('ok', 'Screen locked', `${name} locked — session stays connected (demo).`)} />
          <QAct icon="zap" text="Elevate (JIT)" onClick={() => toast('ok', 'JIT elevation', 'Requested 15-min privilege elevation — pending approval (demo).')} />
          <QAct icon="folder" text="Transfer files" onClick={() => setTab('files')} />
          <QAct icon="logout" text="Terminate" danger onClick={close} />
        </div>
        <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 16, padding: '11px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)' }}><Icon name="shieldCheck" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} /><div style={{ fontSize: '11.75px', color: 'var(--ink-2)', lineHeight: 1.5 }}><b>Command policy active.</b> Blocked commands are denied inline and bookmarked in the recording for {name}.</div></div>
      </>
    ),
    clipboard: (
      <>
        <div style={{ ...lbl, marginBottom: 6 }}>Session clipboard</div>
        <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.5, marginBottom: 10 }}>Text copied inside the session lands here — DLP-scanned before it crosses the boundary.</div>
        <textarea value={clip} onChange={(e) => setClip(e.target.value)} rows={3} style={{ width: '100%', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: '9px 11px', fontSize: '12.5px', fontFamily: 'var(--mono)', color: 'var(--ink)', resize: 'vertical', outline: 'none' }} />
        <div className="hrow" style={{ gap: 8, marginTop: 10 }}>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Copied to local', 'Clipboard copied out — DLP scan passed (demo).')}><Icon name="copy" size={13} />Copy to local</button>
          <button className="btn btn-sec btn-sm" onClick={() => setClip('')}>Clear</button>
        </div>
        <div className="hrow" style={{ gap: 8, margin: '20px 0 4px' }}><Icon name="list" size={13} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '12.5px', fontWeight: 700 }}>Clipboard history</span></div>
        {[['IN', 'WARN replica lag 42s on shard eu-2', false], ['OUT', 'kubectl rollout restart deploy/replication-agent', false], ['IN', '-----BEGIN RSA PRIVATE DLP KEY-----', true]].map(([dir, text, blocked], i) => (
          <div key={i} className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '10px 11px', borderRadius: 'var(--r-sm)', marginTop: 8, background: blocked ? 'var(--bad-bg)' : 'var(--surface-2)', border: `1px solid ${blocked ? 'var(--bad-line)' : 'var(--hair)'}` }}>
            <span style={{ ...lbl, color: blocked ? 'var(--bad)' : 'var(--faint)', width: 26, flex: 'none', marginTop: 1 }}>{dir}</span>
            <span className="mono" style={{ flex: 1, fontSize: '11.5px', color: blocked ? 'var(--bad)' : 'var(--ink-2)', wordBreak: 'break-all' }}>{text}</span>
            <Icon name={blocked ? 'ban' : 'check'} size={13} style={{ color: blocked ? 'var(--bad)' : 'var(--ok)', flex: 'none', marginTop: 1 }} />
          </div>
        ))}
      </>
    ),
    files: (
      <>
        <div style={{ ...lbl, marginBottom: 8 }}>File browser · SFTP</div>
        <div className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-2)', marginBottom: 10 }}>{path.replace(/\//g, '\\')}</div>
        <div className="hrow" style={{ gap: 8, marginBottom: 12 }}>
          <button className="btn btn-sec btn-sm" onClick={up} disabled={!path.includes('/')} style={{ opacity: path.includes('/') ? 1 : .5 }}><Icon name="chevL" size={13} />Up</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Upload', 'Choose a local file to stream to the target (AV + DLP scanned) (demo).')}><Icon name="upload" size={13} />Upload</button>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Download', 'Selected files streamed to your device (demo).')}><Icon name="download" size={13} />Download</button>
        </div>
        {listing.map(([n, kind]) => (
          <div key={n} onClick={() => kind === 'folder' && setPath(`${path}/${n}`)} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '10px 11px', borderBottom: '1px solid var(--hair)', cursor: kind === 'folder' ? 'pointer' : 'default' }}>
            <span className="hrow" style={{ gap: 10, minWidth: 0 }}><Icon name={kind === 'restricted' ? 'lock' : kind === 'file' ? 'reports' : 'folder'} size={15} style={{ color: kind === 'restricted' ? 'var(--bad)' : kind === 'folder' ? '#E0A93A' : 'var(--mut)', flex: 'none' }} /><span className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{n}</span></span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: kind === 'restricted' ? 'var(--bad)' : 'var(--faint)' }}>{kind === 'restricted' ? 'Restricted' : kind === 'file' ? 'File' : kind === 'folder' ? 'Folder' : ''}</span>
          </div>
        ))}
        <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 14, lineHeight: 1.5 }}>Transfers stream through the gateway with AV + DLP scan and are recorded as session artifacts · 90-day retention.</div>
      </>
    ),
    share: (
      <>
        <div style={{ ...lbl, marginBottom: 6 }}>Share this session</div>
        <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.5, marginBottom: 12 }}>Send a single-use, email-bound link inviting a viewer to shadow this live session. Everything they see is recorded.</div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 13 }}>
          <div className="hrow" style={{ gap: 8, marginBottom: 12 }}><Icon name="share2" size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '12.5px', fontWeight: 700 }}>New invitation</span></div>
          <div className="field" style={{ marginBottom: 11 }}><label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Sharing profile</label><select className="sel"><option>Read-only viewer · read-only</option><option>Collaborator · input allowed</option><option>Approver · read-only</option></select></div>
          <div className="field" style={{ marginBottom: 11 }}><label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Recipient email</label><input className="inp" placeholder="invitee@example.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} /></div>
          <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Expires after</label>
          <div className="seg" style={{ marginBottom: 13 }}>{['10 min', '30 min', '60 min'].map((x) => <button key={x} className={expires === x ? 'on' : ''} onClick={() => setExpires(x)}>{x}</button>)}</div>
          <button className="btn btn-pri" style={{ width: '100%', justifyContent: 'center' }} onClick={() => toast('ok', 'Share link created', `Single-use link ${recipient ? `sent to ${recipient}` : 'created'} · expires in ${expires} (demo).`)}><Icon name="mail" size={14} />Create share link</button>
        </div>
        <div className="hrow" style={{ gap: 8, margin: '18px 0 8px' }}><Icon name="users" size={14} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '12.5px', fontWeight: 700 }}>Active participants</span></div>
        {participants.map((p) => (
          <div key={p.name} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
            <div className="hrow" style={{ gap: 10, minWidth: 0 }}><span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--mut)', flex: 'none' }}>{p.name.split(/[ .]/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: '12.75px', fontWeight: 650, color: 'var(--ink)' }}>{p.name}</div><div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{p.role}</div></div></div>
            {p.live ? <span className="hrow" style={{ gap: 5, fontSize: '11px', fontWeight: 600, color: 'var(--ok)', flex: 'none' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} />live</span>
              : <button className="btn btn-sec btn-sm" onClick={() => { setParticipants((ps) => ps.filter((x) => x.name !== p.name)); toast('warn', 'Access revoked', `${p.name} removed from the session (demo).`) }}>Revoke</button>}
          </div>
        ))}
      </>
    ),
    devices: (
      <>
        <div style={{ ...lbl, marginBottom: 10 }}>Peripheral redirection</div>
        {[['clip', 'Clipboard sync', 'DLP-scanned both directions'], ['file', 'File transfer (SFTP)', 'AV + DLP on every file'], ['audio', 'Audio redirection', ''], ['printer', 'Printer redirection', 'Watermarked spool'], ['drive', 'Drive mapping', 'Ephemeral, session-scoped']].map(([k, t, s]) => (
          <div key={k} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--hair)' }}>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{t}</div>{s && <div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{s}</div>}</div>
            <Toggle on={dev[k]} onClick={() => dt(k)} />
          </div>
        ))}
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '11px 0' }}>
          <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>USB redirection</div><div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>Blocked by policy</div></div>
          <span className="link" style={{ fontSize: '12px', color: 'var(--bad)' }} onClick={() => toast('warn', 'USB redirection', 'Blocked by the Prod-Deny device policy — exempt on the policy, not here (demo).')}>Policy</span>
        </div>
        <div style={{ ...lbl, margin: '18px 0 10px' }}>Display</div>
        <div className="field" style={{ marginBottom: 12 }}><label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Resolution</label><select className="sel"><option>Fit to window</option><option>1920 × 1080</option><option>1440 × 900</option><option>1280 × 720</option></select></div>
        <div className="field"><label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5 }}>Keyboard layout</label><select className="sel"><option>en-US</option><option>en-GB</option><option>de-DE</option><option>fr-FR</option></select></div>
      </>
    ),
    activity: (
      <>
        <div style={{ ...lbl, marginBottom: 6 }}>Session activity</div>
        <div style={{ fontSize: '11.75px', color: 'var(--mut)', lineHeight: 1.5, marginBottom: 12 }}>Every keystroke and command is recorded. Policy hits are bookmarked in the replay for one-click jump.</div>
        <div className="hrow" style={{ gap: 8, marginBottom: 4 }}><Icon name="commands" size={13} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '12.5px', fontWeight: 700 }}>Command timeline</span></div>
        {CMDS.map(([t, c, blocked]) => (
          <div key={t} className="hrow" style={{ gap: 12, alignItems: 'flex-start', padding: '10px 11px', borderRadius: 'var(--r-sm)', marginTop: 8, background: blocked ? 'var(--bad-bg)' : 'transparent', border: `1px solid ${blocked ? 'var(--bad-line)' : 'var(--hair)'}` }}>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--faint)', flex: 'none', marginTop: 1 }}>{t}</span>
            <span className="mono" style={{ flex: 1, fontSize: '11.75px', color: blocked ? 'var(--bad)' : 'var(--ink-2)' }}>{c}</span>
          </div>
        ))}
        <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 16, padding: '11px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)' }}><Icon name="shieldCheck" size={15} style={{ color: 'var(--ink-2)', flex: 'none', marginTop: 1 }} /><div style={{ fontSize: '11.75px', color: 'var(--ink-2)', lineHeight: 1.5 }}><b>Tamper-evident.</b> The recording is hash-chained; the segment index seals on session close.</div></div>
      </>
    ),
  }), [tab, tel, clip, path, listing, expires, recipient, participants, dev, name]) // eslint-disable-line

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0A1120', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--sans)', userSelect: 'none' }}>
      {/* Top bar */}
      <div style={{ height: 56, flex: 'none', background: '#0A1120', borderBottom: '1px solid rgba(255,255,255,.09)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px' }}>
        <img src="assets/brand/tanflow-logo-1200w-white.png" alt="Tanflow" style={{ height: 22, flex: 'none' }} />
        <div style={{ minWidth: 0 }}><div style={{ fontSize: '14px', fontWeight: 700, color: '#EAF0FB', lineHeight: 1.15 }}>{name}</div><div className="mono" style={{ fontSize: '11px', color: '#8496B8' }}>{user}@{host}</div></div>
        <div className="hrow" style={{ gap: 14, marginLeft: 8, flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 700, color: '#E0524D' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E0524D', animation: 'spin 2s linear infinite', boxShadow: '0 0 0 3px rgba(224,82,77,.25)' }} />Recording</span>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#9FB2D4', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 'var(--r-xs)', padding: '2px 7px' }}>{proto}</span>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#E8A317', background: 'rgba(232,163,23,.12)', border: '1px solid rgba(232,163,23,.32)', borderRadius: 'var(--r-xs)', padding: '2px 7px' }}>{env.toUpperCase()}</span>
          <span className="hrow" style={{ gap: 6, fontSize: '11.5px', color: '#7FE0A6' }}><Icon name="shieldCheck" size={13} />Gateway-brokered · encrypted</span>
          <span className="mono" style={{ fontSize: '13px', fontWeight: 600, color: '#EAF0FB', letterSpacing: '.02em' }}>{hms(sec)}</span>
        </div>
        <div className="hrow" style={{ gap: 8, marginLeft: 'auto', flex: 'none' }}>
          <button onClick={toggleFs} title={fs ? 'Exit full screen' : 'Full screen'} style={{ width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: '#9FB2D4', border: '1px solid rgba(255,255,255,.14)' }}><Icon name={fs ? 'minimize2' : 'maximize'} size={16} /></button>
          <button onClick={close} className="hrow" style={{ gap: 8, height: 34, padding: '0 14px', borderRadius: 'var(--r-sm)', background: '#D0342C', color: '#fff', fontSize: '13px', fontWeight: 650 }}><Icon name="logout" size={15} />Close Session</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {!collapsed && (
          <>
            <div style={{ width: 56, flex: 'none', background: '#0E1729', borderRight: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0' }}>
              {RAIL.map((r) => {
                const on = tab === r.id
                return (
                  <button key={r.id} title={r.title} onClick={() => setTab(r.id)} style={{ position: 'relative', width: 40, height: 40, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: on ? '#fff' : '#7C8AA5', background: on ? 'rgba(37,99,235,.9)' : 'transparent' }}>
                    <Icon name={r.icon} size={19} />
                    {r.dot && <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: '#E0524D' }} />}
                  </button>
                )
              })}
            </div>

            <div style={{ width: 340, flex: 'none', background: 'var(--surface)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="hrow" style={{ gap: 11, padding: '14px 14px 12px', borderBottom: '1px solid var(--hair)', flex: 'none' }}>
                <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="monitor" size={17} style={{ color: 'var(--accent)' }} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{name}</div><div className="mono" style={{ fontSize: '11px', color: 'var(--mut)' }}>{user}@{host}</div></div>
                <button title="Collapse sidebar" onClick={() => setCollapsed(true)} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink-2)' }} style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'var(--ink-2)', border: 'none', flex: 'none', cursor: 'pointer', transition: 'background .12s' }}><Icon name="chevL" size={16} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>{panel[tab]}</div>
            </div>
          </>
        )}

        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <RemoteDesktop />
          {collapsed && (
            <button onMouseDown={startDrag} onTouchStart={startDrag} onClick={() => { if (!movedRef.current) setCollapsed(false) }} title="Open session panel" style={{ position: 'absolute', left: logo.x, top: logo.y, zIndex: 20, width: 52, height: 52, borderRadius: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 7, cursor: 'grab', background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(14px) saturate(1.5)', WebkitBackdropFilter: 'blur(14px) saturate(1.5)', border: '1px solid rgba(255,255,255,.4)', boxShadow: '0 10px 34px rgba(0,0,0,.32)', touchAction: 'none' }}>
              <img src="assets/brand/tanflow-icon.svg" alt="Open panel" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
