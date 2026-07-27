// Mock datasets for the Tanflow Identity Security Cloud prototype.
// Ported verbatim from the original single-file build. Deterministic:
// generation uses seededRand so results are identical on every load.
import { seededRand, pick } from '../lib/series.js'

const FIRST = ['Aarav', 'Beatriz', 'Chen', 'Daniela', 'Elias', 'Fatima', 'Gabriel', 'Hana', 'Ivan', 'Julia', 'Kwame', 'Leila', 'Marcus', 'Nadia', 'Omar', 'Priya', 'Quinn', 'Rafael', 'Sofia', 'Tomás', 'Uma', 'Viktor', 'Wren', 'Ximena', 'Yusuf', 'Zara', 'Anders', 'Bina', 'Carlos', 'Divya', 'Erik', 'Freya', 'Georg', 'Ines', 'Jonas', 'Keiko', 'Lars', 'Mei', 'Noor', 'Oskar']
const LAST = ['Mehta', 'Silva', 'Wei', 'Rossi', 'Andersen', 'Al-Farsi', 'Costa', 'Kobayashi', 'Petrov', 'Novak', 'Mensah', 'Haddad', 'Bennett', 'Rahman', 'Aziz', 'Sharma', 'Doyle', 'Moreno', 'Lindqvist', 'Costa', 'Iyer', 'Sokolov', 'Callahan', 'Vargas', 'Demir', 'Khalid', 'Berg', 'Patel', 'Ruiz', 'Nair', 'Larsen', 'Dahl', 'Weber', 'Ferreira', 'Bakker', 'Tanaka', 'Nilsen', 'Zhang', 'Hassan', 'Voss']
const DEPTS = ['Finance', 'Treasury', 'IT Operations', 'Security Engineering', 'Retail Banking', 'Risk & Audit', 'HR', 'Trading Systems', 'Payments', 'Data Platform', 'Customer Ops', 'Core Banking']
const TITLES = ['Analyst', 'Senior Engineer', 'Team Lead', 'Director', 'VP', 'Administrator', 'Consultant', 'Architect', 'Manager', 'Specialist']
const RISKS = ['Low', 'Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High', 'Critical']

const rnd = seededRand(42)

export const USERS = []
for (let i = 0; i < 48; i++) {
  const fn = FIRST[i % FIRST.length], ln = LAST[(i * 7 + 3) % LAST.length], name = `${fn} ${ln}`
  const dept = pick(DEPTS, rnd), title = pick(TITLES, rnd)
  const risk = RISKS[Math.floor(rnd() * RISKS.length)]
  const status = rnd() > 0.92 ? 'Suspended' : (rnd() > 0.9 ? 'Dormant' : 'Active')
  USERS.push({
    id: 'U' + String(10240 + i), name, email: (fn + '.' + ln).toLowerCase() + '@meridianbank.com', dept, title: title + ', ' + dept,
    risk, status, mfa: rnd() > 0.08, priv: rnd() > 0.78, src: rnd() > 0.3 ? 'Active Directory' : (rnd() > 0.5 ? 'Workday HR' : 'Local'),
    ents: Math.floor(rnd() * 40) + 4, groups: Math.floor(rnd() * 9) + 1, last: ['2 min ago', '18 min ago', '1 hr ago', '3 hrs ago', 'Yesterday', '2 days ago', '5 days ago', '12 days ago', '34 days ago'][Math.floor(rnd() * 9)]
  })
}

export const GROUPS = [
  { n: 'Domain Admins', type: 'Security', src: 'Active Directory', m: 14, priv: true, risk: 'Critical', sync: '2 min ago' },
  { n: 'SAP_FI_Payments_Approvers', type: 'Application', src: 'SAP ECC', m: 38, priv: true, risk: 'High', sync: '11 min ago' },
  { n: 'Oracle DBA — Production', type: 'Security', src: 'OpenLDAP', m: 9, priv: true, risk: 'Critical', sync: '2 min ago' },
  { n: 'Treasury Front Office', type: 'Business', src: 'Active Directory', m: 126, priv: false, risk: 'Medium', sync: '2 min ago' },
  { n: 'VPN — Remote Standard', type: 'Network', src: 'Tanflow AAA', m: 4210, priv: false, risk: 'Low', sync: 'just now' },
  { n: 'SWIFT Operators', type: 'Application', src: 'Local', m: 22, priv: true, risk: 'Critical', sync: '—' },
  { n: 'Salesforce — Sales Cloud', type: 'Application', src: 'Salesforce', m: 1874, priv: false, risk: 'Low', sync: '6 min ago' },
  { n: 'Core Banking Read-Only', type: 'Application', src: 'Temenos T24', m: 312, priv: false, risk: 'Low', sync: '14 min ago' },
  { n: 'SOC Tier-2 Analysts', type: 'Security', src: 'Active Directory', m: 18, priv: true, risk: 'High', sync: '2 min ago' },
  { n: 'HR Data Stewards', type: 'Business', src: 'Workday HR', m: 41, priv: false, risk: 'Medium', sync: '29 min ago' },
]

export const ROLES = [
  { n: 'Global Security Administrator', scope: 'Platform', assign: 6, ents: 184, sod: 0, owner: 'CISO Office', cert: 'Q2 2026' },
  { n: 'Payment Release Officer', scope: 'SAP ECC · Payments', assign: 38, ents: 12, sod: 2, owner: 'Finance Controls', cert: 'Q3 2026' },
  { n: 'Production DBA', scope: 'Oracle · SQL Server', assign: 17, ents: 46, sod: 0, owner: 'Data Platform', cert: 'Q2 2026' },
  { n: 'Helpdesk Password Reset', scope: 'Directory · Tier 1', assign: 64, ents: 5, sod: 0, owner: 'IT Operations', cert: 'Q4 2026' },
  { n: 'Treasury Dealer', scope: 'Murex · SWIFT', assign: 29, ents: 31, sod: 5, owner: 'Treasury', cert: 'Overdue' },
  { n: 'SOC Incident Responder', scope: 'SIEM · EDR · PAM', assign: 22, ents: 57, sod: 0, owner: 'Security Ops', cert: 'Q2 2026' },
  { n: 'HR Business Partner', scope: 'Workday · Payroll view', assign: 52, ents: 19, sod: 1, owner: 'HR', cert: 'Q3 2026' },
  { n: 'Branch Operations Manager', scope: 'Core Banking', assign: 214, ents: 28, sod: 0, owner: 'Retail Banking', cert: 'Q3 2026' },
]

export const SESSIONS = [
  { id: 'PS-88412', user: 'Marcus Bennett', acct: 'root', target: 'sap-prd-app01.corp', proto: 'SSH', t: '00:42:18', risk: 'High', cmds: 214, rec: true, watch: 2 },
  { id: 'PS-88409', user: 'Priya Sharma', acct: 'SYS', target: 'ora-fin-prd-03', proto: 'SQL*Net', t: '01:12:55', risk: 'Critical', cmds: 892, rec: true, watch: 1 },
  { id: 'PS-88406', user: 'Erik Lindqvist', acct: 'Administrator', target: 'dc02.corp.meridian', proto: 'RDP', t: '00:08:41', risk: 'Medium', cmds: 0, rec: true, watch: 0 },
  { id: 'PS-88401', user: 'Nadia Rahman', acct: 'sa', target: 'sql-risk-prd-07', proto: 'TDS', t: '02:03:12', risk: 'High', cmds: 341, rec: true, watch: 1 },
  { id: 'PS-88398', user: 'Omar Aziz', acct: 'netadmin', target: 'fw-core-01.dmz', proto: 'SSH', t: '00:19:04', risk: 'Medium', cmds: 57, rec: true, watch: 0 },
  { id: 'PS-88395', user: 'Julia Novak', acct: 'svc-deploy', target: 'k8s-prod-cluster', proto: 'kubectl', t: '00:03:26', risk: 'Low', cmds: 12, rec: true, watch: 0 },
]

export const RECORDINGS = [
  { id: 'RC-77231', user: 'Priya Sharma', acct: 'SYS', target: 'ora-fin-prd-03', dur: '1:58:22', date: 'Jul 8, 14:02', events: 14, flag: 'DROP TABLE detected', risk: 'Critical', size: '184 MB' },
  { id: 'RC-77218', user: 'Marcus Bennett', acct: 'root', target: 'sap-prd-app01', dur: '0:44:10', date: 'Jul 8, 11:37', events: 3, flag: null, risk: 'Medium', size: '96 MB' },
  { id: 'RC-77202', user: 'Viktor Sokolov', acct: 'Administrator', target: 'dc01.corp.meridian', dur: '0:22:51', date: 'Jul 8, 09:15', events: 7, flag: 'Group policy modified', risk: 'High', size: '74 MB' },
  { id: 'RC-77188', user: 'Hana Kobayashi', acct: 'sa', target: 'sql-hr-prd-02', dur: '0:12:03', date: 'Jul 7, 22:48', events: 0, flag: null, risk: 'Low', size: '31 MB' },
  { id: 'RC-77164', user: 'Omar Aziz', acct: 'netadmin', target: 'core-sw-04', dur: '1:04:33', date: 'Jul 7, 18:20', events: 5, flag: 'Config overwrite', risk: 'High', size: '112 MB' },
  { id: 'RC-77149', user: 'Erik Lindqvist', acct: 'ec2-admin', target: 'aws-prod-bastion', dur: '0:36:44', date: 'Jul 7, 15:02', events: 1, flag: null, risk: 'Low', size: '58 MB' },
]

export const SAFES = [
  { n: 'Core Banking — Production', accts: 84, pf: 'Temenos T24', rot: 'Every 24h', health: 98, checkout: 6, owner: 'Platform Ops' },
  { n: 'SAP Landscape PRD', accts: 52, pf: 'SAP ECC / S4', rot: 'Every 12h', health: 100, checkout: 3, owner: 'SAP Basis' },
  { n: 'Oracle & SQL Estates', accts: 118, pf: 'Oracle 19c · MSSQL', rot: 'Every 24h', health: 94, checkout: 9, owner: 'Data Platform' },
  { n: 'Network Infrastructure', accts: 203, pf: 'Cisco · F5 · Palo Alto', rot: 'Every 7d', health: 91, checkout: 4, owner: 'NetOps' },
  { n: 'Cloud — AWS / Azure Root', accts: 37, pf: 'IAM Users · Service Principals', rot: 'Every 6h', health: 100, checkout: 2, owner: 'Cloud CoE' },
  { n: 'Windows Server Estate', accts: 641, pf: 'Local Administrators', rot: 'Every 24h', health: 88, checkout: 12, owner: 'Wintel' },
]

export const CAMPAIGNS = [
  { n: 'Q3 SOX — Privileged Access', scope: 'All privileged roles · SAP, Oracle, SWIFT', prog: 72, items: 1240, done: 893, rev: 14, due: 'Jul 21, 2026', status: 'In Progress', owner: 'Finance Controls' },
  { n: 'Quarterly — Domain Admins', scope: 'AD privileged groups', prog: 94, items: 64, done: 60, rev: 3, due: 'Jul 12, 2026', status: 'In Progress', owner: 'CISO Office' },
  { n: 'Annual — All Application Access', scope: 'All apps · 12,400 identities', prog: 31, items: 48210, done: 14945, rev: 86, due: 'Aug 30, 2026', status: 'In Progress', owner: 'IGA Team' },
  { n: 'Leavers — 30-day lookback', scope: 'Terminated identities w/ residual access', prog: 100, items: 212, done: 212, rev: 0, due: 'Completed Jun 28', status: 'Completed', owner: 'IGA Team' },
  { n: 'PCI DSS — Cardholder Env', scope: 'CDE systems & DB accounts', prog: 12, items: 684, done: 82, rev: 9, due: 'Sep 15, 2026', status: 'In Progress', owner: 'Compliance' },
]

export const REQUESTS = [
  { id: 'AR-20441', user: 'Divya Patel', item: 'SAP_FI_Payments_Approvers', type: 'Group membership', just: 'Covering month-end close for R. Moreno (PTO)', risk: 'High', sod: 'Conflicts with: Payment Creator', age: '2h', appr: 'L. Dahl → Finance Controls' },
  { id: 'AR-20438', user: 'Jonas Weber', item: 'Production DBA — Oracle', type: 'Role', just: 'P1 incident INC-59912 — replication lag', risk: 'Critical', sod: null, age: '4h', appr: 'Emergency · auto-expires 8h' },
  { id: 'AR-20431', user: 'Keiko Tanaka', item: 'Salesforce — Marketing Cloud', type: 'Application', just: 'New campaign analytics responsibilities', risk: 'Low', sod: null, age: '1d', appr: 'Manager → App Owner' },
  { id: 'AR-20427', user: 'Carlos Ruiz', item: 'VPN — Contractor Profile', type: 'Network access', just: 'Vendor engagement ends Sep 30', risk: 'Medium', sod: null, age: '1d', appr: 'Sponsor → Security' },
  { id: 'AR-20419', user: 'Freya Berg', item: 'SWIFT Operators', type: 'Group membership', just: 'Backfill for departing operator', risk: 'Critical', sod: 'Requires 4-eyes + CISO sign-off', age: '2d', appr: 'Dual approval pending' },
]

export const SOD_RULES = [
  { n: 'Create vendor ↔ Approve payment', sys: 'SAP ECC', sev: 'Critical', viol: 3, state: 'Active' },
  { n: 'Trade execution ↔ Trade settlement', sys: 'Murex · SWIFT', sev: 'Critical', viol: 1, state: 'Active' },
  { n: 'User admin ↔ Log administration', sys: 'Directory · SIEM', sev: 'High', viol: 0, state: 'Active' },
  { n: 'DBA ↔ Application release', sys: 'Oracle · CI/CD', sev: 'High', viol: 4, state: 'Active' },
  { n: 'HR record edit ↔ Payroll approve', sys: 'Workday', sev: 'High', viol: 0, state: 'Active' },
  { n: 'POS refund ↔ Cash reconciliation', sys: 'Core Banking', sev: 'Medium', viol: 2, state: 'Active' },
]

export const FRAMEWORKS = [
  { n: 'SOX (ICFR)', ctrl: 64, pass: 61, warn: 2, fail: 1, cov: 98, audit: 'Aug 2026' },
  { n: 'ISO 27001:2022', ctrl: 93, pass: 90, warn: 3, fail: 0, cov: 100, audit: 'Nov 2026' },
  { n: 'PCI DSS 4.0', ctrl: 48, pass: 44, warn: 3, fail: 1, cov: 96, audit: 'Sep 2026' },
  { n: 'HIPAA Security Rule', ctrl: 34, pass: 34, warn: 0, fail: 0, cov: 100, audit: '—' },
  { n: 'GDPR / DPDP', ctrl: 41, pass: 39, warn: 2, fail: 0, cov: 100, audit: 'Continuous' },
  { n: 'NIST 800-53 (Zero Trust)', ctrl: 112, pass: 104, warn: 6, fail: 2, cov: 94, audit: 'Continuous' },
]

export const ALERTS = [
  { id: 'AL-9921', t: 'Impossible travel — privileged account', s: 'SYS@ora-fin-prd-03 authenticated from Frankfurt 41 min after São Paulo login', sev: 'Critical', time: '6 min ago', state: 'Open', src: 'Risk Engine' },
  { id: 'AL-9918', t: 'Dormant admin account used', s: 'ACCT “svc-backup-legacy” (dormant 94 days) initiated RDP to dc02', sev: 'Critical', time: '22 min ago', state: 'Investigating', src: 'PAM' },
  { id: 'AL-9914', t: 'SoD violation on request approval', s: 'AR-20441 grants Payment Approver to existing Payment Creator', sev: 'High', time: '1 hr ago', state: 'Open', src: 'Governance' },
  { id: 'AL-9909', t: 'MFA fatigue pattern detected', s: '14 push prompts to j.weber in 6 minutes — auto-blocked, stepped up to FIDO2', sev: 'High', time: '2 hrs ago', state: 'Auto-remediated', src: 'Adaptive MFA' },
  { id: 'AL-9902', t: 'Vault rotation failure', s: '3 local admin credentials on WIN-BR-114 failed scheduled rotation', sev: 'Medium', time: '4 hrs ago', state: 'Open', src: 'Vault' },
  { id: 'AL-9897', t: 'AAA — RADIUS spike from new NAS', s: 'Unregistered NAS 10.14.8.21 sent 2,140 auth requests', sev: 'Medium', time: '6 hrs ago', state: 'Acknowledged', src: 'AAA Server' },
  { id: 'AL-9891', t: 'Recertification overdue', s: 'Treasury Dealer role certification 9 days past due', sev: 'Low', time: 'Yesterday', state: 'Open', src: 'Governance' },
]

export const APPS_SSO = [
  { n: 'SAP S/4HANA', proto: 'SAML 2.0', users: 8420, mfa: 'Required', status: 'Active', logo: 'SAP', c: '#0F62FE', last: '99.99%' },
  { n: 'Salesforce', proto: 'SAML 2.0', users: 6210, mfa: 'Required', status: 'Active', logo: 'SF', c: '#0B65B8', last: '100%' },
  { n: 'Oracle EBS', proto: 'OIDC', users: 3140, mfa: 'Required', status: 'Active', logo: 'OR', c: '#C2255C', last: '99.97%' },
  { n: 'Microsoft 365', proto: 'WS-Fed / SAML', users: 14208, mfa: 'Required', status: 'Active', logo: 'MS', c: '#0E7D74', last: '99.99%' },
  { n: 'Workday', proto: 'SAML 2.0', users: 13890, mfa: 'Required', status: 'Active', logo: 'WD', c: '#B25E09', last: '100%' },
  { n: 'ServiceNow', proto: 'OIDC', users: 4820, mfa: 'Conditional', users2: 0, status: 'Active', logo: 'SN', c: '#1F7A3D', last: '99.98%' },
  { n: 'Tableau', proto: 'OIDC', users: 1930, mfa: 'Conditional', status: 'Active', logo: 'TB', c: '#6941C6', last: '99.94%' },
  { n: 'GitHub Enterprise', proto: 'SAML 2.0', users: 840, mfa: 'Required', status: 'Active', logo: 'GH', c: '#3E4784', last: '100%' },
]

export const INTEGRATIONS = [
  { n: 'SAP ECC / S4HANA', cat: 'ERP', desc: 'User provisioning, role sync, SoD extraction via RFC + BAPI', status: 'Connected', health: 100, objs: '12,480 identities · 2,140 roles', logo: 'SAP', c: '#0F62FE', sync: '2 min ago' },
  { n: 'Active Directory', cat: 'Directory', desc: 'Bidirectional sync — 4 forests, 12 domains, password writeback', status: 'Connected', health: 100, objs: '38,204 objects · 1,842 groups', logo: 'AD', c: '#0B65B8', sync: '42 sec ago' },
  { n: 'Oracle EBS & 19c DB', cat: 'ERP / Database', desc: 'Responsibility mapping, DBA account vaulting, session proxy', status: 'Connected', health: 96, objs: '3,140 identities · 118 privileged accts', logo: 'OR', c: '#C2255C', sync: '6 min ago' },
  { n: 'Salesforce', cat: 'SaaS', desc: 'SCIM provisioning, profile & permission-set governance', status: 'Connected', health: 100, objs: '6,210 identities · 84 perm sets', logo: 'SF', c: '#0E7D74', sync: '4 min ago' },
  { n: 'SQL Server Estate', cat: 'Database', desc: 'sa vaulting, TDS session recording, login analytics — 214 instances', status: 'Degraded', health: 82, objs: '214 instances · 641 logins', logo: 'SQ', c: '#B25E09', sync: '31 min ago' },
  { n: 'OpenLDAP', cat: 'Directory', desc: 'Legacy directory bridge with schema mapping & MFA overlay', status: 'Connected', health: 98, objs: '9,412 entries', logo: 'LD', c: '#6941C6', sync: '2 min ago' },
  { n: 'Workday HCM', cat: 'HR (Authoritative)', desc: 'Joiner-mover-leaver events drive lifecycle state machine', status: 'Connected', health: 100, objs: '13,890 workers · 96 events/day', logo: 'WD', c: '#1F7A3D', sync: '12 min ago' },
  { n: 'Temenos T24', cat: 'Core Banking', desc: 'Teller & branch role governance, 4-eyes enforcement', status: 'Connected', health: 99, objs: '8,204 identities', logo: 'T24', c: '#3E4784', sync: '8 min ago' },
  { n: 'ServiceNow ITSM', cat: 'ITSM', desc: 'Access requests ↔ tickets, CMDB reconciliation', status: 'Connected', health: 100, objs: 'Bi-directional · 240 tickets/wk', logo: 'SN', c: '#0E7D74', sync: '1 min ago' },
  { n: 'Splunk / Sentinel', cat: 'SIEM', desc: 'CEF event streaming — auth, session, governance events', status: 'Connected', health: 100, objs: '2.4M events/day', logo: 'SI', c: '#875BF7', sync: 'streaming' },
  { n: 'AWS / Azure / GCP', cat: 'Cloud IAM', desc: 'CIEM — entitlement graph, key vaulting, JIT federation', status: 'Connected', health: 97, objs: '18,204 entitlements', logo: 'CL', c: '#0B65B8', sync: '9 min ago' },
  { n: 'REST / SCIM API Gateway', cat: 'Custom', desc: '42 downstream custom apps via SCIM 2.0 + webhooks', status: 'Connected', health: 100, objs: '42 apps · 1.1M calls/day', logo: 'API', c: '#A6531C', sync: 'live' },
]

export const AAA_CLIENTS = [
  { n: 'Core Switch Stack — DC1', ip: '10.1.0.0/24', proto: 'TACACS+', reqs: '48,204', fail: '0.2%', status: 'Online' },
  { n: 'Branch VPN Concentrators', ip: '10.8.0.0/16', proto: 'RADIUS', reqs: '241,882', fail: '1.1%', status: 'Online' },
  { n: 'Wi-Fi — Corporate (802.1X)', ip: '10.20.0.0/16', proto: 'RADIUS / EAP-TLS', reqs: '812,440', fail: '0.4%', status: 'Online' },
  { n: 'Firewall Cluster — DMZ', ip: '10.2.4.0/28', proto: 'TACACS+', reqs: '9,614', fail: '0.1%', status: 'Online' },
  { n: 'Legacy NAS — Mainframe FEP', ip: '10.0.99.12', proto: 'RADIUS (PAP)', reqs: '1,204', fail: '4.8%', status: 'Degraded' },
]

export const NOTIFS = [
  { ic: 'alerts', c: 'bad', t: 'Critical: Impossible travel on SYS@ora-fin-prd-03', s: 'Risk engine blocked session and required FIDO2 re-auth.', time: '6 min ago', unread: true },
  { ic: 'certs', c: 'warn', t: 'Q3 SOX campaign — 347 items due in 13 days', s: '72% complete. 14 reviewers have pending queues.', time: '1 hr ago', unread: true },
  { ic: 'vault', c: 'warn', t: '3 credentials failed rotation on WIN-BR-114', s: 'Retry scheduled. Break-glass access remains sealed.', time: '4 hrs ago', unread: true },
  { ic: 'provisioning', c: 'ok', t: 'Workday sync completed', s: '96 lifecycle events processed — 12 joiners, 3 leavers deprovisioned in 38s.', time: '6 hrs ago', unread: false },
  { ic: 'integrations', c: 'ok', t: 'SQL Server connector restored', s: 'Instance sql-risk-prd-07 back to healthy after agent update.', time: 'Yesterday', unread: false },
]

export const AUDIT_ACTIONS = [
  ['auth.login.success', 'j.novak authenticated via FIDO2 — Okta-migrated policy “Corp-Std”', 'Low'],
  ['pam.session.start', 'm.bennett checked out root@sap-prd-app01 (ticket CHG-88214)', 'Medium'],
  ['iga.cert.decision', 'l.dahl revoked “Payment Approver” for d.patel in Q3 SOX campaign', 'Medium'],
  ['vault.rotate.success', '118 credentials rotated in safe “Oracle & SQL Estates”', 'Low'],
  ['dir.group.modify', 'svc-idm added 2 members to SAP_FI_Payments_Approvers', 'High'],
  ['auth.mfa.denied', 'Push denied by u.iyer — device mismatch (new iPhone enrollment pending)', 'Medium'],
  ['policy.sod.violation', 'Rule “Create vendor ↔ Approve payment” triggered by AR-20441', 'Critical'],
  ['aaa.radius.reject', 'EAP-TLS handshake failed — expired client cert (branch-114-ap07)', 'Low'],
  ['pam.cmd.blocked', 'DROP TABLE blocked in session PS-88409 by policy “Prod-DB-Deny”', 'Critical'],
  ['prov.deprovision', 'Leaver t.costa — 14 entitlements revoked across 6 systems in 41s', 'Low'],
  ['sso.app.assign', '840 users assigned to “GitHub Enterprise” via group rule', 'Low'],
  ['vault.checkout', 'p.sharma checked out SYS@ora-fin-prd-03 — reason: INC-59912', 'Medium'],
]

// ── Access Analytics datasets ──────────────────────────────────────────────
const HEAT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const HEAT_ROWS = HEAT_DAYS
export const HEAT = HEAT_DAYS.map((d, r) => Array.from({ length: 24 }, (_, c) => {
  const business = (c >= 7 && c <= 19 && r < 5) ? 1 : 0
  const base = business ? (4000 + Math.sin((c - 7) / 12 * Math.PI) * 5200) : (r >= 5 ? 300 : 600)
  const rr = seededRand(r * 31 + c + 7)()
  return Math.round(Math.max(40, base * (0.75 + rr * 0.5)))
}))
export const TOP_APPS = [['Microsoft 365', 842100], ['SAP S/4HANA', 412800], ['Core Banking (T24)', 298400], ['Salesforce', 214900], ['Workday', 186200], ['ServiceNow', 122400], ['Oracle EBS', 98120], ['Tableau', 44280]]
export const GEO = [['🇬🇧', 'United Kingdom', 428412], ['🇮🇳', 'India', 311204], ['🇺🇸', 'United States', 288941], ['🇩🇪', 'Germany', 122480], ['🇸🇬', 'Singapore', 98214], ['🇧🇷', 'Brazil', 41208], ['🇦🇪', 'UAE', 22894]]
export const FAIL_REASONS = [['Wrong password', 48.2], ['Expired credentials', 18.4], ['MFA timeout / denied', 12.9], ['Out-of-policy location', 9.1], ['Account locked', 6.3], ['Token replay blocked', 5.1]]
export const ANOMALIES = [
  { t: 'Impossible travel', u: 'SYS (service) — ora-fin-prd-03', d: 'São Paulo → Frankfurt in 41 min', sev: 'Critical', n: 1 },
  { t: 'Credential stuffing pattern', u: '14 external identities', d: '2,140 failures from 3 ASNs in 11 min — IPs quarantined', sev: 'High', n: 14 },
  { t: 'MFA fatigue', u: 'j.weber@meridianbank.com', d: '14 push prompts in 6 min — stepped up to FIDO2', sev: 'High', n: 1 },
  { t: 'First-time nation login', u: '4 identities', d: 'Successful logins from 🇻🇳 🇳🇬 — step-up passed', sev: 'Medium', n: 4 },
  { t: 'Off-hours privileged spike', u: 'Oracle DBA — Production', d: '3.2× baseline session volume 02:00–04:00 UTC', sev: 'Medium', n: 9 },
]

// ── Audit log rows (seeded, deterministic) ─────────────────────────────────
export const AUDIT_ROWS = (() => {
  const rows = []
  const r = seededRand(77)
  let mins = 2
  for (let i = 0; i < 26; i++) {
    const a = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length]
    rows.push({
      time: mins < 60 ? `${Math.round(mins)} min ago` : `${(mins / 60).toFixed(1)} hrs ago`,
      ev: a[0], detail: a[1], sev: a[2],
      actor: ['system', 'anika.rao', 'svc-idm', 'policy-engine', 'j.novak', 'l.dahl'][Math.floor(r() * 6)],
      ip: `10.${Math.floor(r() * 20)}.${Math.floor(r() * 250)}.${Math.floor(r() * 250)}`,
    })
    mins += 4 + r() * 40
  }
  return rows
})()
