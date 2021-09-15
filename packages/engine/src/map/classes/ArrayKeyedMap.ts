import { IArrayKeyedMap } from '../types'

export default class ArrayKeyedMap<KeySource extends any[], Value> implements IArrayKeyedMap<KeySource, Value> {
  /** ordered by time last used, ascending */
  map = new Map<string, Value>()
  keySources = new Map<string, KeySource>()

  getKey(source: KeySource) {
    const key = source.join(',')
    this.keySources.set(key, source)
    return key
  }

  getKeySource(key: string) {
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
    return this.map.get(stringKey)
  }

  delete(key: KeySource) {
    const stringKey = this.getKey(key)
    return this.map.delete(stringKey)
  }

  *keys(): Generator<KeySource> {
    for (const key of this.map.keys()) {
      yield this.getKeySource(key)
    }
  }
}
