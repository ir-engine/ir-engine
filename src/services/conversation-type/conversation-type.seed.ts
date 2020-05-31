import config from '../../../src/config'

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'conversation-type',
  randomize: false,
  templates:
    [
      { type: 'user' },
      { type: 'group' },
      { type: 'party' }
    ]
}

export default seed
