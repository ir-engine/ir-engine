export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
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
