import assert from 'assert'
import { db } from '../src/db-config'

describe('db-config', () => {
  it('should export db url', () => {
    assert.ok(db.url.startsWith('mysql://'))
  })
})
