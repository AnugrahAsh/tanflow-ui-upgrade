// Full Create-Connection schema (all protocols) — drives SelectProtocol + CreateConnection.

// ── field helpers ────────────────────────────────────────────────────────────
const T = (id, label, o = {}) => ({ id, label, type: 'TEXT', ...o })
const N = (id, label, o = {}) => ({ id, label, type: 'NUMERIC', ...o })
const U = (id, label, o = {}) => ({ id, label, type: 'USERNAME', ...o })
const P = (id, label, o = {}) => ({ id, label, type: 'PASSWORD', ...o })
const ML = (id, label, o = {}) => ({ id, label, type: 'MULTILINE', ...o })
const B = (id, label, o = {}) => ({ id, label, type: 'BOOLEAN', ...o })
const E = (id, label, options, o = {}) => ({ id, label, type: 'ENUM', options, ...o })
const TZ = (id, label, o = {}) => ({ id, label, type: 'TIMEZONE', ...o })

// ── shared enum option sets ──────────────────────────────────────────────────
export const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '18', '24', '30', '36', '48', '60', '72', '96']
const COLOR_SCHEMES = [['gray-black', 'Gray on black'], ['black-white', 'Black on white'], ['green-black', 'Green on black'], ['white-black', 'White on black']]
const BACKSPACE = [['127', 'Delete (Ctrl-?)'], ['8', 'Backspace (Ctrl-H)']]
const TERM_TYPES = ['xterm', 'xterm-256color', 'vt220', 'vt100', 'ansi', 'linux']
const COLOR_DEPTH = ['8', '16', '24', '32']
const SERVER_LAYOUT = ['de-ch-qwertz', 'de-de-qwertz', 'en-gb-qwerty', 'en-us-qwerty', 'es-es-qwerty', 'es-latam-qwerty', 'failsafe', 'fr-be-azerty', 'fr-fr-azerty', 'fr-ch-qwertz', 'hu-hu-qwertz', 'it-it-qwerty', 'ja-jp-qwerty', 'no-no-qwerty', 'pl-pl-qwerty', 'pt-br-qwerty', 'sv-se-qwerty', 'da-dk-qwerty', 'tr-tr-qwerty']
export const TIMEZONES = ['Etc/UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney']
const colorScheme = { id: 'color-scheme', label: 'Color Scheme', type: 'TERMINAL_COLOR_SCHEME', options: COLOR_SCHEMES }

// ── shared section builders ──────────────────────────────────────────────────
const DISPLAY_TERM = () => ({ key: 'display', fields: [colorScheme, T('font-name', 'Font Name'), E('font-size', 'Font Size', FONT_SIZES), N('scrollback', 'Scrollback'), B('read-only', 'Read Only')] })
const CLIPBOARD = () => ({ key: 'clipboard', fields: [B('disable-copy', 'Disable Copy'), B('disable-paste', 'Disable Paste')] })
const BEHAVIOR = (withTerm = true) => ({ key: 'behavior', fields: [E('backspace', 'Backspace', BACKSPACE), ...(withTerm ? [E('terminal-type', 'Terminal Type', TERM_TYPES)] : [])] })
const TYPESCRIPT = () => ({ key: 'typescript', custom: 'typescript' })
const RECORDING = (touch = false) => ({ key: 'recording', custom: 'recording', subs: [
  { id: 'recording-exclude-output', label: 'Exclude Graphics', help: 'Skip visual stream. Useful for keystroke-only audits.' },
  { id: 'recording-exclude-mouse', label: 'Exclude Mouse', help: 'Skip mouse cursor movement events.' },
  ...(touch ? [{ id: 'recording-exclude-touch', label: 'Exclude Touch', help: 'Skip touchscreen input events.' }] : []),
] })
const WOL = () => ({ key: 'wol', fields: [B('wol-send-packet', 'Send WOL Packet'), T('wol-mac-addr', 'MAC Address Of Remote Host'), T('wol-broadcast-addr', 'Broadcast Address For WoL Packet'), N('wol-udp-port', 'UDP Port For WoL Packet'), N('wol-wait-time', 'Host Wait Boot Time')] })
const SFTP_FULL = () => ({ key: 'sftp', fields: [B('enable-sftp', 'Enable Sftp'), T('sftp-hostname', 'Sftp Hostname'), N('sftp-port', 'Sftp Port'), T('sftp-host-key', 'Sftp Host Key'), U('sftp-username', 'Sftp Username'), P('sftp-password', 'Sftp Password'), ML('sftp-private-key', 'Sftp Private Key', { full: true, mono: true }), P('sftp-passphrase', 'Sftp Passphrase'), T('sftp-root-directory', 'File Browser Root Directory'), T('sftp-directory', 'Sftp Directory'), N('sftp-server-alive-interval', 'Sftp Server Alive Interval'), B('sftp-disable-download', 'Disable File Download'), B('sftp-disable-upload', 'Disable File Upload')] })
const SFTP_SSH = () => ({ key: 'sftp', fields: [B('enable-sftp', 'Enable Sftp'), T('sftp-root-directory', 'File Browser Root Directory'), B('sftp-disable-download', 'Disable File Download'), B('sftp-disable-upload', 'Disable File Upload')] })

// ── standard protocols (category A) ──────────────────────────────────────────
const SSH = { category: 'A', usernameOptional: true, sections: [
  { key: 'network', fields: [T('hostname', 'Hostname', { req: true }), N('port', 'Port', { req: true }), T('host-key', 'Host Key')] },
  { key: 'authentication', fields: [U('username', 'Username', { req: true }), P('password', 'Password', { sensitive: true }), ML('private-key', 'Private Key', { full: true, mono: true, sensitive: true }), P('passphrase', 'Passphrase', { sensitive: true })] },
  DISPLAY_TERM(), CLIPBOARD(),
  { key: 'session', fields: [T('command', 'Command'), T('locale', 'Locale'), TZ('timezone', 'Timezone'), N('server-alive-interval', 'Server Alive Interval')] },
  BEHAVIOR(true), TYPESCRIPT(), RECORDING(false), SFTP_SSH(), WOL(),
] }

const RDP = { category: 'A', usernameOptional: true, sections: [
  { key: 'network', fields: [T('hostname', 'Hostname', { req: true }), N('port', 'Port', { req: true })] },
  { key: 'authentication', fields: [U('username', 'Username', { req: true, sensitive: true }), P('password', 'Password', { sensitive: true }), T('domain', 'Domain'), E('security', 'Security', ['rdp', 'tls', 'nla', 'vmconnect', 'any']), B('disable-auth', 'Disable Auth'), B('ignore-cert', 'Ignore Cert')] },
  { key: 'gateway', fields: [T('gateway-hostname', 'Gateway Hostname'), N('gateway-port', 'Gateway Port'), U('gateway-username', 'Gateway Username', { sensitive: true }), P('gateway-password', 'Gateway Password', { sensitive: true }), T('gateway-domain', 'Gateway Domain')] },
  { key: 'basic-parameters', fields: [T('initial-program', 'Initial Program'), T('client-name', 'Client Name'), E('server-layout', 'Server Layout', SERVER_LAYOUT), TZ('timezone', 'Timezone'), B('enable-touch', 'Enable Touch'), B('console', 'Console')] },
  { key: 'display', fields: [N('width', 'Width'), N('height', 'Height'), N('dpi', 'Dpi'), E('color-depth', 'Color Depth', COLOR_DEPTH), B('force-lossless', 'Force Lossless'), E('resize-method', 'Resize Method', ['reconnect', 'display-update']), B('read-only', 'Read Only')] },
  { key: 'clipboard', fields: [E('normalize-clipboard', 'Normalize Clipboard', ['preserve', 'unix', 'windows']), B('disable-copy', 'Disable Copy'), B('disable-paste', 'Disable Paste')] },
  { key: 'device-redirection', fields: [B('console-audio', 'Console Audio'), B('disable-audio', 'Disable Audio'), B('enable-audio-input', 'Enable Audio Input'), B('enable-printing', 'Enable Printing'), T('printer-name', 'Printer Name'), B('enable-drive', 'Enable Drive'), B('disable-download', 'Disable Download', { dependsOn: 'enable-drive' }), B('disable-upload', 'Disable Upload', { dependsOn: 'enable-drive' }), T('static-channels', 'Static Channels')] },
  { key: 'performance', fields: ['enable-wallpaper', 'enable-theming', 'enable-font-smoothing', 'enable-full-window-drag', 'enable-desktop-composition', 'enable-menu-animations', 'disable-bitmap-caching', 'disable-offscreen-caching', 'disable-glyph-caching'].map((id) => B(id, id.replace(/-/g, ' '))) },
  { key: 'remoteapp', fields: [T('remote-app', 'Remote App'), T('remote-app-dir', 'Remote App Dir'), T('remote-app-args', 'Remote App Args')] },
  { key: 'preconnection-pdu', fields: [N('preconnection-id', 'Preconnection Id'), T('preconnection-blob', 'Preconnection Blob')] },
  { key: 'load-balancing', fields: [T('load-balance-info', 'Load Balance Info')] },
  RECORDING(true), SFTP_FULL(), WOL(),
] }

const VNC = { category: 'A', sections: [
  { key: 'network', fields: [T('hostname', 'Hostname', { req: true }), N('port', 'Port', { req: true })] },
  { key: 'authentication', fields: [U('username', 'Username', { sensitive: true }), P('password', 'Password', { sensitive: true })] },
  { key: 'display', fields: [B('read-only', 'Read Only'), B('swap-red-blue', 'Swap Red Blue'), E('cursor', 'Cursor', ['local', 'remote']), E('color-depth', 'Color Depth', COLOR_DEPTH), B('force-lossless', 'Force Lossless')] },
  { key: 'clipboard', fields: [E('clipboard-encoding', 'Clipboard Encoding', ['ISO8859-1', 'UTF-8', 'UTF-16', 'CP1252']), B('disable-copy', 'Disable Copy'), B('disable-paste', 'Disable Paste')] },
  { key: 'repeater', fields: [T('dest-host', 'Dest Host'), N('dest-port', 'Dest Port')] },
  RECORDING(false), SFTP_FULL(),
  { key: 'audio', fields: [B('enable-audio', 'Enable Audio'), T('audio-servername', 'Audio Servername')] },
  WOL(),
] }

const TELNET = { category: 'A', sections: [
  { key: 'network', fields: [T('hostname', 'Hostname', { req: true }), N('port', 'Port', { req: true })] },
  { key: 'authentication', fields: [U('username', 'Username', { sensitive: true }), P('password', 'Password', { sensitive: true }), T('username-regex', 'Username Regex'), T('password-regex', 'Password Regex'), T('login-success-regex', 'Login Success Regex'), T('login-failure-regex', 'Login Failure Regex')] },
  DISPLAY_TERM(), CLIPBOARD(), BEHAVIOR(true), TYPESCRIPT(), RECORDING(false), WOL(),
] }

const KUBERNETES = { category: 'A', sections: [
  { key: 'network', fields: [T('hostname', 'Hostname', { req: true }), N('port', 'Port', { req: true }), B('use-ssl', 'Use Ssl'), B('ignore-cert', 'Ignore Cert'), ML('ca-cert', 'Ca Cert', { full: true, mono: true })] },
  { key: 'container', fields: [T('namespace', 'Namespace'), T('pod', 'Pod'), T('container', 'Container'), T('exec-command', 'Exec Command')] },
  { key: 'authentication', fields: [ML('client-cert', 'Client Cert', { full: true, mono: true }), ML('client-key', 'Client Key', { full: true, mono: true, sensitive: true })] },
  DISPLAY_TERM(), BEHAVIOR(false), TYPESCRIPT(), RECORDING(false),
] }

// ── database CLI protocols (category B) ──────────────────────────────────────
const dbSection = (prefix, port, userReq, dbNameField, extra = []) => ({ key: 'database', fields: [
  T('db-hostname', `${prefix} Hostname`, { req: true }), N('db-port', `${prefix} Port`, { ph: port }),
  U('db-username', `${prefix} Username`, { req: userReq }), P('db-password', `${prefix} Password`, { sensitive: true }),
  dbNameField, ...extra,
] })
const dbProto = (prefix, port, userReq, dbNameField, extra) => ({ category: 'B', sections: [dbSection(prefix, port, userReq, dbNameField, extra), DISPLAY_TERM(), CLIPBOARD(), BEHAVIOR(true), RECORDING(false)] })

const DB = {
  pgsql: dbProto('PostgreSQL', '5432', true, T('db-name', 'PostgreSQL Database Name')),
  mysql: dbProto('MySQL', '3306', true, T('db-name', 'MySQL Database Name')),
  mssql: dbProto('MSSQL', '1433', true, T('db-name', 'MSSQL Database Name'), [B('db-trust-server-certificate', 'Trust Server Certificate')]),
  mongodb: dbProto('MongoDB', '27017', false, T('db-name', 'MongoDB Database Name')),
  redis: dbProto('Redis', '6379', false, N('db-name', 'Redis DB Index (0-15)')),
  oracle: dbProto('Oracle', '1521', true, T('db-name', 'Oracle Database Name')),
  mariadb: dbProto('MariaDB', '3306', true, T('db-name', 'MariaDB Database Name')),
}

export const SCHEMAS = { ssh: SSH, rdp: RDP, vnc: VNC, telnet: TELNET, kubernetes: KUBERNETES, ...DB }

// ── attributes tab (categories A + B) ────────────────────────────────────────
export const ATTRIBUTES = [
  { key: 'proxy-settings', fields: [T('proxy_hostname', 'Proxy Hostname'), N('proxy_port', 'Proxy Port'), E('proxy_encryption_method', 'Proxy Encryption Method', ['NONE', 'SSL', 'TLS'])] },
  { key: 'connection-limits', fields: [N('max_connections', 'Max Connections'), N('max_connections_per_user', 'Max Connections Per User'), N('connection_weight', 'Connection Weight')] },
  { key: 'failover-settings', fields: [B('failover_only', 'Failover Only')] },
  { key: 'session-timeout', fields: [B('idle_timeout_enabled', 'Enable Idle Timeout'), N('idle_timeout_minutes', 'Idle Timeout (minutes)', { dependsOn: 'idle_timeout_enabled', req: true })] },
]

// ── section presentation ─────────────────────────────────────────────────────
export const SECTION_ICONS = {
  network: 'server', session: 'clock', authentication: 'lock', typescript: 'reports', display: 'sessions', 'proxy-settings': 'cloud',
  recording: 'recordings', 'connection-limits': 'analytics', database: 'db', 'failover-settings': 'refresh', sftp: 'folder', 'session-timeout': 'clock',
  performance: 'zap', wol: 'zap', behavior: 'activity', console: 'commands', audio: 'phone', 'load-balancing': 'refresh', 'pre-connection': 'link',
  gateway: 'sso', 'basic-parameters': 'sliders', clipboard: 'copy', 'device-redirection': 'sessions', remoteapp: 'integrations', 'preconnection-pdu': 'link',
  repeater: 'refresh', container: 'folder',
}
const OPEN_DEFAULT = new Set(['network', 'authentication', 'database'])
export const isOpenByDefault = (key) => OPEN_DEFAULT.has(key)
export const titleize = (k) => k.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())

// ── protocol catalogue (picker) ──────────────────────────────────────────────
export const PROTO_GROUPS = [
  { title: 'Desktop & Terminal', sub: 'Remote desktop, terminal, and Kubernetes access protocols.', items: ['kubernetes', 'telnet', 'ssh', 'vnc', 'rdp'] },
  { title: 'Database Clients CLI', sub: 'Direct, secure access to database engines via CLI.', items: ['pgsql', 'mysql', 'mssql', 'mongodb', 'redis', 'oracle', 'mariadb'] },
  { title: 'Database Clients GUI', sub: 'Direct, secure access to databases via graphical interfaces.', items: ['azure-data-studio', 'datagrip', 'dbeaver', 'hue', 'mongodb-compass', 'mysql-workbench', 'nosqlbooster', 'oracle-sql-developer', 'pgadmin', 'sapgui', 'studio3t'] },
  { title: 'Web App Clients', sub: 'Secure browser-based access to internal web applications via a managed container.', items: ['web-app'] },
]

// display name + brand mark (icon + colour, or a logo file under /assets/logos)
export const PROTO_META = {
  kubernetes: { name: 'KUBERNETES', icon: 'integrations', color: '#326CE5' },
  telnet: { name: 'TELNET', icon: 'commands', color: '#DC2626' },
  ssh: { name: 'SSH', icon: 'commands', color: '#E8A317' },
  vnc: { name: 'VNC', icon: 'sessions', color: '#7C3AED' },
  rdp: { name: 'RDP', icon: 'windows', color: '#0078D4' },
  pgsql: { name: 'PostgreSQL', icon: 'db', color: '#336791' },
  mysql: { name: 'MySQL', icon: 'db', color: '#00758F' },
  mssql: { name: 'Microsoft SQL Server', logo: 'mssql', color: '#A91D22' },
  mongodb: { name: 'MongoDB', icon: 'db', color: '#13AA52' },
  redis: { name: 'Redis', icon: 'db', color: '#DC382D' },
  oracle: { name: 'Oracle DB', logo: 'oracle', color: '#F80000' },
  mariadb: { name: 'MariaDB', icon: 'db', color: '#003545' },
  'azure-data-studio': { name: 'Azure Data Studio', logo: 'azure', color: '#0078D4' },
  datagrip: { name: 'DataGrip', icon: 'db', color: '#22D88F' },
  dbeaver: { name: 'DBeaver', icon: 'db', color: '#382923' },
  hue: { name: 'Hue', icon: 'db', color: '#4266B1' },
  'mongodb-compass': { name: 'MongoDB Compass', icon: 'db', color: '#13AA52' },
  'mysql-workbench': { name: 'MySQL Workbench', icon: 'db', color: '#00758F' },
  nosqlbooster: { name: 'NoSQLBooster', icon: 'db', color: '#4CAF50' },
  'oracle-sql-developer': { name: 'Oracle SQL Developer', logo: 'oracle', color: '#F80000' },
  pgadmin: { name: 'pgAdmin 4', icon: 'db', color: '#336791' },
  sapgui: { name: 'SAP GUI', logo: 'sap', color: '#008FD3' },
  studio3t: { name: 'Studio 3T', icon: 'db', color: '#22A45D' },
  'web-app': { name: 'Web Application', icon: 'globe', color: '#7C3AED' },
}

export const categoryOf = (id) => {
  if (SCHEMAS[id]) return SCHEMAS[id].category
  if (id === 'web-app') return 'D'
  return 'C' // db GUI client
}
