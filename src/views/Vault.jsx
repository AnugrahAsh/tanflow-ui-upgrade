import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { sessionPath } from '../lib/session.js'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }
const PROTO_STYLE = {
  SSH: { tint: '#FDF0E1', color: '#B4690E', icon: 'commands' },
  RDP: { tint: '#E8F0FF', color: '#2563EB', icon: 'sessions' },
  MySQL: { tint: '#E6F5EF', color: '#0E9F6E', icon: 'db' },
  PostgreSQL: { tint: '#E6F5EF', color: '#0E9F6E', icon: 'db' },
}

const VAULT = [
  { name: 'BTSPLAPAM01', proto: 'SSH', host: '10.0.0.61', accounts: [
    { user: 'ubuntu', kind: 'SSH key', fp: 'SHA256:9c21:e0…7be4', updated: '02 Aug 2026' },
  ] },
  { name: 'BTSPAMDEMO01', proto: 'SSH', host: '10.0.0.150', accounts: [
    { user: 'root', kind: 'Password', updated: '28 Jul 2026' },
    { user: 'ubuntu', kind: 'SSH key', fp: 'SHA256:4b70…c9e2', updated: '28 Jul 2026' },
  ] },
  { name: 'TANFLOWAD01', proto: 'RDP', host: '192.168.1.80', accounts: [
    { user: 'Administrator', kind: 'Password', updated: '19 Jul 2026' },
    { user: 'svc-join', kind: 'Password', updated: '19 Jul 2026' },
  ] },
  { name: 'BTSIDAMDEMO01', proto: 'SSH', host: '10.0.0.231', accounts: [
    { user: 'ubuntu', kind: 'SSH key', fp: 'SHA256:1af0…22b9', updated: '14 Jul 2026' },
  ] },
  { name: 'TANFLOWAPP01', proto: 'SSH', host: '146.56.51.196', accounts: [
    { user: 'appadmin', kind: 'Password', updated: '11 Jul 2026' },
  ] },
  { name: 'BTSPLPAMPRODBD01', proto: 'MySQL', host: 'btsplpamprodbd01:3306', accounts: [
    { user: 'pamadmin', kind: 'Password', updated: '02 Jun 2026' },
  ] },
  { name: 'BTSPLVAPTBD01', proto: 'PostgreSQL', host: 'btsplvaptbd01:5432', accounts: [
    { user: 'pamadmin', kind: 'Password', updated: '28 May 2026' },
  ] },
]

const PROTOS = ['SSH', 'RDP', 'MySQL', 'PostgreSQL']
const securedPill = { fontSize: '10px', fontWeight: 700, letterSpacing: '.04em', color: 'var(--warn)', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-xs)', padding: '2px 6px', whiteSpace: 'nowrap', flex: 'none' }

const ProtoTile = ({ proto, size = 38 }) => {
  const s = PROTO_STYLE[proto]
  return <span style={{ width: size, height: size, borderRadius: 'var(--r-sm)', background: s.tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={s.icon} size={Math.round(size * 0.5)} style={{ color: s.color }} /></span>
}

function VStat({ icon, num, sub, text, green }) {
  return (
    <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
      <span style={{ width: 42, height: 42, borderRadius: 'var(--r-sm)', background: green ? 'var(--ok-bg)' : 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={19} style={{ color: green ? 'var(--ok)' : 'var(--accent)' }} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 750, color: 'var(--ink)', lineHeight: 1 }}>{num}{sub && <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--mut)', marginLeft: 5 }}>{sub}</span>}</div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginTop: 6 }}>{text}</div>
      </div>
    </div>
  )
}

const AcctIcon = ({ kind }) => <Icon name={kind === 'SSH key' ? 'keyRound' : 'lock'} size={14} style={{ color: 'var(--faint)', flex: 'none' }} />

function VaultDrawer({ cred: c }) {
  const { toast, go, closeDrawer } = useApp()
  const s = PROTO_STYLE[c.proto]
  const reveal = (u) => toast('warn', 'MFA challenge required', `Revealing ${u}@${c.name} triggers an MFA step-up — every time (demo).`)
  const ACCESS = [
    ['Reveal', 'MFA challenge required, every time'],
    ['Injection', 'Credential is injected at connect — users never see it'],
    ['Audit', 'Reveal, copy and edit are all logged'],
  ]
  return (
    <>
      <div className="drawer-h">
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 12 }}>
          <ProtoTile proto={c.proto} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.015em' }}>{c.name}</div>
            <div className="hrow" style={{ marginTop: 7, flexWrap: 'wrap', gap: 8 }}>
              <span className="tag">{c.proto}</span>
              <span className="mono" style={{ fontSize: '12px', color: 'var(--mut)' }}>{c.host}</span>
              <span className="hrow" style={{ gap: 5, fontSize: '11px', fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent-line)', borderRadius: 999, padding: '2px 9px' }}><Icon name="lock" size={11} />Reveal is MFA-gated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="drawer-body">
        <div className="hrow" style={{ ...label, margin: '16px 0 6px', justifyContent: 'space-between' }}>
          <span>Stored accounts · {c.accounts.length}</span>
        </div>
        {c.accounts.map((a) => (
          <div key={a.user} className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--hair)' }}>
            <div className="hrow" style={{ gap: 10, minWidth: 0 }}>
              <AcctIcon kind={a.kind} />
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{a.user}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 1 }}>{a.kind}{a.fp ? ` · ${a.fp}` : ''} · updated {a.updated}</div>
              </div>
            </div>
            <div className="hrow" style={{ gap: 6, flex: 'none' }}>
              <span style={securedPill}>SECURED</span>
              <button className="mini-btn" title="Reveal (MFA)" onClick={() => reveal(a.user)}><Icon name="eye" size={14} /></button>
              <button className="mini-btn" title="Edit" onClick={() => toast('ok', 'Edit account', `Edit ${a.user}@${c.name} (demo).`)}><Icon name="edit" size={14} /></button>
              <button className="mini-btn danger" title="Delete" onClick={() => toast('warn', 'Delete account', `Removing ${a.user}@${c.name} requires dual-control approval (demo).`)}><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))}
        <button className="btn btn-sec btn-sm" style={{ marginTop: 12 }} onClick={() => toast('ok', 'Add account', `Add a stored account to ${c.name} (demo).`)}><Icon name="plus" size={13} />Add account</button>

        <div style={{ ...label, margin: '22px 0 6px' }}>Access</div>
        <div className="dl">
          {ACCESS.map(([k, v]) => (<div key={k} style={{ display: 'contents' }}><div className="dl-k">{k}</div><div className="dl-v">{v}</div></div>))}
        </div>

        <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 18, padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r-sm)' }}>
          <Icon name="shieldCheck" size={16} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} />
          <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}>MFA enforcement is off tenant-wide. The vault gate is independent — reveal always challenges, even when enforcement is off. <span className="link" onClick={() => { closeDrawer(); go('mfa') }}>MFA settings</span></div>
        </div>

        <div className="hrow" style={{ gap: 8, marginTop: 16 }}>
          <button className="btn btn-pri btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { closeDrawer(); go(sessionPath({ name: c.name, proto: c.proto, host: c.host })) }}><Icon name="link" size={13} />Open connection</button>
          <button className="btn btn-sec btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { closeDrawer(); go('audit') }}><Icon name="audit" size={13} />View audit trail</button>
        </div>
      </div>
    </>
  )
}

const Field = ({ label: l, children }) => (
  <div className="field"><label>{l}</label>{children}</div>
)

function AddCredentialModal({ onClose }) {
  const { toast } = useApp()
  const [f, setF] = useState({ target: '', proto: 'SSH', user: '', kind: 'Password', secret: '', mfa: true })
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const ok = f.target.trim() && f.user.trim()
  const add = () => { toast('ok', 'Credential added', `${f.user}@${f.target} vaulted as ${f.kind.toLowerCase()} — reveal is MFA-gated (demo).`); onClose() }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.42)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', width: 'min(540px, 96vw)', maxHeight: '92vh', overflowY: 'auto', boxShadow: 'var(--sh-lg)' }}>
        <div className="card-pad">
          <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div className="hrow" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="keyRound" size={18} style={{ color: 'var(--accent)' }} /></span>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>Add credential</div><div style={{ fontSize: '12.25px', color: 'var(--mut)' }}>Vaulted, MFA-gated and injected at connect — the secret is sealed.</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 14 }}>
              <Field label="Target host"><input className="inp" placeholder="hostname or IP — e.g. 10.0.0.61" value={f.target} onChange={set('target')} /></Field>
              <Field label="Protocol"><select className="sel" value={f.proto} onChange={set('proto')}>{PROTOS.map((p) => <option key={p}>{p}</option>)}</select></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 14 }}>
              <Field label="Username"><input className="inp" placeholder="e.g. ubuntu" value={f.user} onChange={set('user')} /></Field>
              <Field label="Credential type"><select className="sel" value={f.kind} onChange={set('kind')}><option>Password</option><option>SSH key</option></select></Field>
            </div>
            <Field label={f.kind === 'SSH key' ? 'Private key' : 'Password'}><input className="inp" type="password" placeholder={f.kind === 'SSH key' ? 'Paste key — sealed to the vault' : 'Sealed to the vault · write-only'} value={f.secret} onChange={set('secret')} /></Field>
            <div className="hrow" style={{ justifyContent: 'space-between', padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
              <div><div style={{ fontSize: '13px', fontWeight: 600 }}>MFA-gated reveal</div><div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Challenge on every reveal, independent of enforcement.</div></div>
              <span className={`toggle ${f.mfa ? 'on' : ''}`} onClick={() => setF((p) => ({ ...p, mfa: !p.mfa }))} />
            </div>
          </div>
          <div className="hrow" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-pri" disabled={!ok} style={{ opacity: ok ? 1 : .5, cursor: ok ? 'pointer' : 'default' }} onClick={add}><Icon name="check" />Add credential</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Vault() {
  const { toast, openDrawer } = useApp()
  const [q, setQ] = useState('')
  const [view, setView] = useState('grid')
  const [addOpen, setAddOpen] = useState(false)

  const creds = VAULT.reduce((n, t) => n + t.accounts.length, 0)
  const sshKeys = VAULT.reduce((n, t) => n + t.accounts.filter((a) => a.kind === 'SSH key').length, 0)
  const chips = PROTOS.map((p) => [p, VAULT.filter((t) => t.proto === p).reduce((n, t) => n + t.accounts.length, 0), PROTO_STYLE[p].icon]).filter((c) => c[1] > 0)

  const matches = (t) => !q || (t.name + t.host + t.proto + t.accounts.map((a) => a.user).join(' ')).toLowerCase().includes(q.toLowerCase())
  const rows = VAULT.filter(matches)
  const open = (c) => openDrawer(<VaultDrawer cred={c} />)
  const reveal = (e, c) => { e.stopPropagation(); toast('warn', 'MFA challenge required', `Revealing a credential on ${c.name} triggers an MFA step-up — every time (demo).`) }

  return (
    <>
      <PageHead
        title="Password Vault"
        sub="MFA-gated credential store for privileged access."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => toast('ok', 'Export inventory', 'Credential inventory exported (metadata only — no secrets) (demo).')}><Icon name="download" />Export inventory</button>
            <button className="btn btn-pri" onClick={() => setAddOpen(true)}><Icon name="plus" />Add credential</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '160px 150px 160px 168px 1fr', gap: 16, marginBottom: 16 }}>
        <VStat icon="keyRound" num={creds} text="Credentials" />
        <VStat icon="server" num={VAULT.length} text="Targets" />
        <VStat icon="keyRound" num={sshKeys} sub={`of ${creds}`} text="SSH keys" />
        <VStat icon="lock" num="100%" text="MFA-gated" green />
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {chips.map(([n, ct, ic]) => (
              <span key={n} className="hrow" style={{ gap: 7, padding: '6px 11px', border: '1px solid var(--line)', borderRadius: 999, fontSize: '12.5px', color: 'var(--ink-2)' }}>
                <Icon name={ic} size={13} style={{ color: 'var(--mut)' }} />{n}<span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mut)', background: 'var(--surface-2)', borderRadius: 999, padding: '1px 7px' }}>{ct}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)' }}>{creds} credentials across {VAULT.length} targets</span>
          <div className="tb-spacer" />
          <button className="icon-btn" title="List view" style={view === 'list' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('list')}><Icon name="list" size={15} /></button>
          <button className="icon-btn" title="Grid view" style={view === 'grid' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('grid')}><Icon name="grid" size={15} /></button>
          <div className="search-inp" style={{ width: 240 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search credentials…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>

        {rows.length === 0 ? (
          <div className="empty" style={{ padding: '64px 20px' }}>
            <div className="e-ic"><Icon name="search" size={22} /></div>
            <div className="e-t">No credentials match</div>
            <div className="e-s">Try a different host, username or protocol.</div>
            <button className="btn btn-sec btn-sm" style={{ marginTop: 16 }} onClick={() => setQ('')}><Icon name="refresh" size={13} />Clear search</button>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, padding: 16 }}>
            {rows.map((c) => (
              <div key={c.name} className="card" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => open(c)}>
                <div className="card-pad" style={{ paddingBottom: 12, flex: 1 }}>
                  <div className="hrow" style={{ justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                    <div className="hrow" style={{ gap: 12, minWidth: 0 }}>
                      <ProtoTile proto={c.proto} size={38} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 650, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <div className="hrow" style={{ gap: 8, marginTop: 3 }}><span className="tag">{c.proto}</span><span className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{c.host}</span></div>
                      </div>
                    </div>
                    <span style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="lock" size={14} style={{ color: 'var(--accent)' }} /></span>
                  </div>
                  {c.accounts.map((a) => (
                    <div key={a.user} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '9px 10px', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)', marginTop: 8, background: 'var(--surface-2)' }}>
                      <div className="hrow" style={{ gap: 9, minWidth: 0 }}>
                        <AcctIcon kind={a.kind} />
                        <div style={{ minWidth: 0 }}>
                          <div className="mono" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{a.user}</div>
                          <div style={{ fontSize: '11px', color: 'var(--mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.kind} · updated {a.updated}</div>
                        </div>
                      </div>
                      <span style={securedPill}>SECURED</span>
                    </div>
                  ))}
                </div>
                <div className="hrow" style={{ gap: 8, padding: '10px 12px', borderTop: '1px solid var(--hair)' }}>
                  <button className="btn btn-sec btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); open(c) }}><Icon name="settings" size={13} />Manage</button>
                  <button className="icon-btn" title="Reveal (MFA)" onClick={(e) => reveal(e, c)}><Icon name="eye" size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          rows.map((c) => (
            <div key={c.name} onClick={() => open(c)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 110px 220px 130px', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--hair)', cursor: 'pointer' }}>
              <div className="hrow" style={{ gap: 12, minWidth: 0 }}>
                <ProtoTile proto={c.proto} size={30} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
              </div>
              <span className="tag">{c.proto}</span>
              <span className="hrow mono" style={{ gap: 7, fontSize: '12px', color: 'var(--ink-2)' }}><Icon name="server" size={13} style={{ color: 'var(--faint)' }} />{c.host}</span>
              <span className="hrow" style={{ gap: 8, justifyContent: 'flex-end', fontSize: '12px', color: 'var(--mut)' }}>{c.accounts.length} account{c.accounts.length === 1 ? '' : 's'}<Icon name="chevR" size={14} style={{ color: 'var(--faint)' }} /></span>
            </div>
          ))
        )}
      </div>

      {addOpen && <AddCredentialModal onClose={() => setAddOpen(false)} />}
    </>
  )
}
