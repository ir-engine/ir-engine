import config from '../../../src/config'

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'group-user-rank',
  templates:
        [
          { rank: 'principal' },
          { rank: 'teacher' },
          { rank: 'student' }
        ]
}

export default seed
