import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Avatar, Badge, StatusBadge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { wave } from '../lib/series.js'
import { fmt } from '../lib/format.js'
import { CAMPAIGNS } from '../data/mockData.js'

const QUEUE = [
  { u: 'Marcus Bennett', item: 'root @ sap-prd-app01 (standing)', ai: 'Flag — unused 34 days; JIT alternative available', aiT: 'bad' },
  { u: 'Priya Sharma', item: 'SYS @ ora-fin-prd-03', ai: 'Keep — 92% weekly usage, matches DBA peer group', aiT: 'ok' },
  { u: 'Divya Patel', item: 'SAP_FI_Payments_Approvers', ai: 'Flag — SoD conflict with Payment Creator (AR-20441)', aiT: 'bad' },
  { u: 'Erik Lindqvist', item: 'Domain Admins', ai: 'Keep — Tier-0 on-call rotation, used 5× this week', aiT: 'ok' },
  { u: 'Freya Berg', item: 'SWIFT Operators', ai: 'Review — role changes next month (mover event)', aiT: 'warn' },
  { u: 'Omar Aziz', item: 'netadmin @ fw-core-01', ai: 'Keep — matches NetOps baseline', aiT: 'ok' },
]
const AI_COLOR = { ok: 'ok', bad: 'bad' }

export default function Certs() {
  const { toast } = useApp()
  const [decisions, setDecisions] = useState({})

  const decide = (i, keep) => {
    setDecisions((d) => ({ ...d, [i]: keep ? 'keep' : 'revoke' }))
    toast(keep ? 'ok' : 'warn', keep ? 'Access retained' : 'Revocation queued', keep ? 'Decision recorded with attestation note.' : 'Revocation executes on campaign close (or immediately if flagged).')
  }

  return (
    <>
      <PageHead
        title="Access Certifications"
        sub="Recurring and event-driven recertification with evidence-grade audit trails — built for SOX, PCI and ISO auditors."
        actions={
          <>
            <button className="btn btn-sec"><Icon name="download" />Auditor export</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'New campaign', 'Campaign wizard: scope, reviewers, escalation, auto-revoke (demo).')}><Icon name="plus" />Launch campaign</button>
          </>
        }
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Active campaigns" icon="certs" val="4" foot="50,198 items in scope" />
        <KpiTile label="Decisions made" icon="check" val="15,980" delta={22} foot="this quarter" spark={wave(12, 40, 20, 19)} />
        <KpiTile label="Revocation rate" icon="ban" val="6.8" unit="%" foot="1,086 access removals" />
        <KpiTile label="Reviewer SLA breaches" icon="clock" val="14" delta={-30} goodUp={false} foot="auto-escalated" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <CardHeader title="Campaigns" sub="Progress, reviewers and deadlines" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Campaign</th><th>Scope</th><th style={{ width: 220 }}>Progress</th><th className="td-right">Items</th><th className="td-right">Reviewers</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.n} onClick={() => toast('ok', c.n, 'Campaign detail: reviewer heatmap, decision log, escalations (demo).')}>
                  <td className="td-main">{c.n}</td>
                  <td style={{ color: 'var(--mut)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.scope}</td>
                  <td><div className="hrow"><div className={`meter ${c.prog === 100 ? 'm-ok' : c.prog < 35 ? 'm-warn' : ''}`} style={{ flex: 1 }}><i style={{ width: `${c.prog}%` }} /></div><span className="num" style={{ fontSize: '11.5px', fontWeight: 650, width: 34, textAlign: 'right' }}>{c.prog}%</span></div></td>
                  <td className="td-right td-num">{fmt(c.items)}</td>
                  <td className="td-right td-num">{c.rev || '—'}</td>
                  <td className="td-num" style={{ color: 'var(--mut)' }}>{c.due}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <CardHeader title="My review queue" sub="Q3 SOX — Privileged Access · 6 of 42 items" right={<span className="tag tag-acc">AI-assisted</span>} />
        <div>
          {QUEUE.map((x, i) => {
            const decision = decisions[i]
            return (
              <div key={x.u} className="cert-item" style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--hair)', ...(decision ? { transition: 'all .3s', opacity: 0.35 } : null) }}>
                <Avatar name={x.u} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.75px' }}><b>{x.u}</b> <span style={{ color: 'var(--faint)' }}>·</span> <span className="mono" style={{ fontSize: '11.5px' }}>{x.item}</span></div>
                  <div style={{ fontSize: '11.75px', marginTop: 3, color: 'var(--mut)' }}><Icon name="sparkle" size={11} /> <span style={{ color: `var(--${AI_COLOR[x.aiT] || 'warn'})` }}>{x.ai}</span></div>
                </div>
                <div className="cert-actions hrow" style={{ flex: 'none' }}>
                  {decision ? (
                    decision === 'keep' ? <Badge tone="ok" label="Retained" /> : <Badge tone="bad" label="Revoke queued" />
                  ) : (
                    <>
                      <button className="btn btn-sec btn-sm" onClick={() => decide(i, true)}><Icon name="check" />Retain</button>
                      <button className="btn btn-danger btn-sm" onClick={() => decide(i, false)}><Icon name="ban" />Revoke</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="tbl-foot"><span>Bulk actions apply only to AI-“Keep” items — flagged items always need explicit review.</span>
          <button className="btn btn-sec btn-sm" style={{ marginLeft: 'auto' }} onClick={() => toast('ok', 'Bulk retain', '3 low-risk items retained with attestation (demo).')}>Retain all AI-approved</button></div>
      </div>
    </>
  )
}
