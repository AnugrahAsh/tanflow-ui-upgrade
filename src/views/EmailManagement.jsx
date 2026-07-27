import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile, CardHeader } from '../components/ui.jsx'
import { Badge } from '../components/primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

const TEMPLATES = [
  ['Welcome / enrollment', 'Joiner lifecycle', 'EN, DE, PT, HI', 'Published'],
  ['MFA enrollment reminder', 'Security', 'EN, DE', 'Published'],
  ['Access request approved', 'Governance', 'EN, DE, PT', 'Published'],
  ['Password reset', 'Security', 'EN, DE, PT, HI', 'Published'],
  ['Certification due', 'Governance', 'EN', 'Draft'],
  ['Break-glass used', 'Security', 'EN', 'Published'],
]

export default function EmailManagement() {
  const { toast } = useApp()
  return (
    <>
      <PageHead
        title="Email Management"
        sub="Transactional email delivery and lifecycle templates — SMTP relay, DKIM alignment and per-event branding."
        actions={<button className="btn btn-pri" onClick={() => toast('ok', 'New template', 'Localized template editor with live preview (demo).')}><Icon name="plus" />New template</button>}
      />
      <div className="kpi-row cols-4">
        <KpiTile label="Delivered (24h)" icon="mail" val="18,204" delta={3} foot="99.7% delivery rate" />
        <KpiTile label="Templates" icon="edit" val="14" foot="4 languages" />
        <KpiTile label="Bounce rate" icon="warnTri" val="0.3" unit="%" delta={-0.1} goodUp={false} foot="suppression list active" />
        <KpiTile label="DKIM / SPF" icon="shieldCheck" val="Aligned" foot="DMARC p=reject" />
      </div>
      <div className="grid-23">
        <div className="card">
          <CardHeader title="Templates" sub="Lifecycle & security emails" />
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Template</th><th>Category</th><th>Locales</th><th>Status</th><th style={{ width: 70 }} /></tr></thead>
              <tbody>
                {TEMPLATES.map((t) => (
                  <tr key={t[0]} onClick={() => toast('ok', t[0], 'Template editor with variables & preview (demo).')}>
                    <td className="td-main">{t[0]}</td>
                    <td><span className="tag">{t[1]}</span></td>
                    <td style={{ color: 'var(--mut)' }}>{t[2]}</td>
                    <td>{t[3] === 'Published' ? <Badge tone="ok" label="Published" /> : <Badge tone="warn" label="Draft" />}</td>
                    <td><div className="row-actions"><button className="mini-btn"><Icon name="edit" size={14} /></button><button className="mini-btn"><Icon name="eye" size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <CardHeader title="SMTP relay" sub="Delivery configuration" />
          <div className="card-pad">
            <div className="dl">
              <div className="dl-k">Host</div><div className="dl-v mono" style={{ fontSize: '11.5px' }}>smtp.meridianbank.com:587</div>
              <div className="dl-k">Encryption</div><div className="dl-v">STARTTLS enforced</div>
              <div className="dl-k">DKIM</div><div className="dl-v">Aligned · selector s1</div>
              <div className="dl-k">Sender</div><div className="dl-v">no-reply@id.meridianbank.com</div>
            </div>
            <div className="divider" />
            <div className="hrow" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Relay health</span>
              <Badge tone="ok" label="Healthy" />
            </div>
            <button className="btn btn-sec" style={{ width: '100%', marginTop: 12 }} onClick={() => toast('ok', 'Test email', 'Test message sent to your inbox (demo).')}><Icon name="mail" />Send test email</button>
          </div>
        </div>
      </div>
    </>
  )
}
