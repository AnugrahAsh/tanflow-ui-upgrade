// Small formatting / mapping helpers ported from the original utilities block.

export const fmt = (n) => n.toLocaleString('en-US')

const AV_COLORS = ['#0F62FE', '#6941C6', '#0E7D74', '#B25E09', '#C2255C', '#1F7A3D', '#875BF7', '#0B65B8', '#A6531C', '#3E4784']
export const avColor = (n) => AV_COLORS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AV_COLORS.length]
export const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

// Status string -> [badge tone, label]
export const STATUS_BDG = {
  Active: ['ok', 'Active'], Enabled: ['ok', 'Enabled'], Connected: ['ok', 'Connected'], Healthy: ['ok', 'Healthy'], Online: ['ok', 'Online'], Compliant: ['ok', 'Compliant'], Completed: ['ok', 'Completed'], Approved: ['ok', 'Approved'], Rotated: ['ok', 'Rotated'],
  Disabled: ['mut', 'Disabled'], Inactive: ['mut', 'Inactive'], Archived: ['mut', 'Archived'],
  Pending: ['warn', 'Pending'], Degraded: ['warn', 'Degraded'], 'In Progress': ['info', 'In Progress'], Syncing: ['info', 'Syncing'], Review: ['warn', 'In Review'],
  Locked: ['bad', 'Locked'], Failed: ['bad', 'Failed'], Revoked: ['bad', 'Revoked'], Expired: ['bad', 'Expired'], Violation: ['bad', 'Violation'], Overdue: ['bad', 'Overdue'], Denied: ['bad', 'Denied'],
  Suspended: ['warn', 'Suspended'], Dormant: ['viol', 'Dormant'], Escalated: ['viol', 'Escalated'],
}

// Logo-tile -> local SVG filename (assets/logos/*.svg); falls back to a lettered tile.
export const LOGO_IMG = { SAP: 'sap', SF: 'salesforce', OR: 'oracle', MS: 'microsoft', WD: 'workday', SN: 'servicenow', TB: 'tableau', GH: 'github', AD: 'azure', SQ: 'mssql', SI: 'splunk', CL: 'aws' }
