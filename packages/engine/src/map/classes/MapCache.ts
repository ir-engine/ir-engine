import evictLeastRecentlyUsedItems from '../functions/evictLeastRecentlyUsedItems'
import { IArrayKeyedMap } from '../types'
import ArrayKeyedMap from './ArrayKeyedMap'

export default class MapCache<Key extends any[], Value> implements IArrayKeyedMap<Key, Value> {
  /** ordered by time last used, ascending */
  map = new ArrayKeyedMap<Key, Value>()
  maxSize: number
  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  set(key: Key, value: Value) {
    // Update cache, ensuring time-last-used order
    this.map.delete(key)
    this.map.set(key, value)
    return this
  }

  setWithoutAffectingLastUsedTime(key: Key, value: Value) {
    this.map.set(key, value)
  }

  updateLastUsedTime(key: Key) {
    this.set(key, this.map.get(key))
  }

  get(key: Key) {
    this.updateLastUsedTime(key)
    return this.map.get(key)
  }

  delete(key: Key) {
    return this.map.delete(key)
  }

  *evictLeastRecentlyUsedItems() {
    for (const key of evictLeastRecentlyUsedItems(this.map.map, this.maxSize)) {
      yield this.map.getKeySource(key)
    }
  }

  keys() {
    return this.map.keys()
  }
  values() {
    return this.map.values()
  }
}
