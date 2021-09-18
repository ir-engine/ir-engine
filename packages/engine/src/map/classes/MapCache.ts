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

  updateLastUsedTime(key: Key, value?: Value) {
    this.set(key, value || this.map.get(key))
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

  get(key: Key) {
    const value = this.map.get(key)
    if (value) {
      this.updateLastUsedTime(key, value)
    }
    return value
  }

  getWithoutEffectingLastUsedTime(key: Key) {
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
