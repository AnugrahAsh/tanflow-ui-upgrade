import Icon from '../components/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import StatusScreen, { DetailRow } from '../components/StatusScreen.jsx'

/* §2 error and status surfaces. One shared screen, four thin views. */

export function NotFound({ embedded }) {
  const { go, openPalette } = useApp()
  return (
    <StatusScreen
      embedded={embedded}
      code="404" icon="search" tone="mut"
      title="We can’t find that page"
      sub="The link may be broken, or the resource was renamed, moved or deleted."
      actions={
        <>
          <button className="btn btn-pri" onClick={() => go('overview')}><Icon name="overview" size={15} />Back to overview</button>
          <button className="btn btn-sec" onClick={openPalette}><Icon name="search" size={15} />Search the console</button>
        </>
      }
      meta={typeof window !== 'undefined' ? window.location.hash || '/' : '/'}
    />
  )
}

export function Unauthorized() {
  const { go } = useApp()
  return (
    <StatusScreen
      code="403" icon="lock" tone="bad"
      title="You don’t have access to this"
      sub="Your roles don’t grant this resource. Access is denied by policy, not by mistake — and the attempt has been logged."
      detail={
        <>
          <DetailRow k="Signed in as" v="tribhuwan.rao@meridianbank.com" />
          <DetailRow k="Roles" v="Global Security Admin" />
          <DetailRow k="Required" v="Super Admin" />
          <DetailRow k="Reference" v="AUTHZ-4471-2026" />
        </>
      }
      actions={
        <>
          <button className="btn btn-pri" onClick={() => go('overview')}><Icon name="arrowLeft" size={15} />Back to overview</button>
          <button className="btn btn-sec" onClick={() => go('create-change-request')}><Icon name="requests" size={15} />Request access</button>
        </>
      }
    />
  )
}

export function ServiceUnavailable() {
  const { go } = useApp()
  return (
    <StatusScreen
      code="503" icon="cloud" tone="warn"
      title="Tanflow is temporarily unreachable"
      sub="We couldn’t reach the control plane. Live sessions already established keep running — this affects the console only."
      detail={
        <>
          <DetailRow k="Region" v="eu-central-1a" />
          <DetailRow k="Component" v="Console API" />
          <DetailRow k="Started" v="2 minutes ago" />
          <DetailRow k="Reference" v="SVC-90218" />
        </>
      }
      actions={
        <>
          <button className="btn btn-pri" onClick={() => window.location.reload()}><Icon name="refresh" size={15} />Try again</button>
          <button className="btn btn-sec" onClick={() => go('overview')}><Icon name="activity" size={15} />View status page</button>
        </>
      }
      meta="Retrying automatically every 30s"
    />
  )
}

export function Maintenance() {
  return (
    <StatusScreen
      icon="settings" tone="accent"
      title="Scheduled maintenance in progress"
      sub="Tanflow is being upgraded. Privileged sessions are unaffected; the console will return automatically when the work completes."
      detail={
        <>
          <DetailRow k="Window" v="02:00 – 04:00 UTC" />
          <DetailRow k="Expected back" v="in about 25 minutes" />
          <DetailRow k="Change" v="CHG-88214 · gateway upgrade" />
        </>
      }
      actions={<button className="btn btn-sec" onClick={() => window.location.reload()}><Icon name="refresh" size={15} />Check again</button>}
      meta="This page refreshes itself"
    />
  )
}
