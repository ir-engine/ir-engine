export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: true,
  path: 'user-relationship-type',
  randomize: false,
  templates:
      [
        { name: 'requested' }, // Default state of relatedUser
        { name: 'friend' },
        { name: 'blocked' }
      ]
}

export default seed
