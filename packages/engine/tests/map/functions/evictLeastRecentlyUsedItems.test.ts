import assert from 'assert'
import evictLeastRecentlyUsedItems from '../../../src/map/functions/evictLeastRecentlyUsedItems'

describe('evictLeastRecentlyUsedItems', () => {
  it('works', () => {
    const cache = new Map<number, number>()
    const keysEvicted = []
    const keysRemaining = []
    for (let i = 0; i < 3; i++) {
      cache.set(i, i)
    }

    for (const [key] of evictLeastRecentlyUsedItems(cache, 2)) {
      keysEvicted.push(key)
    }

    for (const key of cache.keys()) {
      keysRemaining.push(key)
    }

    assert.deepEqual(keysEvicted, [0])
    assert.deepEqual(keysRemaining, [1, 2])
  })
})
