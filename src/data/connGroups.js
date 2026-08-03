// Connection groups — shared by the Connection Groups list and the create/edit form.
export const CONN_GROUPS = [
  { id: 'tanflow-core', name: 'Tanflow Core', type: 'Organizational', location: 'ROOT', parent: 'ROOT', contents: '4 targets · 1 subgroup', affinity: false, maxConns: '', maxPerUser: '' },
  { id: 'bts-lab', name: 'BTS Lab', type: 'Organizational', location: 'ROOT', parent: 'ROOT', contents: '10 targets', affinity: false, maxConns: '', maxPerUser: '' },
  { id: 'local-tools', name: 'Local tools', type: 'Organizational', location: 'ROOT', parent: 'ROOT', contents: '2 targets', affinity: false, maxConns: '', maxPerUser: '' },
  { id: 'prod-db-pool', name: 'Prod DB pool', type: 'Balancing', location: 'ROOT › Tanflow Core', parent: 'Tanflow Core', contents: '3 targets', affinity: true, maxConns: '120', maxPerUser: '2' },
]
export const PARENTS = ['ROOT', 'Tanflow Core', 'BTS Lab', 'Local tools']
