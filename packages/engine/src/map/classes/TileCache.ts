import evictLeastRecentlyUsedItems from '../functions/evictLeastRecentlyUsedItems'

export default class TileCache<Tile> {
  static getKey(x: number, y: number) {
    return `${x},${y}`
  }

  /** ordered by time last used, ascending */
  map = new Map<string, Tile>()
  maxSize: number
  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  set(x: number, y: number, value: Tile) {
    // Update cache, ensuring time-last-used order
    const cacheKey = TileCache.getKey(x, y)
    this.map.delete(cacheKey)
    this.map.set(cacheKey, value)
    return this
  }

  updateLastUsedTime(x: number, y: number) {
    this.set(x, y, this.peek(x, y))
  }

  peek(x: number, y: number) {
    return this.map.get(TileCache.getKey(x, y))
  }

  get(x: number, y: number) {
    this.updateLastUsedTime(x, y)
    return this.peek(x, y)
  }

  evictLeastRecentlyUsedItems() {
    evictLeastRecentlyUsedItems(this.map, this.maxSize)
  }
}
