import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const PROTOCOLS = ['SSH', 'RDP', 'VNC', 'Telnet', 'Kubernetes', 'PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'HTTPS']

// SSH protocol-parameter groups — count badge == number of fields.
const SECTIONS = [
  { title: 'Network', icon: 'server', fields: [
    { label: 'Network', req: true, ph: 'hostname or IP', mono: true },
    { label: 'Port', req: true, value: '22', mono: true },
    { label: 'Host Key', ph: 'Base64 SSH public host key', mono: true },
    { label: 'Server alive interval', value: '0', help: 'seconds; 0 disables keepalive' },
  ] },
  { title: 'Authentication', icon: 'lock', fields: [
    { label: 'Username' },
    { label: 'Password', pw: true, help: 'entered once, then vaulted' },
    { t: 'textarea', label: 'Private key', ph: '-----BEGIN OPENSSH PRIVATE KEY-----' },
    { label: 'Passphrase', pw: true, ph: 'key passphrase' },
  ] },
  { title: 'Display', icon: 'sessions', fields: [
    { t: 'select', label: 'Color scheme', value: 'Gray on black', options: ['Gray on black', 'White on black', 'Green on black', 'Black on white', 'Solarized dark'] },
    { label: 'Font name', value: 'monospace', mono: true },
    { label: 'Font size', value: '12' },
    { t: 'toggle', id: 'readOnly', label: 'Read-only' },
  ] },
  { title: 'Terminal behavior', icon: 'commands', fields: [
    { t: 'select', label: 'Terminal type', value: 'xterm-256color', options: ['xterm-256color', 'xterm', 'vt100', 'linux', 'ansi'] },
    { t: 'select', label: 'Backspace sends', value: 'Ctrl-? (delete)', options: ['Ctrl-? (delete)', 'Ctrl-H (backspace)'] },
    { label: 'Scrollback (lines)', value: '1000' },
    { label: 'Locale ($LANG)', value: 'en_US.UTF-8', mono: true },
    { label: 'Timezone', value: 'Etc/UTC', mono: true },
  ] },
  { title: 'SFTP / File transfer', icon: 'folder', fields: [
    { t: 'toggle', id: 'sftp', label: 'Enable file transfer' },
    { label: 'Root directory', value: '/', mono: true },
    { label: 'Default upload directory', value: '/home', mono: true },
    { label: 'Keepalive interval', value: '0' },
  ] },
  { title: 'Session recording', icon: 'recordings', fields: [
    { t: 'toggle', id: 'record', label: 'Record session', help: 'Enforced by policy — cannot be disabled on this target', disabled: true },
    { t: 'toggle', id: 'keystrokes', label: 'Log keystrokes' },
    { label: 'Recording path', value: '/recordings/ssh', mono: true, help: 'Gateway-managed, immutable store' },
  ] },
  { title: 'Wake-on-LAN', icon: 'zap', fields: [
    { t: 'toggle', id: 'wol', label: 'Send WoL packet' },
    { label: 'MAC address', value: '00:11:22:33:44:55', mono: true },
    { label: 'Broadcast address', value: '255.255.255.255', mono: true },
  ] },
]

const Head = ({ icon, title }) => (
  <div className="hrow" style={{ gap: 8, margin: '22px 0 12px' }}>
    <Icon name={icon} size={15} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
  </div>
)
const F = ({ label, req, children, help, full }) => (
  <div className="field" style={full ? { gridColumn: '1 / -1' } : undefined}>
    <label>{label}{req && <span style={{ color: 'var(--bad)' }}> *</span>}</label>
    {children}
    {help && <div className="f-help">{help}</div>}
  </div>
)

export default function NewConnectionModal({ onClose }) {
  const { toast } = useApp()
  const [tab, setTab] = useState('config')
  const [protocol, setProtocol] = useState('SSH')
  const [cred, setCred] = useState('vault')
  const [open, setOpen] = useState(() => new Set(SECTIONS.map((s) => s.title)))
  const [toggles, setToggles] = useState({ record: true, readOnly: false, sftp: false, keystrokes: false, wol: false, failover: false })
  const toggleSec = (t) => setOpen((s) => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n })
  const flip = (id) => setToggles((t) => ({ ...t, [id]: !t[id] }))

  const renderField = (fld) => {
    if (fld.t === 'toggle') return (
      <F key={fld.label} label={fld.label} help={fld.help}>
        <span className={`toggle ${toggles[fld.id] ? 'on' : ''}`} onClick={() => !fld.disabled && flip(fld.id)} style={fld.disabled ? { opacity: 0.7, cursor: 'not-allowed' } : undefined} />
      </F>
    )
    return (
      <F key={fld.label} label={fld.label} req={fld.req} help={fld.help} full={fld.t === 'textarea'}>
        {fld.t === 'select'
          ? <select className="sel" defaultValue={fld.value}>{fld.options.map((o) => <option key={o}>{o}</option>)}</select>
          : fld.t === 'textarea'
            ? <textarea className="inp mono" defaultValue={fld.value} placeholder={fld.ph} rows={3} style={{ height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5, fontSize: '11.5px', whiteSpace: 'pre' }} />
            : <input className={`inp ${fld.mono ? 'mono' : ''}`} type={fld.pw ? 'password' : 'text'} defaultValue={fld.value} placeholder={fld.ph} />}
      </F>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(900px, 97vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad" style={{ overflowY: 'auto' }}>
          {/* header */}
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="commands" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>New connection</div>
                <div className="mono" style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Register a target behind the session gateway</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>

          {/* tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 5, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 6 }}>
            {[['config', 'settings', 'Configuration'], ['attributes', 'list', 'Attributes']].map(([id, icon, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 'calc(var(--r-sm) - 2px)', fontSize: '13px', fontWeight: 600, background: tab === id ? 'var(--accent)' : 'transparent', color: tab === id ? '#fff' : 'var(--ink-2)' }}>
                <Icon name={icon} size={15} />{label}
              </button>
            ))}
          </div>

          {tab === 'config' && (
            <>
              <Head icon="link" title="Protocol" />
              <F label="Connection protocol" req>
                <select className="sel" value={protocol} onChange={(e) => setProtocol(e.target.value)}>{PROTOCOLS.map((p) => <option key={p}>{p}</option>)}</select>
              </F>

              <Head icon="overview" title="Connection details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 18px' }}>
                <F label="Connection name" req><input className="inp" placeholder="e.g. SAP-PRD-APP02" /></F>
                <F label="Location"><select className="sel" defaultValue="ROOT (No parent group)"><option>ROOT (No parent group)</option><option>TANFLOW CORE</option><option>BTS LAB</option><option>LOCAL TOOLS</option></select></F>
                <F label="Environment"><select className="sel" defaultValue="Prod"><option>Prod</option><option>Staging</option><option>Dev</option><option>Sandbox</option></select></F>
              </div>

              <Head icon="shieldCheck" title="Security" />
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>Credential source</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', gap: 11, padding: '12px 14px', border: `1px solid ${cred === 'vault' ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: cred === 'vault' ? 'var(--sh-focus)' : 'none' }}>
                  <input type="radio" name="cred" checked={cred === 'vault'} onChange={() => setCred('vault')} style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
                  <div><div className="hrow" style={{ gap: 8 }}><Icon name="unlock" size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Vault-managed</span><span className="tag tag-acc">Recommended</span></div>
                    <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 2 }}>Credential onboarded, rotated on policy, injected at connect — never shown to the user</div></div>
                </label>
                <label style={{ display: 'flex', gap: 11, padding: '12px 14px', border: `1px solid ${cred === 'direct' ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: cred === 'direct' ? 'var(--sh-focus)' : 'none' }}>
                  <input type="radio" name="cred" checked={cred === 'direct'} onChange={() => setCred('direct')} style={{ accentColor: 'var(--accent)', marginTop: 2 }} />
                  <div><div className="hrow" style={{ gap: 8 }}><Icon name="lock" size={14} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Direct credential</span></div>
                    <div style={{ fontSize: '11.75px', color: 'var(--mut)', marginTop: 2 }}>Stored as connection parameters — flagged in posture reports until vaulted</div></div>
                </label>
              </div>

              <div className="hrow" style={{ justifyContent: 'space-between', margin: '24px 0 12px' }}>
                <div className="hrow" style={{ gap: 8 }}><Icon name="settings" size={15} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>Protocol parameters</span></div>
                <div className="hrow" style={{ gap: 14, fontSize: '12px', fontWeight: 600 }}>
                  <span className="link" onClick={() => setOpen(new Set(SECTIONS.map((s) => s.title)))}>Expand all</span>
                  <span className="link" onClick={() => setOpen(new Set())}>Collapse all</span>
                </div>
              </div>
              {SECTIONS.map((sec) => {
                const isOpen = open.has(sec.title)
                return (
                  <div key={sec.title} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 10, overflow: 'hidden' }}>
                    <button onClick={() => toggleSec(sec.title)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'var(--surface-2)', cursor: 'pointer' }}>
                      <span className="hrow" style={{ gap: 9 }}><Icon name={sec.icon} size={15} style={{ color: 'var(--mut)' }} /><span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)' }}>{sec.title}</span><span className="tag tag-acc">{sec.fields.length}</span></span>
                      <Icon name="chevD" size={16} style={{ color: 'var(--mut)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                    </button>
                    {isOpen && <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px 18px', borderTop: '1px solid var(--hair)' }}>{sec.fields.map(renderField)}</div>}
                  </div>
                )
              })}
            </>
          )}

          {tab === 'attributes' && (
            <>
              <Head icon="analytics" title="Concurrency & routing" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 18px' }}>
                <F label="Max connections"><input className="inp" defaultValue="10" /></F>
                <F label="Max connections per user"><input className="inp" defaultValue="2" /></F>
                <F label="Connection weight"><input className="inp" defaultValue="1" /></F>
              </div>
              <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
                <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Failover only</div>
                  <div style={{ fontSize: '11.75px', color: 'var(--mut)' }}>Use this connection only when others in its balancing group fail</div></div>
                <span className={`toggle ${toggles.failover ? 'on' : ''}`} onClick={() => flip('failover')} />
              </div>

              <Head icon="clock" title="Access window" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 18px' }}>
                <F label="Idle timeout"><input className="inp" defaultValue="15" /></F>
                <F label="Max session length"><input className="inp" defaultValue="240" /></F>
                <F label="Concurrent policy"><select className="sel" defaultValue="Allow"><option>Allow</option><option>Deny</option><option>Queue</option></select></F>
              </div>

              <Head icon="shieldCheck" title="System (read-only)" />
              <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                {[['Connection ID', '— (assigned on create)'], ['Created', '—'], ['Last active', '—'], ['Total sessions', '0']].map(([k, v], i) => (
                  <div key={k} className="hrow" style={{ justifyContent: 'space-between', padding: '11px 14px', borderBottom: i < 3 ? '1px solid var(--hair)' : 'none', background: 'var(--surface-2)' }}>
                    <span style={{ fontSize: '12.75px', color: 'var(--ink-2)' }}>{k}</span><span className="mono" style={{ fontSize: '12px', color: 'var(--faint)' }}>{v}</span>
                  </div>
                ))}
              </div>

              <Head icon="star" title="Custom attributes" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 18px' }}>
                <F label="Owner"><input className="inp" defaultValue="Platform Ops" /></F>
                <F label="Cost centre"><input className="inp" defaultValue="CC-4471" /></F>
                <F label="Data classification"><select className="sel" defaultValue="Confidential"><option>Confidential</option><option>Restricted</option><option>Internal</option><option>Public</option></select></F>
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
          <button className="btn btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn btn-pri" onClick={() => { toast('ok', 'Connection created', `${protocol} target registered behind the gateway (demo).`); onClose() }}><Icon name="check" />Create connection</button>
        </div>
      </div>
    </div>
  )
}
