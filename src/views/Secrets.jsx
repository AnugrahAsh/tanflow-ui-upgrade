import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }
const STATUS_TONE = { Healthy: 'ok', 'Renewal due': 'warn', 'Rotation overdue': 'bad' }
const TYPES = ['API key', 'DB credential', 'OIDC federation', 'Certificate', 'Token', 'Password']
const ROTATIONS = ['Every 6h', 'Every 24h', 'Every 7d', 'Every 30d', '90 days', 'Token per job', 'Manual']

const SEED = [
  { path: 'payments/prod/db-writer', type: 'DB credential', consumer: 'k8s · payments namespace', rotation: 'Every 6h', last: '2 min ago', status: 'Healthy' },
  { path: 'ci/github/deploy-oidc', type: 'OIDC federation', consumer: 'GitHub Actions · 14 repos', rotation: 'Token per job', last: '8 min ago', status: 'Healthy' },
  { path: 'sap/rfc/idm-sync', type: 'API key', consumer: 'SAP RFC connector', rotation: 'Every 24h', last: '12 min ago', status: 'Healthy' },
  { path: 'core/swift/gateway-cert', type: 'Certificate', consumer: 'SWIFT gateway pair', rotation: '90 days', last: '1 hr ago', status: 'Renewal due' },
  { path: 'siem/splunk/hec-token', type: 'Token', consumer: 'Event streaming', rotation: 'Every 30d', last: 'streaming', status: 'Healthy' },
  { path: 'legacy/ftp/branch-114', type: 'Password', consumer: 'Branch batch job', rotation: 'Manual', last: 'Yesterday', status: 'Rotation overdue' },
]

const ENDPOINTS = [
  { icon: 'server', name: 'Kubernetes operator', desc: 'Secrets synced to 8 namespaces · CSI driver, no etcd plaintext' },
  { icon: 'integrations', name: 'GitHub Actions OIDC', desc: '14 repos federate per-job tokens — zero stored PATs' },
  { icon: 'commands', name: 'Terraform provider', desc: 'Data-source reads at plan time — nothing written to state' },
  { icon: 'shieldCheck', name: 'Service mesh (SPIFFE)', desc: 'Workload SVIDs issued per pod — mTLS, 1-hour lease TTL' },
]

const Field = ({ label: l, children }) => (<div className="field"><label>{l}</label>{children}</div>)

function SecretDrawer({ secret: s, onRotate }) {
  const { toast, closeDrawer } = useApp()
  const META = [
    ['Type', s.type],
    ['Consumer', s.consumer],
    ['Rotation policy', s.rotation],
    ['Last accessed', s.last],
    ['Engine', 'transit · AES-256-GCM'],
    ['Access', 'Workload identity only — humans never read the value'],
  ]
  const ACCESS = [
    ['k8s · payments-writer', '2 min ago'],
    ['ci-runner · deploy', '18 min ago'],
    ['rotation-controller', '6 h ago'],
  ]
  return (
    <>
      <div className="drawer-h">
        <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--hair)' }}>
          <div className="hrow" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{s.path}</span>
            <Badge tone={STATUS_TONE[s.status]} label={s.status} />
          </div>
          <div className="hrow" style={{ gap: 8, marginTop: 8 }}>
            <span className="tag">{s.type}</span>
            <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Value is write-only — sealed to the vault</span>
          </div>
        </div>
      </div>
      <div className="drawer-body">
        <div style={{ ...label, margin: '16px 0 6px' }}>Metadata</div>
        <div className="dl">
          {META.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></div>))}
        </div>

        <div style={{ ...label, margin: '22px 0 6px' }}>Recent access</div>
        {ACCESS.map(([who, when]) => (
          <div key={who} className="hrow" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
            <span className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{who}</span>
            <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{when}</span>
          </div>
        ))}

        <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 18, padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)' }}>
          <Icon name="lock" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}>Rotation issues a new version and re-leases every consumer automatically — no restart, no downtime.</div>
        </div>

        <div className="hrow" style={{ gap: 8, marginTop: 16 }}>
          <button className="btn btn-pri btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { onRotate(s.path); closeDrawer() }}><Icon name="refresh" size={13} />Rotate now</button>
          <button className="btn btn-sec btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => toast('ok', 'Access log', `Full access log for ${s.path} (demo).`)}><Icon name="audit" size={13} />View access log</button>
        </div>
      </div>
    </>
  )
}

function NewSecretModal({ onClose, onCreate }) {
  const [f, setF] = useState({ path: '', type: 'API key', rotation: 'Every 6h', value: '', consumers: '' })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const ok = f.path.trim().length > 0
  const create = () => { onCreate(f); onClose() }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(560px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--warn-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="lock" size={18} style={{ color: 'var(--warn)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>New secret</div><div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Value is written once and never displayed again</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <Field label="Path"><input className="inp" placeholder="team/environment/name — e.g. payments/prod/api-key" value={f.path} onChange={set('path')} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Type"><select className="sel" value={f.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Rotation"><select className="sel" value={f.rotation} onChange={set('rotation')}>{ROTATIONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
            </div>
            <Field label="Value"><input className="inp" type="password" placeholder="Pasted once · sealed to the vault" value={f.value} onChange={set('value')} /></Field>
            <Field label="Consumers"><input className="inp" placeholder="k8s namespace, pipeline, or app — least privilege by default" value={f.consumers} onChange={set('consumers')} /></Field>
          </div>
          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!ok} style={{ opacity: ok ? 1 : .5, cursor: ok ? 'pointer' : 'default' }} onClick={create}><Icon name="check" />Create secret</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Secrets() {
  const { toast, openDrawer } = useApp()
  const [rows, setRows] = useState(SEED)
  const [q, setQ] = useState('')
  const [typeF, setTypeF] = useState('All types')
  const [newOpen, setNewOpen] = useState(false)

  const rotate = (path) => {
    setRows((rs) => rs.map((r) => (r.path === path ? { ...r, last: 'just now', status: 'Healthy' } : r)))
    toast('ok', 'Secret rotated', `${path} — new version issued, consumers re-leased with zero downtime (demo).`)
  }
  const create = (f) => {
    setRows((rs) => [{ path: f.path.trim(), type: f.type, consumer: f.consumers.trim() || 'Unassigned', rotation: f.rotation, last: 'just now', status: 'Healthy' }, ...rs])
    toast('ok', 'Secret created', `${f.path.trim()} sealed to the vault — write-only, never displayed again (demo).`)
  }
  const openSecret = (s) => openDrawer(<SecretDrawer secret={s} onRotate={rotate} />)

  const filtered = rows.filter((r) => (typeF === 'All types' || r.type === typeF) && (!q || (r.path + r.consumer + r.type).toLowerCase().includes(q.toLowerCase())))

  return (
    <>
      <PageHead
        title="Secrets — Machine Identities"
        sub="The same vault, ledger and policy engine with no humans in the loop — API keys, tokens, certificates and service credentials injected at runtime and rotated on policy."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Integration guide', 'Opens the machine-identity integration guide (demo).')}><Icon name="book" />Integration guide</button>
            <button className="btn btn-pri" onClick={() => setNewOpen(true)}><Icon name="plus" />New secret</button>
          </>
        }
      />

      <div className="kpi-row cols-5">
        <KpiTile label="Managed secrets" icon="lock" val="412" delta={9} foot="across 6 safes" />
        <KpiTile label="Machine consumers" icon="server" val="50" foot="42 apps · 8 pipelines" />
        <KpiTile label="Rotation success (30d)" icon="refresh" val="99.6" unit="%" foot="1 manual secret overdue" />
        <KpiTile label="Hardcoded in repos" icon="warnTri" val="7" delta={-46} goodUp={false} foot="code scanner · 3 repos" />
        <KpiTile label="Active leases" icon="zap" val="36" foot="short-lived · auto-expiring" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div><div className="ch-t">Secrets</div><div className="ch-s">Values are write-only — consumers authenticate with workload identity, humans never see them</div></div>
          <div className="ch-right hrow" style={{ gap: 8 }}>
            <div className="search-inp" style={{ width: 210 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search path or consumer…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="sel" style={{ width: 150 }} value={typeF} onChange={(e) => setTypeF(e.target.value)}><option>All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Secret</th><th>Type</th><th>Consumer</th><th>Rotation</th><th>Last accessed</th><th>Status</th><th style={{ width: 84 }} /></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty" style={{ padding: '40px 20px' }}><div className="e-ic"><Icon name="search" size={20} /></div><div className="e-t">No secrets match</div><div className="e-s">Adjust the search or type filter.</div></div></td></tr>
              ) : filtered.map((s) => (
                <tr key={s.path} onClick={() => openSecret(s)} style={{ cursor: 'pointer' }}>
                  <td className="mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{s.path}</td>
                  <td><span className="tag">{s.type}</span></td>
                  <td style={{ color: 'var(--mut)' }}>{s.consumer}</td>
                  <td style={{ color: 'var(--mut)' }}>{s.rotation}</td>
                  <td style={{ color: 'var(--mut)' }}>{s.last}</td>
                  <td><Badge tone={STATUS_TONE[s.status]} label={s.status} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" title="Rotate secret" onClick={(e) => { e.stopPropagation(); rotate(s.path) }}><Icon name="refresh" size={14} /></button>
                      <button className="mini-btn" title="Details" onClick={(e) => { e.stopPropagation(); openSecret(s) }}><Icon name="eye" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--hair)', flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 8, fontSize: '12px', color: 'var(--mut)' }}><Icon name="sparkle" size={14} style={{ color: 'var(--accent)', flex: 'none' }} />Copilot: the 7 hardcoded secrets in repos map to 3 managed secrets — one click opens PRs replacing them with runtime injection.</span>
          <button className="btn btn-sec btn-sm" onClick={() => toast('ok', 'Replacement PRs', 'Opened 3 PRs replacing hardcoded secrets with runtime injection (demo).')}><Icon name="upRight" size={13} />Open replacement PRs</button>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><div><div className="ch-t">Delivery endpoints</div><div className="ch-s">How machines fetch — no agents on consumers, no values in env files</div></div></div>
        {ENDPOINTS.map((e) => (
          <div key={e.name} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderTop: '1px solid var(--hair)' }}>
            <div className="hrow" style={{ gap: 12, minWidth: 0 }}>
              <span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={e.icon} size={16} style={{ color: 'var(--mut)' }} /></span>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)' }}>{e.name}</div><div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 1 }}>{e.desc}</div></div>
            </div>
            <Badge tone="ok" label="Connected" />
          </div>
        ))}
      </div>

      {newOpen && <NewSecretModal onClose={() => setNewOpen(false)} onCreate={create} />}
    </>
  )
}
