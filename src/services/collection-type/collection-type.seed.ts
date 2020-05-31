import config from '../../config'

export const seed = {
  disabled: !config.db.forceRefresh,
  delete: config.db.forceRefresh,
  path: 'collection-type',
  randomize: false,
  templates:
    [
      { type: 'scene' },
      { type: 'inventory' },
      { type: 'project' }
    ]
}

export default seed
