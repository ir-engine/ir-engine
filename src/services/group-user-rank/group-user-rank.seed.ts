export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'group-user-rank',
  templates:
        [
          { rank: 'principal' },
          { rank: 'teacher' },
          { rank: 'student' }
        ]
}

export default seed
