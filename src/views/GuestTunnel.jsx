import { useState, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'

/* §3 — the guest's session console. Deliberately narrower than the operator's
   SessionConsole: no rail, no file transfer, no clipboard egress. A viewer sees
   the stream, who else is present, and how to leave. */

const hms = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':')

const PARTICIPANTS = [
  { name: 'Tribhuwan Rao', role: 'Host · full control', host: true },
  { name: 'You', role: 'Viewer · read-only', you: true },
  { name: 'S. Okafor (SOC)', role: 'Viewer · read-only' },
]

function RemoteView() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0B1220', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(14px, 2.5vw, 34px)' }}>
      <div style={{ width: '100%', maxWidth: 980, background: '#0E1526', border: '1px solid #1D2942', borderRadius: 4, overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: '#111A2E', borderBottom: '1px solid #1D2942' }}>
          <Icon name="commands" size={13} style={{ color: '#7FE0A6' }} />
          <span className="mono" style={{ fontSize: 12, color: '#9FB2D4' }}>root@BTSPAMDEMO01: ~</span>
        </div>
        <div className="mono" style={{ padding: '16px 18px', fontSize: 12.5, lineHeight: 1.75, color: '#C8D4EA', minHeight: 260 }}>
          <div><span style={{ color: '#7FE0A6' }}>root@BTSPAMDEMO01</span>:<span style={{ color: '#8AB0F5' }}>~</span># systemctl status replication-agent</div>
          <div style={{ color: '#8496B8' }}>● replication-agent.service — Tanflow replication agent</div>
          <div style={{ color: '#8496B8' }}>   Active: <span style={{ color: '#7FE0A6' }}>active (running)</span> since Wed 02:14:07 UTC; 6h ago</div>
          <div style={{ color: '#8496B8' }}>   Memory: 214.6M    Tasks: 18</div>
          <div style={{ marginTop: 10 }}><span style={{ color: '#7FE0A6' }}>root@BTSPAMDEMO01</span>:<span style={{ color: '#8AB0F5' }}>~</span># tail -n 3 /var/log/replication.log</div>
          <div style={{ color: '#8496B8' }}>02:41:18  WARN  replica lag 42s on shard eu-2</div>
          <div style={{ color: '#8496B8' }}>02:41:52  INFO  catch-up started</div>
          <div style={{ color: '#8496B8' }}>02:43:09  INFO  lag 0s — nominal</div>
          <div style={{ marginTop: 10 }}><span style={{ color: '#7FE0A6' }}>root@BTSPAMDEMO01</span>:<span style={{ color: '#8AB0F5' }}>~</span># <span style={{ background: '#C8D4EA', color: '#0E1526' }}>&nbsp;</span></div>
        </div>
      </div>

      {/* Identity watermark — every guest view is attributable. */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ transform: 'rotate(-24deg)', fontSize: 'clamp(22px, 3.4vw, 40px)', fontWeight: 800, color: 'rgba(255,255,255,.045)', letterSpacing: '.06em', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.9 }}>
          auditor@kpmg-ext.com<br />auditor@kpmg-ext.com<br />auditor@kpmg-ext.com
        </div>
      </div>
    </div>
  )
}

export default function GuestTunnel() {
  const { go, toast } = useApp()
  const [sec, setSec] = useState(0)
  const [panel, setPanel] = useState(true)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    if (ended) return undefined
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [ended])

  if (ended) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--sans)' }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <span style={{ width: 56, height: 56, borderRadius: 'var(--r)', background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="logout" size={25} style={{ color: 'var(--mut)' }} /></span>
          <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)', marginTop: 18 }}>You’ve left the session</div>
          <div style={{ fontSize: '13.5px', color: 'var(--mut)', marginTop: 8, lineHeight: 1.6 }}>Your access ended after {hms(sec)}. The recording remains with {`Meridian Global Bank`} under their retention policy.</div>
          <button className="btn btn-sec" style={{ marginTop: 22 }} onClick={() => go('share')}><Icon name="arrowLeft" size={15} />Back to the invitation</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0A1120', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--sans)' }}>
      {/* top bar */}
      <div style={{ height: 54, flex: 'none', background: '#0A1120', borderBottom: '1px solid rgba(255,255,255,.09)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', flexWrap: 'wrap' }}>
        <img src="assets/brand/tanflow-logo-1200w-white.png" alt="Tanflow" style={{ height: 20, flex: 'none' }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#EAF0FB', lineHeight: 1.15 }}>BTSPAMDEMO01</div>
          <div className="mono" style={{ fontSize: '10.75px', color: '#8496B8' }}>shared by Tribhuwan Rao</div>
        </div>
        <span className="hrow" style={{ gap: 6, fontSize: '11.5px', fontWeight: 700, color: '#E0524D' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E0524D', boxShadow: '0 0 0 3px rgba(224,82,77,.25)' }} />Recording</span>
        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#9FB2D4', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 'var(--r-xs)', padding: '2px 7px' }}>VIEW ONLY</span>
        <span className="mono" style={{ fontSize: '12.5px', fontWeight: 600, color: '#EAF0FB' }}>{hms(sec)}</span>
        <div className="hrow" style={{ gap: 8, marginLeft: 'auto', flex: 'none' }}>
          <button onClick={() => setPanel((p) => !p)} title={panel ? 'Hide details' : 'Show details'} style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: '#9FB2D4', border: '1px solid rgba(255,255,255,.14)' }}><Icon name={panel ? 'chevR' : 'chevL'} size={15} /></button>
          <button onClick={() => setEnded(true)} className="hrow" style={{ gap: 7, height: 32, padding: '0 13px', borderRadius: 'var(--r-sm)', background: '#D0342C', color: '#fff', fontSize: '12.75px', fontWeight: 650 }}><Icon name="logout" size={14} />Leave</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}><RemoteView /></div>

        {panel && (
          <div style={{ width: 292, flex: 'none', background: 'var(--surface)', borderLeft: '1px solid var(--line)', overflowY: 'auto', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>In this session</div>
            {PARTICIPANTS.map((p) => (
              <div key={p.name} className="hrow" style={{ gap: 10, padding: '10px 0', borderBottom: '1px solid var(--hair)' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: p.you ? 'var(--accent-bg)' : 'var(--surface-3)', border: `1px solid ${p.you ? 'var(--accent-line)' : 'var(--line)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: p.you ? 'var(--accent)' : 'var(--mut)', flex: 'none' }}>
                  {p.name === 'You' ? 'Y' : p.name.split(/[ .]/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12.75px', fontWeight: 650, color: 'var(--ink)' }}>{p.name}</div>
                  <div style={{ fontSize: '11.25px', color: 'var(--mut)' }}>{p.role}</div>
                </div>
                {p.host && <Icon name="star" size={13} style={{ color: '#F5A623', marginLeft: 'auto', flex: 'none' }} />}
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', margin: '20px 0 8px' }}>What you can do</div>
            {[['eye', 'Watch the live stream', true], ['chat', 'Ask the host to act', true], ['commands', 'Type into the session', false], ['folder', 'Transfer files', false], ['copy', 'Copy text out', false]].map(([ic, t, allowed]) => (
              <div key={t} className="hrow" style={{ gap: 9, padding: '7px 0' }}>
                <Icon name={allowed ? 'check' : 'ban'} size={13} style={{ color: allowed ? 'var(--ok)' : 'var(--faint)', flex: 'none' }} />
                <Icon name={ic} size={13} style={{ color: 'var(--mut)', flex: 'none' }} />
                <span style={{ fontSize: '12.25px', color: allowed ? 'var(--ink-2)' : 'var(--faint)', textDecoration: allowed ? 'none' : 'line-through' }}>{t}</span>
              </div>
            ))}

            <div className="hrow" style={{ gap: 10, alignItems: 'flex-start', marginTop: 18, padding: '11px 12px', background: 'var(--warn-bg)', border: '1px solid var(--warn-line)', borderRadius: 'var(--r-sm)' }}>
              <Icon name="recordings" size={15} style={{ color: 'var(--warn-core)', flex: 'none', marginTop: 1 }} />
              <div style={{ fontSize: '11.75px', color: 'var(--ink-2)', lineHeight: 1.5 }}>Your view is watermarked with your email and recorded alongside the host’s.</div>
            </div>

            <button className="btn btn-sec btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={() => toast('ok', 'Host notified', 'Tribhuwan Rao has been asked to look at your message (demo).')}>
              <Icon name="chat" size={13} />Message the host
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
