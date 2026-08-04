// Report catalogue — shared by the Reports library and the report detail page.
export const CAT = {
  'Audit & Compliance': { c: '#7C3AED', bg: '#EDE9FE' },
  Authentication: { c: '#2563EB', bg: '#E2ECFF' },
  Identity: { c: '#0E7C6B', bg: '#D6F0EB' },
  Connections: { c: '#0891B2', bg: '#DDF2F7' },
  Governance: { c: '#9A6700', bg: '#FBF0D3' },
  Sessions: { c: '#C2740B', bg: '#FDF0D5' },
  Credentials: { c: '#0E9F6E', bg: '#DAF2E2' },
  Delivery: { c: '#4F46E5', bg: '#E7E7FE' },
}
export const CATEGORIES = ['All', ...Object.keys(CAT)]

const R = (id, name, cat, icon, pinned, desc, records, retention, gen, dataset) => ({ id, name, cat, icon, pinned, desc, records, retention, gen, dataset })
export const REPORTS = [
  R('failed-login', 'Failed Login Report', 'Authentication', 'ban', true, 'Every rejected sign-in attempt with the reason it failed, the attempt sequence and whether it ended in a lockout.', '12,418', '12 months', '6 min ago', 'auth.login.failed'),
  R('command-audits', 'Command Audits', 'Sessions', 'commands', true, 'Every restricted command executed inside a PAM session — the action taken, the rule that matched and the justification given.', '41,206', '7 years', '12 ago', 'session.command'),
  R('comprehensive-audit', 'Comprehensive Audit Report', 'Audit & Compliance', 'audit', false, 'Every administrative action across the entire application — actor, object, outcome and source, on the immutable hash-chained ledger.', '2,412,048', '7 years', 'live', 'audit.all'),
  R('successful-login', 'Successful Login Report', 'Authentication', 'sso', false, 'Every successful sign-in to the console and the gateway — identity, factor used, origin and the session it opened.', '184,209', '12 months', '2 min ago', 'auth.login.success'),
  R('password-reset', 'Password Reset Report', 'Authentication', 'refresh', false, 'Self-service resets initiated through “Forgot password” — token issue, completion and the address that drove them.', '3,942', '12 months', '41 min ago', 'auth.password.reset'),
  R('user-management', 'User Management Report', 'Identity', 'users', false, 'Create, update, disable and delete actions on user accounts — what changed, who changed it and from where.', '8,116', '7 years', '18 min ago', 'identity.user'),
  R('user-group', 'User Group Report', 'Identity', 'groups', false, 'Group lifecycle and membership changes — including every add and remove on privileged groups.', '4,208', '7 years', '1 hr ago', 'identity.group'),
  R('connection-management', 'Connection Management Report', 'Connections', 'link', false, 'Create, update and delete actions on connections — host, protocol, credential binding and recording policy.', '2,704', '7 years', '3 hrs ago', 'conn.mgmt'),
  R('connection-group', 'Connection Group Report', 'Connections', 'folder', false, 'Connection group lifecycle — creation, membership moves and the access policies bound to each group.', '1,186', '7 years', 'yesterday', 'conn.group'),
  R('access-policy', 'Access Policy Report', 'Governance', 'policies', false, 'Every change to an access policy — who is granted what, under which conditions, and who approved the change.', '1,942', '7 years', '5 hrs ago', 'gov.policy'),
  R('email-delivery', 'Email Delivery Report', 'Delivery', 'mail', false, 'Every message handed to the mail gateway — template, recipient, provider response and delivery latency.', '96,412', '12 months', '4 min ago', 'delivery.email'),
  R('sms-delivery', 'SMS Delivery Report', 'Delivery', 'phone', false, 'Every SMS pushed through the active gateway — message class, segments, carrier result and latency.', '41,880', '12 months', '9 min ago', 'delivery.sms'),
  R('external-access', 'External Access Report', 'Sessions', 'adaptive', false, 'Server logins reported by monitoring agents, matched against PAM session records to expose access that bypassed the gateway.', '27,304', '12 months', '38 sec ago', 'session.external'),
  R('vault-activity', 'Password Vault Activity', 'Credentials', 'vault', false, 'Every operation on a vaulted credential — enrol, edit, delete, rotate, check-out and injection at session start.', '58,940', '7 years', '7 min ago', 'cred.vault'),
  R('credential-rotation', 'Credential Rotation Report', 'Credentials', 'refresh', false, 'Every scheduled and manual rotation attempt with its outcome — filter by status to isolate failures needing attention.', '19,644', '7 years', '05:30 today', 'cred.rotation'),
  R('credential-usage', 'Credential Usage Report', 'Credentials', 'user', false, 'Every time a vaulted credential was injected at session start — who used which credential, when, and from where.', '33,712', '7 years', '21 min ago', 'cred.usage'),
]
export const reportById = (id) => REPORTS.find((r) => r.id === id)
