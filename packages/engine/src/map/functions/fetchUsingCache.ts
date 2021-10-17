import MapCache from '../classes/MapCache'
import createUsingGetSet from './createUsingGetSet'

export default function fetchUsingCache<CacheKey extends any[], Value>(fetch: (...args: any[]) => Promise<Value>) {
  const _fetchUsingCache = createUsingGetSet(fetch)
  return async (cache: MapCache<CacheKey, Value>, key: CacheKey, ...extraArgs: any[]) => {
    return await _fetchUsingCache(
      cache.get.bind(cache),
      async function set(key: CacheKey, value: Promise<Value>) {
        const resolvedValue = await value
        cache.set(key, resolvedValue)
      },
      key,
      ...extraArgs
    )
  }
}
