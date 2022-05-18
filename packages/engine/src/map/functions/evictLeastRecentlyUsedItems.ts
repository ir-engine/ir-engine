import { ITuple, IParametricMap } from '../types'

export default function* evictLeastRecentlyUsedItems<K extends ITuple, V>(
  cache: IParametricMap<K, V>,
  maxSize: number,
  keys = cache.keys()
): Generator<[K, V]> {
  let cachedItemCount = cache.size
  for (const key of keys) {
    if (cachedItemCount > maxSize) {
      const value = cache.get(key)
      cachedItemCount--
      cache.delete(key)
      yield [key, value!]
    } else {
      break
    }
  }
}
