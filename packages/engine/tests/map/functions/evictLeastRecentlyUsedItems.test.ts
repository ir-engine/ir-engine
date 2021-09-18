import evictLeastRecentlyUsedItems from '../../../src/map/functions/evictLeastRecentlyUsedItems'

test('evictLeastRecentlyUsedItems', () => {
  const cache = new Map<number, number>()
  const keysEvicted = []
  const keysRemaining = []
  for(let i = 0; i < 3; i++) {
    cache.set(i, i)
  }

  for(const key of evictLeastRecentlyUsedItems(cache, 2)) {
    keysEvicted.push(key)
  }

  for(const key of cache.keys()) {
    keysRemaining.push(key)
  }

  expect(keysEvicted).toEqual([0])
  expect(keysRemaining).toEqual([1, 2])
})
