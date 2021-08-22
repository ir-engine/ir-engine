import { db } from '../../packages/server/src/config'

describe('db-config', () => {
  it('should export db url', () => {
    expect(db.url.startsWith('mysql://'))
  })
})
