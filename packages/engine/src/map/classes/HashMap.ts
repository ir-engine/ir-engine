// TODO(perf) would something like megahash help?
// import HashMap from 'megahash'

import { ITuple } from '../types'

interface Options<Value> {
  defaultValue?: Value
}

export default class HashMap<Key extends ITuple, Value> {
  map: Map<Key['hash'], Value>
  defaultValue: Value

  constructor(iterable: Iterable<[Key, Value]> = [], options: Options<Value> = {}) {
    this.map = new Map()
    for (const [key, value] of iterable) {
      this.map.set(key.hash, value)
    }
    if (typeof options.defaultValue !== 'undefined') {
      this.defaultValue = options.defaultValue
    }
  }

  set(key: Key, value: Value) {
    this.map.set(key.hash, value)
    return this
  }

  get(key: Key) {
    if (this.map.has(key.hash)) {
      return this.map.get(key.hash)!
    } else {
      return this.defaultValue
    }
  }

  delete(key: Key) {
    return this.map.delete(key.hash)
  }

  keyHashes() {
    return this.map.keys()
  }

  values() {
    return this.map.values()
  }

  clear() {
    this.map.clear()
  }
}
