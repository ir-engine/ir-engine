import { IArrayKeyedMap } from '../types'
// import HashMap from 'megahash'

interface Options<Value> {
  defaultValue?: Value
}

function stringifyArray(array: any[]) {
  switch (array.length) {
    case 1:
      return array[0]
    case 2:
      return array[0] + ',' + array[1]
    case 3:
      return array[0] + ',' + array[1] + ',' + array[2]
    case 4:
      return array[0] + ',' + array[1] + ',' + array[2] + ',' + array[3]
    default:
      return array.join(',')
  }
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

  addKey(key: string, keySource: KeySource) {
    this.keySources.set(key, keySource)
  }

  getKeySource(key: string): KeySource | undefined {
    return this.keySources.get(key)
  }

  set(keySource: KeySource, value: Value) {
    const key = stringifyArray(keySource)
    this.addKey(key, keySource)
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
    for (const key of this.map.keys()) {
      yield this.getKeySource(key)!
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
