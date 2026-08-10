import Icon from '../components/Icon.jsx'
import { PageHead, KpiTile } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import RotationPanel from '../components/RotationPanel.jsx'

/* §6 — hosts the rotation panel. Vault.jsx keeps storage and reveal; this is
   the lifecycle half the drop never designed. */

export default function VaultRotation() {
  const { go, toast } = useApp()
  return (
    <>
      <PageHead
        title="Credential Rotation"
        sub="Every vaulted secret on a schedule — changed at the target, verified, and recorded. A credential nobody can name is a credential nobody can steal."
        actions={
          <>
            <button className="btn btn-sec" onClick={() => go('vault')}><Icon name="vault" />Password Vault</button>
            <button className="btn btn-pri" onClick={() => toast('ok', 'Rotation policy', 'Define cadence, verification and failure handling (demo).')}><Icon name="plus" />New policy</button>
          </>
        }
      />

      <div className="kpi-row cols-4">
        <KpiTile label="Rotation success (30d)" icon="refresh" val="99.2" unit="%" foot="3 retries, 1 open failure" />
        <KpiTile label="On a schedule" icon="clock" val="3" foot="of 4 credentials" />
        <KpiTile label="Due in 24h" icon="calendar" val="2" foot="handled automatically" />
        <KpiTile label="Needs attention" icon="warnTri" val="2" foot="1 failing · 1 stale" />
      </div>

      <RotationPanel />
    </>
  )
}
