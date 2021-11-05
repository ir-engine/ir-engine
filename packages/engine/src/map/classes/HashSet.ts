import { ITuple } from '../types'

export default class HashSet<Value extends ITuple> {
  map: Map<Value['hash'], Value>

  constructor(iterable: Iterable<Value> = []) {
    this.map = new Map()
    for (const value of iterable) {
      this.map.set(value.hash, value)
    }
  }

  add(value: Value) {
    this.map.set(value.hash, value)
    return this
  }

  has(value: Value) {
    return this.map.has(value.hash)
  }

  delete(value: Value) {
    return this.map.delete(value.hash)
  }

  values() {
    return this.map.values()
  }
  keys() {
    return this.values()
  }
  entries() {
    return this.values()
  }

  clear() {
    this.map.clear()
  }

  get size() {
    return this.map.size
  }
}
