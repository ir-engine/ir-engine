import { IArrayKeyedMap } from '../types'

interface Options<Value> {
  defaultValue?: Value
}

export default class ArrayKeyedMap<KeySource extends any[], Value> implements IArrayKeyedMap<KeySource, Value> {
  /** ordered by time last used, ascending */
  map = new Map<string, Value>()
  keySources = new Map<string, KeySource>()
  defaultValue: Value

  constructor(iterable: Iterable<[KeySource, Value]> = [], options: Options<Value> = {}) {
    for (const [key, value] of iterable) {
      this.set(key, value)
    }
    if (typeof options.defaultValue !== 'undefined') {
      this.defaultValue = options.defaultValue
    }
  }

  getKey(source: KeySource) {
    const key = source.join(',')
    this.keySources.set(key, source)
    return key
  }

  getKeySource(key: string): KeySource | undefined {
    return this.keySources.get(key)
  }

  set(keySource: KeySource, value: Value) {
    // Update cache, ensuring time-last-used order
    const key = this.getKey(keySource)
    this.map.set(key, value)
    return this
  }

  get(key: KeySource) {
    const stringKey = this.getKey(key)
    const value = this.map.get(stringKey)
    if (typeof value === 'undefined') {
      return this.defaultValue
    } else {
      return value
    }
  }

  delete(key: KeySource) {
    const stringKey = this.getKey(key)
    this.keySources.delete(stringKey)
    return this.map.delete(stringKey)
  }

  *keys(): Generator<KeySource> {
    for (const key of this.map.keys()) {
      yield this.getKeySource(key)!
    }
  }

  values() {
    return this.map.values()
  }
}
