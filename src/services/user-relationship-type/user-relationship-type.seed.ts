export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: false,
  path: 'user-relationship-type',
  randomize: false,
  templates:
    [
      { type: 'requested' }, // Default state of relatedUser
      { type: 'friend' },
      { type: 'blocked' }
    ]
}

export default seed
