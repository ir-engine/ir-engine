export default function evictLeastRecentlyUsedItems<K, V>(cache: Map<K, V>, maxSize: number) {
  let cachedItemCount = cache.size
  for (const key of cache.keys()) {
    if (cachedItemCount > maxSize) {
      cachedItemCount--
      cache.delete(key)
    }
  }
}
