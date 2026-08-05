// Builds the route id for the full-screen Session Console, carrying the
// connection's context (protocol, host, environment) as query params so the
// console can render an authentic header without a shared data store.
export function sessionPath(conn = {}) {
  const q = new URLSearchParams()
  if (conn.proto) q.set('proto', conn.proto)
  if (conn.host) q.set('host', conn.host)
  if (conn.env) q.set('env', conn.env)
  if (conn.user) q.set('user', conn.user)
  const qs = q.toString()
  return `session/${encodeURIComponent(conn.name || 'target')}${qs ? `?${qs}` : ''}`
}
