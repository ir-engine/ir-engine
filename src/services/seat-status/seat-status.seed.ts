export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'seat-status',
  randomize: false,
  templates: [
    { status: 'pending' },
    { status: 'filled' }
  ]
}

export default seed
