import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

/* §4 — byte-timed replay of a script(1) typescript.
   Each chunk carries the delay that preceded it, so playback reproduces the
   operator's real typing cadence rather than dumping the whole log. */

// [delaySeconds, text, kind] — kind: out | in | deny
const STREAM = [
  [0.0, '[session opened] root@BTSPAMDEMO01 — recorded\n', 'out'],
  [0.6, '$ ', 'out'], [0.35, 'systemctl status replication-agent\n', 'in'],
  [0.5, '● replication-agent.service — Tanflow replication agent\n   Active: active (running) since Wed 02:14:07 UTC; 6h ago\n   Memory: 214.6M    Tasks: 18\n', 'out'],
  [0.9, '$ ', 'out'], [0.4, 'tail -n 3 /var/log/replication.log\n', 'in'],
  [0.45, '02:41:18  WARN  replica lag 42s on shard eu-2\n02:41:52  INFO  catch-up started\n02:43:09  INFO  lag 0s — nominal\n', 'out'],
  [1.1, '$ ', 'out'], [0.5, 'sudo su -\n', 'in'],
  [0.4, '[sudo] password for ubuntu: ', 'out'], [0.6, '••••••••\n', 'in'],
  [0.5, 'root@BTSPAMDEMO01:~# ', 'out'],
  [0.8, 'rm -rf /var/lib/postgresql/data\n', 'in'],
  [0.3, 'tanflow: command blocked by policy “Prod-Deny baseline” (rule 44)\n', 'deny'],
  [1.0, 'root@BTSPAMDEMO01:~# ', 'out'], [0.45, 'exit\n', 'in'],
  [0.4, '[session closed] duration 00:11:02 · 214 commands · 1 blocked\n', 'out'],
]
const TONE = { out: '#C8D4EA', in: '#7FE0A6', deny: '#FF8A80' }
const SPEEDS = [1, 2, 4]

export default function SessionTypescript({ compact }) {
  const [idx, setIdx] = useState(STREAM.length) // start fully rendered
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0)
  const boxRef = useRef(null)
  const timer = useRef(null)

  // Advance one chunk at a time, honouring each chunk's recorded delay.
  useEffect(() => {
    if (!playing) return undefined
    if (idx >= STREAM.length) { setPlaying(false); return undefined }
    const delay = (STREAM[idx][0] * 1000) / SPEEDS[speed]
    timer.current = setTimeout(() => setIdx((i) => i + 1), Math.max(60, delay))
    return () => clearTimeout(timer.current)
  }, [playing, idx, speed])

  useEffect(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight }, [idx])

  const replay = () => { setIdx(0); setPlaying(true) }
  const shown = STREAM.slice(0, idx)

  return (
    <div>
      <div className="hrow" style={{ justifyContent: 'space-between', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        <span className="hrow" style={{ gap: 7, fontSize: '12.25px', fontWeight: 650, color: 'var(--ink)' }}>
          <Icon name="commands" size={14} style={{ color: 'var(--mut)' }} />Typescript
          <span className="tag">{STREAM.length} chunks</span>
        </span>
        <div className="hrow" style={{ gap: 6 }}>
          <button className="btn btn-sec btn-sm" onClick={() => (playing ? setPlaying(false) : idx >= STREAM.length ? replay() : setPlaying(true))}>
            <Icon name={playing ? 'pause' : 'play'} size={12} />{playing ? 'Pause' : idx >= STREAM.length ? 'Replay' : 'Play'}
          </button>
          <button className="btn btn-sec btn-sm" onClick={() => setSpeed((s) => (s + 1) % SPEEDS.length)}>{SPEEDS[speed]}×</button>
          <button className="btn btn-sec btn-sm" onClick={() => setIdx(STREAM.length)}><Icon name="download" size={12} />Raw</button>
        </div>
      </div>

      <div ref={boxRef} className="mono" style={{ background: '#0B1220', border: '1px solid #1D2942', borderRadius: 'var(--r-sm)', padding: '12px 14px', fontSize: '11.75px', lineHeight: 1.7, color: '#C8D4EA', height: compact ? 190 : 280, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {shown.map(([, text, kind], i) => (
          <span key={i} style={{ color: TONE[kind], background: kind === 'deny' ? 'rgba(255,138,128,.12)' : undefined }}>{text}</span>
        ))}
        {playing && <span style={{ background: '#C8D4EA', color: '#0B1220' }}>&nbsp;</span>}
      </div>

      <div className="hrow" style={{ gap: 14, marginTop: 8, fontSize: '11.25px', color: 'var(--mut)', flexWrap: 'wrap' }}>
        {[['#7FE0A6', 'operator input'], ['#C8D4EA', 'terminal output'], ['#FF8A80', 'policy denial']].map(([c, t]) => (
          <span key={t} className="hrow" style={{ gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{t}</span>
        ))}
        <span style={{ marginLeft: 'auto' }}>Timing preserved from the original capture</span>
      </div>
    </div>
  )
}
