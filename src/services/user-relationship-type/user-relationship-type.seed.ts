export const seed = {
  disabled: false,
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
