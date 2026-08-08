import Icon from './Icon.jsx'

const transcriptLines = (rec) => [
  ['00:00', 'Session started', `${rec.user} connected to ${rec.conn} (${rec.host}).`],
  ['00:18', 'Authentication completed', 'Gateway policy and session recording were enabled.'],
  ['02:14', 'Command activity', 'Administrative activity was captured in the session transcript.'],
  ['06:37', 'Session event', 'Configuration review completed.'],
  [rec.dur, 'Session ended', 'Connection closed normally.'],
]

export default function SessionTranscript({ rec, onClose }) {
  const lines = transcriptLines(rec)
  const download = () => {
    const text = [`Session transcript`, `Connection: ${rec.conn}`, `User: ${rec.user}`, `Host: ${rec.host}`, `Started: ${rec.date} ${rec.start}`, '', ...lines.map(([time, event, detail]) => `[${time}] ${event}\n${detail}`)].join('\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${rec.conn}-${rec.id}-transcript.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,.45)' }} onClick={onClose} />
      <section className="card" role="dialog" aria-modal="true" aria-labelledby="transcript-title" style={{ position: 'relative', width: 'min(760px, 96vw)', maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)' }}>
        <div className="hrow" style={{ justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--hair)' }}>
          <div className="hrow" style={{ gap: 10, minWidth: 0 }}><span style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="reports" size={16} /></span><div><div id="transcript-title" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Session transcript</div><div className="mono" style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: 2 }}>{rec.conn} · {rec.recId}</div></div></div>
          <div className="hrow" style={{ gap: 8 }}><button className="btn btn-sec btn-sm" onClick={download}><Icon name="download" size={13} />Download .txt</button><button className="icon-btn" onClick={onClose} aria-label="Close transcript"><Icon name="x" size={16} /></button></div>
        </div>
        <div style={{ overflow: 'auto', padding: '4px 20px 16px' }}>
          <div className="hrow" style={{ gap: 18, padding: '13px 0', fontSize: '12px', color: 'var(--mut)', borderBottom: '1px solid var(--hair)', flexWrap: 'wrap' }}><span>User <b style={{ color: 'var(--ink-2)' }}>{rec.user}</b></span><span>Host <b className="mono" style={{ color: 'var(--ink-2)' }}>{rec.host}</b></span><span>Duration <b style={{ color: 'var(--ink-2)' }}>{rec.dur}</b></span></div>
          {lines.map(([time, event, detail], index) => <div key={`${time}-${event}`} style={{ display: 'grid', gridTemplateColumns: '58px 1fr', gap: 12, padding: '14px 0', borderBottom: index < lines.length - 1 ? '1px solid var(--hair)' : 'none' }}><span className="mono" style={{ fontSize: '11.5px', color: 'var(--accent)', paddingTop: 1 }}>{time}</span><div><div style={{ fontSize: '12.75px', color: 'var(--ink)', fontWeight: 650 }}>{event}</div><div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: 3, lineHeight: 1.5 }}>{detail}</div></div></div>)}
        </div>
      </section>
    </div>
  )
}
