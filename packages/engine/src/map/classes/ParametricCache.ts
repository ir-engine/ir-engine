import evictLeastRecentlyUsedItems from '../functions/evictLeastRecentlyUsedItems'
import { ITuple, IParametricMap } from '../types'
import HashMap from './HashMap'
import HashSet from './HashSet'

export default class ParametricCache<Key extends ITuple, Value> implements IParametricMap<Key, Value> {
  map = new HashMap<Key, Value>()
  maxSize: number
  _keys = new HashSet<Key>()
  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  updateLastUsedTime(key: Key) {
    // ensuring time-last-used order
    this._keys.delete(key)
    this._keys.add(key)
  }

  set(key: Key, value: Value) {
    this.updateLastUsedTime(key)
    this.setWithoutAffectingLastUsedTime(key, value)
    return this
  }

  setWithoutAffectingLastUsedTime(key: Key, value: Value) {
    this._keys.add(key)
    this.map.set(key, value)
  }

  get(key: Key) {
    const value = this.map.get(key)
    if (value !== undefined) {
      this.updateLastUsedTime(key)
    }
    return value
  }

  getWithoutEffectingLastUsedTime(key: Key) {
    return this.map.get(key)
  }

  delete(key: Key) {
    this._keys.delete(key)
    return this.map.delete(key)
  }

  evictLeastRecentlyUsedItems(): Generator<[Key, Value]> {
    return evictLeastRecentlyUsedItems(this, this.maxSize)
  }

  *keys(maxCount = this.maxSize) {
    let count = 0
    for (const key of this._keys.values()) {
      yield key
      count++
      // Stopgap for until I figure out why this generator doesn't finish
      // TODO still an issue?
      if (count > maxCount) break
    }
  }

  values() {
    return this.map.values()
  }

  clear() {
    this._keys.clear()
    this.map.clear()
  }

  get size() {
    return this.map.size
  }
}
