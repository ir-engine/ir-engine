export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'collection-type',
  randomize: false,
  templates:
    [
      { type: 'scene' },
      { type: 'inventory' }
    ]
}

export default seed
