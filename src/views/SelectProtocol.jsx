import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ProtoMark from '../components/ProtoMark.jsx'
import { useApp } from '../context/AppContext.jsx'
import { PROTO_GROUPS, PROTO_META } from '../data/protocolSchema.js'

export default function SelectProtocol() {
  const { go } = useApp()
  const [q, setQ] = useState('')
  const match = (id) => !q || PROTO_META[id].name.toLowerCase().includes(q.toLowerCase())
  const groups = PROTO_GROUPS.map((g) => ({ ...g, items: g.items.filter(match) })).filter((g) => g.items.length)

  return (
    <>
      <div className="hrow" style={{ gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
        <button className="btn btn-sec btn-sm" onClick={() => go('connections')} style={{ marginTop: 2 }}><Icon name="arrowLeft" size={15} />Back</button>
        <span style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="integrations" size={21} style={{ color: 'var(--accent)' }} /></span>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)' }}>Select Protocol</div>
          <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: 2 }}>Choose the connection type you want to configure.</div>
        </div>
      </div>

      <div className="search-inp" style={{ maxWidth: 420, marginBottom: 26 }}><Icon name="search" size={14} /><input className="inp" placeholder="Search protocols…" value={q} onChange={(e) => setQ(e.target.value)} /></div>

      {groups.length === 0 ? (
        <div className="empty" style={{ padding: '56px 20px' }}><div className="e-ic"><Icon name="search" size={22} /></div><div className="e-t">No protocols match</div><div className="e-s">Try a different search term.</div></div>
      ) : groups.map((g) => (
        <div key={g.title} style={{ marginBottom: 30 }}>
          <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)' }}>{g.title}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--mut)', marginTop: 2, marginBottom: 14 }}>{g.sub}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
            {g.items.map((id) => (
              <button key={id} className="card" onClick={() => go('create-connection/' + id)} style={{ padding: '28px 16px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow .12s, border-color .12s' }}>
                <span style={{ height: 44, display: 'flex', alignItems: 'center' }}><ProtoMark id={id} size={40} /></span>
                <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--ink)', textAlign: 'center' }}>{PROTO_META[id].name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
