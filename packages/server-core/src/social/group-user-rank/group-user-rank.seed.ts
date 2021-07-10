import config from '../../appconfig'

export const groupUserRankSeed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'group-user-rank',
  randomize: false,
  templates: [{ rank: 'owner' }, { rank: 'admin' }, { rank: 'user' }]
}
