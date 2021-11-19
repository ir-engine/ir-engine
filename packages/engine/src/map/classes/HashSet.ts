import { ITuple } from '../types'

export default class HashSet<Value extends ITuple> {
  _size: number
  map: {
    [key: string]: Value
  }

  constructor(iterable: Iterable<Value> = []) {
    this._size = 0
    this.map = {}
    for (const value of iterable) {
      this.map[value.hash] = value
    }
  }

  add(value: Value) {
    if (!this.has(value)) {
      this._size++
    }
    this.map[value.hash] = value
    return this
  }

  has(value: Value) {
    return this.map.hasOwnProperty(value.hash)
  }

  delete(value: Value) {
    if (this.has(value)) {
      delete this.map[value.hash]
      this._size--
      return true
    } else {
      return false
    }
  }

  *values() {
    for (const key in this.map) {
      yield this.map[key]
    }
  }
  keys() {
    return this.values()
  }
  entries() {
    return this.values()
  }

  clear() {
    this.map = {}
  }

  get size() {
    return this._size
  }
}
