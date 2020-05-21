export const seed = {
  disabled: (process.env.FORCE_DB_REFRESH !== 'true'),
  delete: (process.env.FORCE_DB_REFRESH === 'true'),
  path: 'subscription-level',
  randomize: false,
  templates: [
    { level: 'all' },
    { level: 'paid' }
  ]
}

export default seed
