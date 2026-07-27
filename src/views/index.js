import Overview from './Overview.jsx'
import Analytics from './Analytics.jsx'
import Users from './Users.jsx'
import Groups from './Groups.jsx'
import Roles from './Roles.jsx'
import Directory from './Directory.jsx'
import Provisioning from './Provisioning.jsx'
import Requests from './Requests.jsx'
import Certs from './Certs.jsx'
import Policies from './Policies.jsx'
import Compliance from './Compliance.jsx'
import Vault from './Vault.jsx'
import Sessions from './Sessions.jsx'
import Recordings from './Recordings.jsx'
import Jit from './Jit.jsx'
import Commands from './Commands.jsx'
import Sso from './Sso.jsx'
import Mfa from './Mfa.jsx'
import Aaa from './Aaa.jsx'
import Adaptive from './Adaptive.jsx'
import Audit from './Audit.jsx'
import Alerts from './Alerts.jsx'
import Reports from './Reports.jsx'
import Integrations from './Integrations.jsx'
import Settings from './Settings.jsx'
// Additional views reachable from the redesigned sidebar.
import Discovery from './Discovery.jsx'
import Connections from './Connections.jsx'
import ConnectionGroups from './ConnectionGroups.jsx'
import SharingProfiles from './SharingProfiles.jsx'
import TimeBasedAccess from './TimeBasedAccess.jsx'
import Secrets from './Secrets.jsx'
import Monitor from './Monitor.jsx'
import AccessReport from './AccessReport.jsx'
import SsoProviders from './SsoProviders.jsx'
import EmailManagement from './EmailManagement.jsx'
import SmsManagement from './SmsManagement.jsx'
import CommandAudits from './CommandAudits.jsx'
import License from './License.jsx'
import MyProfile from './MyProfile.jsx'
import SignInErrors from './SignInErrors.jsx'

// Route id -> view component. Every id in the nav model is now implemented.
export const VIEWS = {
  overview: Overview,
  analytics: Analytics,
  users: Users,
  groups: Groups,
  roles: Roles,
  directory: Directory,
  provisioning: Provisioning,
  requests: Requests,
  certs: Certs,
  policies: Policies,
  compliance: Compliance,
  vault: Vault,
  sessions: Sessions,
  recordings: Recordings,
  jit: Jit,
  commands: Commands,
  sso: Sso,
  mfa: Mfa,
  aaa: Aaa,
  adaptive: Adaptive,
  audit: Audit,
  alerts: Alerts,
  reports: Reports,
  integrations: Integrations,
  settings: Settings,
  discovery: Discovery,
  connections: Connections,
  'connection-groups': ConnectionGroups,
  'sharing-profiles': SharingProfiles,
  'time-based-access': TimeBasedAccess,
  secrets: Secrets,
  monitor: Monitor,
  'access-report': AccessReport,
  'sso-providers': SsoProviders,
  'email-management': EmailManagement,
  'sms-management': SmsManagement,
  'command-audits': CommandAudits,
  license: License,
  'my-profile': MyProfile,
  'sign-in-errors': SignInErrors,
}
