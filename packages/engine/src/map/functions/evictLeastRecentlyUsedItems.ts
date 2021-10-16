export default function* evictLeastRecentlyUsedItems<K, V>(cache: Map<K, V>, maxSize: number): Generator<[K, V]> {
  let cachedItemCount = cache.size
  for (const key of cache.keys()) {
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
