export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'group-user-rank',
  templates:
        [
          { name: 'principal' },
          { name: 'teacer' },
          { name: 'student' }
        ]
}

export default seed
