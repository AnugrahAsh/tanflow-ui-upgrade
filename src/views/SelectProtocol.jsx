import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ProtoMark from '../components/ProtoMark.jsx'
import { useApp } from '../context/AppContext.jsx'
import { PROTO_GROUPS, PROTO_META } from '../data/protocolSchema.js'
import { PageHead } from '../components/ui.jsx'

export default function SelectProtocol() {
  const { go } = useApp()
  const [q, setQ] = useState('')
  const match = (id) => !q || PROTO_META[id].name.toLowerCase().includes(q.toLowerCase())
  const groups = PROTO_GROUPS.map((g) => ({ ...g, items: g.items.filter(match) })).filter((g) => g.items.length)

  return (
    <>
      <PageHead
        title="Select Protocol"
        sub="Choose the connection type you want to configure."
        actions={
          <button className="btn btn-sec" onClick={() => go('connections')}>
            <Icon name="arrowLeft" />
            Back
          </button>
        }
      />

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="toolbar" style={{ padding: '12px 16px', borderBottom: 'none' }}>
          <div className="search-inp" style={{ width: '100%', maxWidth: 420 }}>
            <Icon name="search" size={14} />
            <input className="inp" placeholder="Search protocols…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty" style={{ padding: '64px 20px' }}>
          <div className="e-ic"><Icon name="search" size={22} /></div>
          <div className="e-t">No protocols match</div>
          <div className="e-s">Try a different search term.</div>
        </div>
      ) : groups.map((g) => (
        <div key={g.title} style={{ marginBottom: 32 }}>
          <div className="hrow" style={{ gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{g.title}</span>
            <span style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{g.sub}</span>
            <span style={{ flex: 1, height: 1, background: 'var(--line-2)', marginLeft: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {g.items.map((id) => (
              <button
                key={id}
                className="card conn-card"
                onClick={() => go('create-connection/' + id)}
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none'
                }}>
                  <ProtoMark id={id} size={24} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 650, color: 'var(--ink)', marginBottom: 2 }}>
                    {PROTO_META[id].name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Configure {PROTO_META[id].name} target
                  </div>
                </div>
                <Icon name="arrowRight" size={16} style={{ color: 'var(--faint)', flex: 'none' }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
