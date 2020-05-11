export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'user-role',
  templates:
      [
        { userRole: 'admin' },
        { userRole: 'moderator' },
        { userRole: 'user' },
        { userRole: 'guest' }
      ]
}

export default seed
