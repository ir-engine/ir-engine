export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'access-control-scope',
  randomize: false,
  templates:
        [
          { scope: 'none' },
          { scope: 'self' },
          { scope: 'all' }
        ]
}

export default seed
