import { useState, useMemo, Fragment } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }
const TARGETS = ['Linux', 'Windows', 'macOS', 'Database', 'Network device']
const ACTIONS = ['Deny — notify', 'Deny — silent', 'Deny — kill session', 'Warn — allow', 'Allow — audit']
const SCOPE_OPTIONS = ['BTSPAMDEMO01', 'BTSIAMRETEST01', 'BTSIAMRETEST02', 'BTSIDAMDEMO01', 'BTSPAMDEMO02', 'BTSPAMDEV01', 'BTSPLVAPTSRV01', 'TANFLOWAPP01']

const SEED = [
  { id: 1, name: 'test case', desc: 'Scratch policy kept from the rollout dry-run.', mode: 'Blocklist', target: 'Linux', scope: ['BTSIDAMDEMO01'], rules: [{ pattern: 'shutdown', action: 'Deny — notify', regex: false }], exceptions: [], active: false },
  { id: 2, name: 'Linux Hardened Policy', desc: 'Baseline blocklist applied to Linux sessions.', mode: 'Blocklist', target: 'Linux', scope: ['BTSPAMDEMO01', 'BTSPAMDEMO02', 'BTSPAMDEV01', 'BTSIDAMDEMO01'], rules: [{ pattern: 'rm -rf /', action: 'Deny — kill session', regex: false }, { pattern: 'sudo', action: 'Deny — notify', regex: false }], exceptions: [], active: true },
]

const actionTone = (a) => a.startsWith('Deny') ? 'bad' : a.startsWith('Warn') ? 'warn' : 'ok'

const ModeTag = ({ mode }) => {
  const blk = mode === 'Blocklist'
  return <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.04em', color: blk ? 'var(--warn)' : 'var(--accent)', background: blk ? 'var(--warn-bg)' : 'var(--accent-bg)', border: `1px solid ${blk ? 'var(--warn-line)' : 'var(--accent-line)'}`, borderRadius: 'var(--r-xs)', padding: '2px 7px', whiteSpace: 'nowrap' }}>{mode.toUpperCase()}</span>
}
const TargetPill = ({ t }) => (
  <span className="hrow" style={{ gap: 6, fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '.03em', whiteSpace: 'nowrap' }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', border: '2px solid var(--faint)', flex: 'none' }} />{t}
  </span>
)
const CountBadge = ({ n }) => (
  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-2)', background: 'var(--surface-3)', border: '1px solid var(--line)', borderRadius: 999, minWidth: 22, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{n}</span>
)
const Stat = ({ icon, num, sub, text, green }) => (
  <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: green ? 'var(--ok-bg)' : 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={18} style={{ color: green ? 'var(--ok)' : 'var(--accent)' }} /></span>
    <div style={{ minWidth: 0 }}><div style={{ fontSize: 22, fontWeight: 750, lineHeight: 1, color: 'var(--ink)' }}>{num}{sub && <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--mut)', marginLeft: 5 }}>{sub}</span>}</div><div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--mut)', marginTop: 6 }}>{text}</div></div>
  </div>
)
const Check = ({ on }) => (
  <span style={{ width: 18, height: 18, borderRadius: 'var(--r-xs)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--accent)' : 'var(--surface)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line-2)'}` }}>{on && <Icon name="check" size={12} style={{ color: '#fff' }} />}</span>
)
const Field = ({ label: l, help, children }) => (
  <div className="field" style={{ gap: 6 }}><label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{l}</label>{children}{help && <div className="f-help">{help}</div>}</div>
)

function PolicyDrawer({ initial, onSave }) {
  const { toast, closeDrawer } = useApp()
  const [tab, setTab] = useState('Definition')
  const [f, setF] = useState(initial || { name: '', desc: '', mode: 'Blocklist', target: 'Linux', scope: [], rules: [], exceptions: [], active: false })
  const [rule, setRule] = useState({ pattern: '', action: 'Deny — notify', regex: false })
  const [exc, setExc] = useState({ subject: '', from: '', until: '', reason: '' })

  const upd = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const toggleScope = (s) => setF((p) => ({ ...p, scope: p.scope.includes(s) ? p.scope.filter((x) => x !== s) : [...p.scope, s] }))
  const addRule = () => { if (!rule.pattern.trim()) return; setF((p) => ({ ...p, rules: [...p.rules, { ...rule, pattern: rule.pattern.trim() }] })); setRule({ pattern: '', action: 'Deny — notify', regex: false }) }
  const removeRule = (i) => setF((p) => ({ ...p, rules: p.rules.filter((_, idx) => idx !== i) }))
  const addExc = () => { if (!exc.subject.trim()) return; setF((p) => ({ ...p, exceptions: [...p.exceptions, { ...exc, subject: exc.subject.trim() }] })); setExc({ subject: '', from: '', until: '', reason: '' }) }
  const removeExc = (i) => setF((p) => ({ ...p, exceptions: p.exceptions.filter((_, idx) => idx !== i) }))
  const valid = f.name.trim().length > 0
  const save = () => { onSave({ ...f, name: f.name.trim() }); toast('ok', initial ? 'Policy updated' : 'Policy created', `${f.name.trim()} — ${f.rules.length} rule${f.rules.length === 1 ? '' : 's'}, ${f.scope.length} target${f.scope.length === 1 ? '' : 's'} in scope (demo).`); closeDrawer() }

  return (
    <>
      <div className="drawer-h">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--warn-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="commands" size={18} style={{ color: 'var(--warn)' }} /></span>
          <div><div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.01em' }}>{initial ? 'Edit policy' : 'Create policy'}</div><div style={{ fontSize: '12.25px', color: 'var(--mut)', marginTop: 2 }}>Rules evaluate inline on every command in scope — first match wins.</div></div>
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {['Definition', 'Rules', 'Exceptions'].map((t) => (
            <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}
              {t === 'Rules' && f.rules.length > 0 && <span className="t-n">{f.rules.length}</span>}
              {t === 'Exceptions' && f.exceptions.length > 0 && <span className="t-n">{f.exceptions.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="drawer-body" style={{ paddingTop: 14 }}>
        {tab === 'Definition' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Policy name"><input className="inp" placeholder="e.g. Linux Hardened Policy" value={f.name} onChange={(e) => upd('name', e.target.value)} /></Field>
            <Field label="Description"><input className="inp" placeholder="What this policy protects" value={f.desc} onChange={(e) => upd('desc', e.target.value)} /></Field>
            <Field label="Mode" help="Blocklist: everything runs except what a rule denies. Allowlist: nothing runs unless a rule permits it.">
              <div className="seg">{['Blocklist', 'Allowlist'].map((m) => <button key={m} className={f.mode === m ? 'on' : ''} onClick={() => upd('mode', m)}>{m}</button>)}</div>
            </Field>
            <Field label="Target type" help="Rules are matched against the shell of this OS family — a policy governs one target type.">
              <select className="sel" value={f.target} onChange={(e) => upd('target', e.target.value)}>{TARGETS.map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
            <div>
              <div style={{ ...label, marginBottom: 8 }}>Connection scope</div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', maxHeight: 220, overflowY: 'auto' }}>
                {SCOPE_OPTIONS.map((s, i) => (
                  <label key={s} onClick={() => toggleScope(s)} className="hrow" style={{ gap: 10, padding: '9px 12px', cursor: 'pointer', borderTop: i ? '1px solid var(--hair)' : 'none' }}>
                    <Check on={f.scope.includes(s)} /><span className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>{s}</span>
                  </label>
                ))}
              </div>
              <div className="f-help" style={{ marginTop: 6 }}>{f.scope.length} target{f.scope.length === 1 ? '' : 's'} selected.</div>
            </div>
            <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)' }}>
              <Icon name="warnTri" size={16} style={{ color: 'var(--warn)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}><b>Server-wide enforcement.</b> Applies to every user on the selected targets — including administrators. Exempt people on the Exceptions tab, never by weakening rules.</div>
            </div>
          </div>
        )}

        {tab === 'Rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ ...label, marginBottom: 8 }}>Configured rules</div>
              {f.rules.length === 0 ? (
                <div style={{ fontSize: '12.5px', color: 'var(--mut)', lineHeight: 1.5, padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--hair)', borderRadius: 'var(--r-sm)' }}>No rules yet. In blocklist mode an empty policy blocks nothing; in allowlist mode it blocks everything.</div>
              ) : f.rules.map((r, i) => (
                <div key={i} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
                  <div className="hrow" style={{ gap: 9, minWidth: 0, flexWrap: 'wrap' }}>
                    <span className="code-chip">{r.pattern}</span>
                    <Badge tone={actionTone(r.action)} label={r.action} dot={false} />
                    {r.regex && <span className="tag tag-acc">regex</span>}
                  </div>
                  <button className="mini-btn danger" title="Remove rule" style={{ opacity: 1 }} onClick={() => removeRule(i)}><Icon name="trash" size={14} /></button>
                </div>
              ))}
            </div>
            <div>
              <div style={{ ...label, marginBottom: 10 }}>Add rule</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Keyword / pattern"><input className="inp" placeholder="e.g. rm -rf or sudo" value={rule.pattern} onChange={(e) => setRule((p) => ({ ...p, pattern: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addRule() }} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
                  <Field label="Action"><select className="sel" value={rule.action} onChange={(e) => setRule((p) => ({ ...p, action: e.target.value }))}>{ACTIONS.map((a) => <option key={a}>{a}</option>)}</select></Field>
                  <div className="field" style={{ gap: 6 }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Regex</label>
                    <label className="hrow" style={{ gap: 9, cursor: 'pointer', height: 30 }}><span className={`toggle ${rule.regex ? 'on' : ''}`} onClick={() => setRule((p) => ({ ...p, regex: !p.regex }))} /><span style={{ fontSize: '12.5px', color: 'var(--ink-2)' }}>Treat pattern as regex</span></label>
                  </div>
                </div>
                <button className="btn btn-sec" style={{ alignSelf: 'flex-start' }} onClick={addRule}><Icon name="plus" size={13} />Add rule</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Exceptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: '12.5px', color: 'var(--mut)', lineHeight: 1.5 }}>Exempted subjects are not governed by any rule in this policy. Time-box every exception — unlimited exemptions show up in posture reports.</div>
            {f.exceptions.length > 0 && (
              <div>
                <div style={{ ...label, marginBottom: 8 }}>Granted exceptions</div>
                {f.exceptions.map((x, i) => (
                  <div key={i} className="hrow" style={{ justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{x.subject}</div><div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{x.from || '—'} → {x.until || '—'}{x.reason ? ` · ${x.reason}` : ''}</div></div>
                    <button className="mini-btn danger" title="Revoke" style={{ opacity: 1 }} onClick={() => removeExc(i)}><Icon name="trash" size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <div>
              <div style={{ ...label, marginBottom: 10 }}>Grant exception</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="User or group"><div className="search-inp"><Icon name="search" size={14} /><input className="inp" placeholder="Search users or groups…" value={exc.subject} onChange={(e) => setExc((p) => ({ ...p, subject: e.target.value }))} /></div></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Valid from"><input type="datetime-local" className="sel" value={exc.from} onChange={(e) => setExc((p) => ({ ...p, from: e.target.value }))} /></Field>
                  <Field label="Valid until"><input type="datetime-local" className="sel" value={exc.until} onChange={(e) => setExc((p) => ({ ...p, until: e.target.value }))} /></Field>
                </div>
                <Field label="Reason"><input className="inp" placeholder="e.g. Emergency maintenance INC-59912" value={exc.reason} onChange={(e) => setExc((p) => ({ ...p, reason: e.target.value }))} /></Field>
                <button className="btn btn-sec" style={{ alignSelf: 'flex-start' }} onClick={addExc}><Icon name="plus" size={13} />Grant exception</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 'none', borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
        <label className="hrow" style={{ gap: 9, cursor: 'pointer' }}><span className={`toggle ${f.active ? 'on' : ''}`} onClick={() => upd('active', !f.active)} /><span style={{ fontSize: '13px', fontWeight: 600 }}>Active</span></label>
        <div className="hrow" style={{ gap: 8 }}>
          <button className="btn btn-sec" onClick={closeDrawer}>Cancel</button>
          <button className="btn btn-pri" disabled={!valid} style={{ opacity: valid ? 1 : .5, cursor: valid ? 'pointer' : 'default' }} onClick={save}><Icon name="check" />Save policy</button>
        </div>
      </div>
    </>
  )
}

export default function Commands() {
  const { toast, openDrawer } = useApp()
  const [policies, setPolicies] = useState(SEED)
  const [q, setQ] = useState('')
  const [view, setView] = useState('list')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(() => new Set())
  const [menu, setMenu] = useState(null) // { id, x, y }

  const activeCount = policies.filter((p) => p.active).length
  const rulesTotal = policies.reduce((n, p) => n + p.rules.length, 0)
  const targetsInScope = new Set(policies.flatMap((p) => p.scope)).size

  const savePolicy = (data) => setPolicies((ps) => {
    if (data.id) return ps.map((p) => (p.id === data.id ? data : p))
    const id = Math.max(0, ...ps.map((p) => p.id)) + 1
    return [...ps, { ...data, id }]
  })
  const toggleActive = (id) => setPolicies((ps) => ps.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  const toggleExpand = (id) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const openCreate = () => openDrawer(<PolicyDrawer onSave={savePolicy} />)
  const openEdit = (p) => openDrawer(<PolicyDrawer initial={p} onSave={savePolicy} />)
  const openMenu = (e, p) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setMenu({ id: p.id, x: r.right, y: r.bottom }) }
  const duplicate = (p) => { setPolicies((ps) => [...ps, { ...p, id: Math.max(0, ...ps.map((x) => x.id)) + 1, name: `${p.name} copy`, active: false }]); toast('ok', 'Policy duplicated', `${p.name} copied — review and activate when ready (demo).`) }
  const remove = (p) => { setPolicies((ps) => ps.filter((x) => x.id !== p.id)); toast('warn', 'Policy deleted', `${p.name} removed (demo).`) }

  const filtered = useMemo(() => policies.filter((p) => !q || (p.name + p.desc + p.rules.map((r) => r.pattern).join(' ') + p.scope.join(' ')).toLowerCase().includes(q.toLowerCase())), [policies, q])
  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const curPage = Math.min(page, pages)
  const start = (curPage - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)
  const menuPolicy = menu && policies.find((p) => p.id === menu.id)

  const MenuItem = ({ icon, text, danger, onClick }) => (
    <button className="hrow" style={{ gap: 9, width: '100%', padding: '7px 10px', borderRadius: 'var(--r-xs)', fontSize: '12.75px', color: danger ? 'var(--bad)' : 'var(--ink-2)', textAlign: 'left' }} onMouseDown={(e) => e.preventDefault()} onClick={onClick}><Icon name={icon} size={14} />{text}</button>
  )

  return (
    <>
      <PageHead
        title="Command Restrictions"
        sub="Define which commands users can run inside their sessions."
        actions={<button className="btn btn-pri" onClick={openCreate}><Icon name="plus" />Create Policy</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '150px 152px 150px 182px 1fr', gap: 16, marginBottom: 16 }}>
        <Stat icon="commands" num={policies.length} text="Policies" />
        <Stat icon="check" num={activeCount} sub={`of ${policies.length}`} text="Active" green />
        <Stat icon="commands" num={rulesTotal} text="Rules" />
        <Stat icon="server" num={targetsInScope} text="Targets in scope" />
        <div className="card card-pad hrow" style={{ gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--warn-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="warnTri" size={18} style={{ color: 'var(--warn)' }} /></span>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>Rules evaluate inline on every command in scope — <b>first match wins</b>. An inactive policy stops evaluating immediately.</div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <span className="hrow" style={{ gap: 7, fontSize: '12.5px', color: 'var(--mut)' }}>Show
            <select className="sel" style={{ width: 66, height: 28 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}>{[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}</select>
            entries</span>
          <div className="tb-spacer" />
          <div className="search-inp" style={{ width: 260 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search policies and rules…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} /></div>
          <button className="icon-btn" title="List view" style={view === 'list' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('list')}><Icon name="list" size={15} /></button>
          <button className="icon-btn" title="Grid view" style={view === 'grid' ? { color: 'var(--accent)', borderColor: 'var(--accent-line)' } : undefined} onClick={() => setView('grid')}><Icon name="grid" size={15} /></button>
        </div>

        {total === 0 ? (
          <div className="empty" style={{ padding: '60px 20px' }}>
            <div className="e-ic"><Icon name="commands" size={20} /></div>
            <div className="e-t">No policies match</div>
            <div className="e-s">Adjust the search, or create a policy to restrict commands in sessions.</div>
            <div className="hrow" style={{ gap: 8, marginTop: 16 }}>
              {q && <button className="btn btn-sec btn-sm" onClick={() => setQ('')}><Icon name="refresh" size={13} />Clear search</button>}
              <button className="btn btn-pri btn-sm" onClick={openCreate}><Icon name="plus" size={13} />Create Policy</button>
            </div>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: 16 }}>
            {rows.map((p) => (
              <div key={p.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="hrow" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <div className="hrow" style={{ gap: 10, minWidth: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="commands" size={15} style={{ color: 'var(--accent)' }} /></span>
                    <span className="link" style={{ fontSize: '13.5px', fontWeight: 650 }} onClick={() => openEdit(p)}>{p.name}</span>
                  </div>
                  <button className="mini-btn" style={{ opacity: 1 }} onClick={(e) => openMenu(e, p)}><Icon name="more" size={15} /></button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--mut)', lineHeight: 1.5 }}>{p.desc || 'No description.'}</div>
                <div className="hrow" style={{ gap: 8 }}><ModeTag mode={p.mode} /><TargetPill t={p.target} /></div>
                <div className="hrow" style={{ justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--hair)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>{p.rules.length} rule{p.rules.length === 1 ? '' : 's'} · {p.scope.length} target{p.scope.length === 1 ? '' : 's'}</span>
                  <span className={`toggle ${p.active ? 'on' : ''}`} onClick={() => toggleActive(p.id)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th style={{ width: 34 }} /><th>Policy name</th><th>Mode</th><th>Target type</th><th>Rules</th><th>Active</th><th style={{ width: 80, textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <Fragment key={p.id}>
                    <tr>
                      <td><button className="mini-btn" style={{ opacity: 1 }} onClick={() => toggleExpand(p.id)} title={expanded.has(p.id) ? 'Collapse' : 'Expand'}><Icon name={expanded.has(p.id) ? 'chevD' : 'chevR'} size={14} /></button></td>
                      <td><div style={{ minWidth: 0 }}><span className="link" style={{ fontSize: '13px', fontWeight: 600 }} onClick={() => openEdit(p)}>{p.name}</span><div style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 1 }}>{p.desc}</div></div></td>
                      <td><ModeTag mode={p.mode} /></td>
                      <td><TargetPill t={p.target} /></td>
                      <td><CountBadge n={p.rules.length} /></td>
                      <td><span className={`toggle ${p.active ? 'on' : ''}`} onClick={() => toggleActive(p.id)} /></td>
                      <td style={{ textAlign: 'right' }}><button className="mini-btn" style={{ opacity: 1 }} onClick={(e) => openMenu(e, p)} title="Actions"><Icon name="more" size={15} /></button></td>
                    </tr>
                    {expanded.has(p.id) && (
                      <tr>
                        <td colSpan={7} style={{ background: 'var(--surface-2)', padding: '14px 20px 16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div>
                              <div style={{ ...label, marginBottom: 8 }}>Rules · first match wins</div>
                              {p.rules.length === 0 ? <div style={{ fontSize: '12px', color: 'var(--mut)' }}>No rules — a blocklist policy blocks nothing.</div> : p.rules.map((r, i) => (
                                <div key={i} className="hrow" style={{ gap: 9, padding: '6px 0', flexWrap: 'wrap' }}><span style={{ fontSize: '11px', color: 'var(--faint)', width: 16 }}>{i + 1}</span><span className="code-chip">{r.pattern}</span><Badge tone={actionTone(r.action)} label={r.action} dot={false} />{r.regex && <span className="tag tag-acc">regex</span>}</div>
                              ))}
                            </div>
                            <div>
                              <div style={{ ...label, marginBottom: 8 }}>Connection scope · {p.scope.length}</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{p.scope.length === 0 ? <span style={{ fontSize: '12px', color: 'var(--mut)' }}>No targets selected.</span> : p.scope.map((s) => <span key={s} className="tag mono" style={{ height: 22 }}>{s}</span>)}</div>
                              {p.exceptions.length > 0 && <div style={{ ...label, margin: '14px 0 8px' }}>Exceptions · {p.exceptions.length}</div>}
                              {p.exceptions.map((x, i) => <div key={i} style={{ fontSize: '12px', color: 'var(--ink-2)', padding: '3px 0' }}>{x.subject} <span style={{ color: 'var(--mut)' }}>· {x.reason || 'no reason'}</span></div>)}
                              <button className="btn btn-sec btn-sm" style={{ marginTop: 12 }} onClick={() => openEdit(p)}><Icon name="edit" size={13} />Edit policy</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="tbl-foot">
            <span>Showing {start + 1} to {Math.min(start + pageSize, total)} of {total} entries</span>
            <div className="pager">
              <button className="pg-btn" disabled={curPage === 1} onClick={() => setPage(curPage - 1)}><Icon name="chevL" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} className={`pg-btn ${n === curPage ? 'on' : ''}`} onClick={() => setPage(n)}>{n}</button>)}
              <button className="pg-btn" disabled={curPage === pages} onClick={() => setPage(curPage + 1)}><Icon name="chevR" /></button>
            </div>
          </div>
        )}
      </div>

      {menu && menuPolicy && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 120 }} onClick={() => setMenu(null)} />
          <div style={{ position: 'fixed', top: menu.y + 4, left: menu.x - 162, zIndex: 121, width: 162, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', boxShadow: 'var(--sh-lg)', padding: 4 }}>
            <MenuItem icon="edit" text="Edit policy" onClick={() => { setMenu(null); openEdit(menuPolicy) }} />
            <MenuItem icon="copy" text="Duplicate" onClick={() => { setMenu(null); duplicate(menuPolicy) }} />
            <MenuItem icon={menuPolicy.active ? 'ban' : 'check'} text={menuPolicy.active ? 'Deactivate' : 'Activate'} onClick={() => { setMenu(null); toggleActive(menuPolicy.id) }} />
            <div style={{ height: 1, background: 'var(--hair)', margin: '4px 0' }} />
            <MenuItem icon="trash" text="Delete" danger onClick={() => { setMenu(null); remove(menuPolicy) }} />
          </div>
        </>
      )}
    </>
  )
}
