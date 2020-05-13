export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'user-role',
  templates:
    [
      { role: 'admin' },
      { role: 'moderator' },
      { role: 'user' },
      { role: 'guest' }
    ]
}

export default seed
