import MapCache from '../classes/MapCache'
import createUsingGetSet from './createUsingGetSet'

export default function fetchUsingCache<CacheKey extends any[], Value>(fetch: (...args: CacheKey) => Promise<Value>) {
  const _fetchUsingCache = createUsingGetSet(fetch)
  return async (cache: MapCache<CacheKey, Value>, fetchArgs: CacheKey) => {
    return await _fetchUsingCache(
      cache.get.bind(cache),
      async function set(key: CacheKey, value: Promise<Value>) {
        const resolvedValue = await value
        cache.set(key, resolvedValue)
      },
      fetchArgs
    )
  }
}
