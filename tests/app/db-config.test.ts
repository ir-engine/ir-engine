import { db } from '../../packages/server/db-config'

describe('db-config', () => {
  it('should export db url', () => {
    expect(db.url.startsWith('mysql://'))
  })
})
