export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'conversation-type',
  randomize: false,
  templates:
    [
      { type: 'user' },
      { type: 'group' },
      { type: 'party' }
    ]
}

export default seed
