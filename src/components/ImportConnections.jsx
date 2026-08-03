import { useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

const Code = ({ children }) => (
  <code style={{ fontFamily: 'var(--mono)', fontSize: '11.25px', background: 'var(--surface-3)', color: 'var(--ink-2)', padding: '1px 5px', borderRadius: 3 }}>{children}</code>
)
const Help = ({ title }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--faint)', flex: 'none' }}>
    <title>{title}</title><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
  </svg>
)

// Import-connections slide-over — mirrors the Import Users drawer used elsewhere.
export default function ImportConnections({ onClose }) {
  const { toast } = useApp()
  const [replace, setReplace] = useState(false)
  const [reset, setReset] = useState(false)
  const chk = { display: 'flex', alignItems: 'center', gap: 9, fontSize: '13px', color: 'var(--ink-2)', cursor: 'pointer' }
  const box = { accentColor: 'var(--accent)', width: 16, height: 16 }
  return (
    <>
      <div className="scrim show" onClick={onClose} />
      <aside className="drawer show" role="dialog" aria-modal="true" aria-label="Import connections">
        <button className="icon-btn drawer-close" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        <div className="drawer-h">
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.01em', padding: '4px 0 14px' }}>Import Connections</div>
        </div>
        <div className="drawer-body">
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
            <div className="hrow" style={{ gap: 8, marginBottom: 10, fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>
              <Icon name="reports" size={16} />File Requirements
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.85 }}>
              <li>Supports <b>CSV, JSON, and YAML</b> formats</li>
              <li>Required: <Code>name</Code>, <Code>protocol</Code> and <Code>hostname</Code></li>
              <li>Protocol params: <Code>port</Code>, <Code>username</Code>, <Code>private_key</Code> (per-protocol)</li>
              <li>Placement: <Code>parent_group</Code> to nest under a connection group</li>
              <li>Attributes: <Code>attr_</Code> prefix in CSV, <Code>attributes</Code> object in JSON/YAML</li>
              <li>Credentials: <Code>credential_source</Code> — <Code>vault</Code> or <Code>direct</Code></li>
              <li>New connection groups are created automatically when referenced</li>
              <li>Check <b>Replace existing</b> to update connections with the same name</li>
              <li>Check <b>Reset parameters</b> to clear old settings before applying new ones</li>
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Sample downloaded', 'A sample connection import file has been downloaded (demo).')}>
              <Icon name="download" />Download Sample<Icon name="chevD" size={13} />
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 7 }}>Upload File (CSV, JSON, YAML, YML)</div>
            <input type="file" accept=".csv,.json,.yaml,.yml" className="inp" style={{ height: 'auto', padding: '7px 10px', lineHeight: 1.4 }} />
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={chk}>
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} style={box} />
              Replace/Update existing connections <Help title="Overwrite connections that already exist with the same name." />
            </label>
            <label style={chk}>
              <input type="checkbox" checked={reset} onChange={(e) => setReset(e.target.checked)} style={box} />
              Reset parameters <Help title="Clear existing protocol parameters before applying the imported ones." />
            </label>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8, flex: 'none' }}>
          <button className="btn btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn btn-pri" onClick={() => { toast('ok', 'Import started', 'Your connections file is being processed (demo).'); onClose() }}>
            <Icon name="upload" />Import
          </button>
        </div>
      </aside>
    </>
  )
}
