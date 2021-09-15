import ArrayKeyedMap from '../classes/ArrayKeyedMap'
import MapCache from '../classes/MapCache'

export default function createCachingly<
  CacheKey extends any[],
  Value,
  Cache extends ArrayKeyedMap<CacheKey, Value> | MapCache<CacheKey, Value>
>(cache: Cache, create: (...args: CacheKey) => Value, createArgs: CacheKey) {
  let value = cache.get(createArgs)
  if (!value) {
    value = create(...createArgs)
    cache.set(createArgs, value)
  }
  return value
}
