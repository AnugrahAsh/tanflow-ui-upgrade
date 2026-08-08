// Navigation model + route metadata. Drives the sidebar, breadcrumbs, command
// palette and <Routes>. Mirrors the original NAV structure.

export const NAV = [
  { grp: 'Home', items: [['overview', 'Overview'], ['analytics', 'Access Analytics']] },
  { grp: 'Identity', items: [['users', 'Users'], ['groups', 'Groups'], ['roles', 'Roles'], ['directory', 'Directory'], ['provisioning', 'Provisioning']] },
  { grp: 'Governance', items: [['requests', 'Access Requests', { count: 5 }], ['certs', 'Certifications'], ['policies', 'Policies & SoD'], ['compliance', 'Compliance']] },
  { grp: 'Privileged Access', items: [['vault', 'Credential Vault'], ['sessions', 'Live Sessions', { count: 6 }], ['recordings', 'Recordings'], ['jit', 'Just-in-Time'], ['commands', 'Command Policies']] },
  { grp: 'Authentication', items: [['sso', 'Single Sign-On'], ['mfa', 'Multi-Factor'], ['ldap', 'LDAP Integration'], ['aaa', 'AAA Server'], ['adaptive', 'Adaptive Access']] },
  { grp: 'Monitoring', items: [['audit', 'Audit Log'], ['alerts', 'Alerts', { alert: 3 }], ['reports', 'Reports']] },
  { grp: 'Platform', items: [['integrations', 'Integrations'], ['settings', 'Settings']] },
]

// Flat lookup: id -> { id, label, group, badge }
export const ROUTE_META = {}
NAV.forEach((g) => g.items.forEach(([id, label, opt]) => {
  ROUTE_META[id] = { id, label, group: g.grp, badge: opt || null }
}))

// Extra routes reached only from the redesigned sidebar (not part of the
// original grouped NAV). Registered here so they route and get breadcrumbs +
// titles. They intentionally do not appear in NAV / the command palette.
const EXTRA_ROUTES = [
  ['discovery', 'Discovery', 'Connections'],
  ['connections', 'All Connections', 'Connections'],
  ['connection-groups', 'Connection Groups', 'Connections'],
  ['sharing-profiles', 'Sharing Profiles', 'Connections'],
  ['time-based-access', 'Time-Based Access', 'Access Management'],
  ['secrets', 'Secrets', 'Security'],
  ['monitor', 'Monitor', 'External Access'],
  ['access-report', 'Access Report', 'External Access'],
  ['sso-providers', 'SSO Providers', 'Configuration'],
  ['email-management', 'Email Management', 'Configuration'],
  ['sms-management', 'SMS Management', 'Configuration'],
  ['command-audits', 'Command Audits', 'Configuration'],
  ['license', 'License', 'Configuration'],
  ['my-profile', 'My Profile', 'Configuration'],
  ['sign-in-errors', 'Sign-in & Errors', 'Configuration'],
  ['create-user', 'Create User', 'Users'],
  ['create-user-group', 'Create User Group', 'Users'],
  ['edit-user', 'Edit User', 'Users'],
  ['change-management', 'Change Management', 'Access Management'],
  ['create-role', 'Create role', 'Roles'],
  ['create-time-based-policy', 'Create Policy', 'Time-Based Access'],
  ['create-change-request', 'New Change Request', 'Change Management'],
  ['edit-profile', 'Edit Profile', 'My Profile'],
  ['create-sms-provider', 'Add SMS Provider', 'SMS Management'],
  ['create-sms-template', 'Add SMS Template', 'SMS Management'],
  ['create-connection-group', 'New Connection Group', 'Connections'],
  ['edit-connection-group', 'Edit Connection Group', 'Connections'],
  ['license-v2', 'License Information', 'Configuration'],
  ['role', 'Role', 'Roles'],
  ['select-protocol', 'Select Protocol', 'Connections'],
  ['create-connection', 'Create Connection', 'Connections'],
  ['my-connections', 'My Connections', 'Home'],
  ['recordings', 'Connection History', 'Dashboard'],
  ['report', 'Report', 'Reports'],
  // Security section — grouped under Security to match the console layout.
  ['mfa', 'MFA', 'Security'],
  ['vault', 'Password Vault', 'Security'],
  ['commands', 'Command Restrictions', 'Security'],
]
EXTRA_ROUTES.forEach(([id, label, group]) => { ROUTE_META[id] = { id, label, group, badge: null } })

export const DEFAULT_ROUTE = 'overview'
export const ALL_IDS = Object.keys(ROUTE_META)
