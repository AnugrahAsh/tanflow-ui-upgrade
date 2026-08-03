// Roles — rich model shared by the Roles list and the per-id role detail page.
const M = (module, allows) => ({ module, allows })
const mk = (names) => names.map((n) => {
  const u = n.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')
  return { name: n, username: u, email: `${u}@meridianbank.com` }
})

export const ROLES = [
  {
    id: 'admin', name: 'Admin', type: 'Administrative tier', icon: 'shieldCheck', all: true, fullAdmin: true,
    desc: 'Full system administration. Grants access to the Password Vault (list and manage entries) but cannot reveal stored credentials — vault reveal is restricted to Super Admin.',
    members: mk(['Aarav Rossi', 'Alexi Novak', 'Amir Haddad', 'Chen Wei', 'Dana Cruz', 'Diego Marín', 'Elena Popov', 'Farah Khan', 'Gita Rao', 'Hugo Berg']),
    modules: [
      M('Connections', ['Assign to users / groups', 'Create', 'Delete', 'Read / List', 'Update settings & credentials']),
      M('Connection Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Sharing Profiles', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Users', ['Create', 'Delete', 'Read / List', 'Update']),
      M('User Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Time-Based Policies', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Password Vault', ['Create / update vault entries', 'Read vault entries']),
      M('Sessions', ['Join / observe live sessions', 'Terminate sessions', 'View active / past sessions']),
      M('Audit', ['Read history & audit logs']),
    ],
  },
  {
    id: 'connection-manager', name: 'Connection Manager', type: 'Administrative tier', icon: 'link',
    desc: 'Owns the connection inventory: connections, connection groups and sharing profiles.',
    members: [],
    modules: [
      M('Connections', ['Assign to users / groups', 'Create', 'Delete', 'Read / List', 'Update settings & credentials']),
      M('Connection Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Sharing Profiles', ['Create', 'Delete', 'Read / List', 'Update']),
    ],
  },
  {
    id: 'identity-manager', name: 'Identity Manager', type: 'Administrative tier', icon: 'users',
    desc: 'Delegated user and user-group administration without full admin rights.',
    members: mk(['Dev Aabhroy']),
    modules: [
      M('Users', ['Create', 'Delete', 'Read / List', 'Update']),
      M('User Groups', ['Create', 'Delete', 'Read / List', 'Update']),
    ],
  },
  {
    id: 'manager', name: 'Manager', type: 'Administrative tier', icon: 'roles',
    desc: 'Manages connections, identity, access policies and audit — everything except super-admin and change approval.',
    members: mk(['Ravi Oommen', 'Rosa Méndez']),
    modules: [
      M('Connections', ['Assign to users / groups', 'Create', 'Delete', 'Read / List', 'Update settings & credentials']),
      M('Connection Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Sharing Profiles', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Users', ['Create', 'Delete', 'Read / List', 'Update']),
      M('User Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Time-Based Policies', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Change Requests', ['Create / manage own requests']),
      M('Audit', ['Read history & audit logs']),
    ],
  },
  {
    id: 'policy-manager', name: 'Policy Manager', type: 'Administrative tier', icon: 'clock',
    desc: 'Manages time-based access policies.',
    members: mk(['Dylan Chase', 'Tara Ellis']),
    modules: [
      M('Time-Based Policies', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Change Requests', ['Approve / reject requests', 'Create / manage own requests']),
      M('Audit', ['Read history & audit logs']),
    ],
  },
  {
    id: 'super-admin', name: 'Super Admin', type: 'Administrative tier', icon: 'shieldCheck', all: true, fullAdmin: true,
    desc: 'Highest-privilege role. Includes all Admin permissions plus the exclusive authority to reveal stored vault credentials after MFA step-up verification. All reveal actions are audited and logged.',
    members: mk(['Sam Okafor']),
    modules: [
      M('Connections', ['Assign to users / groups', 'Create', 'Delete', 'Read / List', 'Update settings & credentials']),
      M('Connection Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Sharing Profiles', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Users', ['Create', 'Delete', 'Read / List', 'Update']),
      M('User Groups', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Time-Based Policies', ['Create', 'Delete', 'Read / List', 'Update']),
      M('Password Vault', ['Create / update vault entries', 'Read vault entries', 'Reveal secrets (MFA step-up)']),
      M('Sessions', ['Join / observe live sessions', 'Terminate sessions', 'View active / past sessions']),
      M('Audit', ['Read history & audit logs']),
      M('System', ['Full administration bypass']),
    ],
  },
  {
    id: 'user', name: 'User', type: 'Administrative tier', icon: 'user', baseline: true,
    desc: 'Baseline role for accounts with no role assignment. Assigned automatically to every user who holds no other role.',
    members: mk(['Dev Kapoor', 'Dana Cruz', 'Diego Marín', 'Tess Byrne', 'Uma Shah', 'Victor Hale', 'Wendy Lim']),
    modules: [
      M('Connections', ['Read / List']),
      M('Sessions', ['View active / past sessions']),
    ],
  },
  {
    id: 'approver', name: 'Approver', type: 'Functional', icon: 'check',
    desc: 'Can approve or reject change requests and extensions, approve releases, and force-close a change.',
    members: [],
    modules: [M('Change Requests', ['Approve / reject requests', 'Create / manage own requests'])],
  },
  {
    id: 'auditor', name: 'Auditor', type: 'Functional', icon: 'eye',
    desc: 'Read-only access to connection history. Does not include session recordings (admin only).',
    members: mk(['Dev Aabhroy', 'Tara Ellis']),
    modules: [M('Audit', ['Read history & audit logs']), M('Connections', ['Read / List'])],
  },
  {
    id: 'connection-group-admin', name: 'Connection Group Admin', type: 'Functional', icon: 'folder',
    desc: 'Manages connections within assigned groups. Can update connection credentials and assign connections to users or groups. Cannot create or clone connections.',
    members: [],
    modules: [
      M('Connections', ['Assign to users / groups', 'Read / List', 'Update settings & credentials']),
      M('Connection Groups', ['Read / List', 'Update']),
      M('Sharing Profiles', ['Read / List', 'Update']),
    ],
  },
  {
    id: 'requester', name: 'Requester', type: 'Functional', icon: 'edit',
    desc: 'Can raise change-management requests to access connections for a time period, and ask for extensions or release.',
    members: [],
    modules: [M('Change Requests', ['Create / manage own requests']), M('Connections', ['Read / List'])],
  },
]

// Roles are addressed by position (1-based) so URLs are /role/1, /role/2, …
export const roleById = (id) => ROLES[Number(id) - 1] || null
export const roleNum = (r) => ROLES.indexOf(r) + 1
export const permCount = (r) => r.modules.reduce((n, m) => n + m.allows.length, 0)
