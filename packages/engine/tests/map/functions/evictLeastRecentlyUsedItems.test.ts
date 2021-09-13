import {  evictLeastRecentlyUsedItems } from '../../../src/map/functions/evictLeastRecentlyUsedItems'
describe('evictLeastRecentlyUsedItems', () => {
  const cache = new Map<number, number>()
  for(let i = 0; i < 3; i++) {
    cache.set(i, i)
  }
  evictLeastRecentlyUsedItems(cache, 2)

  const keys = []
  for(const key of cache.keys()) {
    keys.push(key)
  }

  expect(keys).toEqual([1, 2])
})
