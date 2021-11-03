// TODO delete file
import { IParametricMap } from '../types'
// TODO(perf) would something like megahash help?
// import HashMap from 'megahash'

interface Options<Value> {
  defaultValue?: Value
}

export default class ArrayKeyedMap<KeySource extends any[], Value> implements IParametricMap<KeySource, Value> {
  /** ordered by time last used, ascending */
  map = new Map<string, Value>()
  keySources = new Set<KeySource>()
  defaultValue: Value

  constructor(iterable: Iterable<[KeySource, Value]> = [], options: Options<Value> = {}) {
    for (const [key, value] of iterable) {
      this.set(key, value)
    }
    if (typeof options.defaultValue !== 'undefined') {
      this.defaultValue = options.defaultValue
    }
  }

  addKey(keySource: KeySource) {
    this.keySources.add(keySource)
  }

  getKeySource(key: string) {
    return key.split(',')
  }

  set(keySource: KeySource, value: Value) {
    const key = stringifyArray(keySource)
    this.addKey(keySource)
    this.map.set(key, value)
    return this
  }

  get(key: KeySource) {
    const stringKey = stringifyArray(key)
    if (this.map.has(stringKey)) {
      return this.map.get(stringKey)!
    } else {
      return this.defaultValue
    }
  }

  delete(key: KeySource) {
    const stringKey = stringifyArray(key)
    this.keySources.delete(stringKey)
    return this.map.delete(stringKey)
  }

  *keys(): Generator<KeySource> {
    for (const key of this.keySources.values()) {
      yield key
    }
  }

  values() {
    return this.map.values()
  }

  clear() {
    this.map.clear()
    this.keySources.clear()
  }
}
