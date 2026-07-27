import Icon from '../components/Icon.jsx'
import { PageHead } from '../components/ui.jsx'
import { ROUTE_META } from '../router/nav.js'

// Placeholder for routes not yet ported to React. The shell, routing, charts
// and the Overview + Users views are the reference implementations; the
// remaining views follow the same component patterns.
export default function StubView({ id }) {
  const meta = ROUTE_META[id] || { label: id, group: '' }
  return (
    <>
      <PageHead
        title={meta.label}
        sub={`${meta.group} · this view is queued for the React migration.`}
      />
      <div className="card">
        <div className="empty" style={{ padding: '56px 32px' }}>
          <div className="e-ic"><Icon name={id} size={22} /></div>
          <div className="e-t">{meta.label} — coming soon</div>
          <div className="e-s" style={{ maxWidth: 420 }}>
            The shell, routing, design system, chart engine and the{' '}
            <b>Overview</b> and <b>Users</b> views are fully migrated. This view
            reuses the same patterns and is next in the backlog.
          </div>
        </div>
      </div>
    </>
  )
}
