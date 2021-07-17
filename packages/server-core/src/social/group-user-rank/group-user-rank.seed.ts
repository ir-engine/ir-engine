import config from '../../appconfig'

export const groupUserRankSeed = {
  path: 'group-user-rank',
  randomize: false,
  templates: [{ rank: 'owner' }, { rank: 'admin' }, { rank: 'user' }]
}
