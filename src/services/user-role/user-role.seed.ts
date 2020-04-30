export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'user-role',
  templates:
      [
        { name: 'admin' },
        { name: 'moderator' },
        { name: 'user' },
        { name: 'guest' }
      ]
}

export default seed
