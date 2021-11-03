import evictLeastRecentlyUsedItems from '../functions/evictLeastRecentlyUsedItems'
import { IBox, IParametricMap } from '../types'
import Hash from './Hash'

export default class ParametricCache<Key extends IBox, Value> implements IParametricMap<Key, Value> {
  hash = new Hash<Value>()
  maxSize: number
  _keys = new Map<string, Key>()
  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  updateLastUsedTime(key: Key) {
    // ensuring time-last-used order
    this._keys.delete(key.valueOf())
    this._keys.set(key.valueOf(), key)
  }

  set(key: Key, value: Value) {
    this.updateLastUsedTime(key)
    this.setWithoutAffectingLastUsedTime(key, value)
    return this
  }

  setWithoutAffectingLastUsedTime(key: Key, value: Value) {
    this._keys.set(key.valueOf(), key)
    this.hash.set(key.valueOf(), value)
  }

  get(key: Key) {
    const value = this.hash.get(key.valueOf())
    if (value !== undefined) {
      this.updateLastUsedTime(key)
    }
    return value
  }

  getWithoutEffectingLastUsedTime(key: Key) {
    return this.hash.get(key.valueOf())
  }

  delete(key: Key) {
    this._keys.delete(key.valueOf())
    return this.hash.delete(key.valueOf())
  }

  *evictLeastRecentlyUsedItems(): Generator<[Key, Value]> {
    for (const [key, value] of evictLeastRecentlyUsedItems(this, this.maxSize)) {
      yield [key!, value]
    }
  }

  *keys(maxCount = this.maxSize) {
    let count = 0
    for (const key of this._keys.values()) {
      yield key
      count++
      // Stopgap for until I figure out why this generator doesn't finish
      if (count > maxCount) break
    }
  }

  values() {
    return this.hash.values()
  }

  clear() {
    this._keys.clear()
    this.hash.clear()
  }

  get size() {
    return this.hash.map.size
  }
}
