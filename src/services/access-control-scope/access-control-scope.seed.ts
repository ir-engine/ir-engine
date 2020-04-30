export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'access-control-scope',
  randomize: false,
  templates:
        [
          { name: 'none' },
          { name: 'self' },
          { name: 'all' }
        ]
}

export default seed
