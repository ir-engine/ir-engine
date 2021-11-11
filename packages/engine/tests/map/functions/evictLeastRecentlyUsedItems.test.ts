import assert from 'assert'
import ParametricCache from '../../../src/map/classes/ParametricCache'
import TileKey from '../../../src/map/classes/TileKey'
import evictLeastRecentlyUsedItems from '../../../src/map/functions/evictLeastRecentlyUsedItems'
import {ITuple} from '../../../src/map/types'

describe('evictLeastRecentlyUsedItems', () => {
  it('works', () => {
    const cache = new ParametricCache(2)
    const keysEvicted: ITuple[] = []
    const keysRemaining: ITuple[] = []
    for (let i = 0; i < 3; i++) {
      const key = new TileKey(i, i)
      cache.set(key, i)
    }

    for (const [key] of evictLeastRecentlyUsedItems(cache, 2)) {
      keysEvicted.push(key)
    }

    for (const key of cache.keys()) {
      keysRemaining.push(key)
    }

    assert.deepEqual(keysEvicted.map((k) => k.hash), ['0,0'])
    assert.deepEqual(keysRemaining.map((k) => k.hash), ['1,1', '2,2'])
  })
})
