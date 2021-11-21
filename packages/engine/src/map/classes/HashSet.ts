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
    this.map[value.hash] = value
    this._size++
    return this
  }

  has(value: Value) {
    return this.map.hasOwnProperty(value.hash)
  }

  delete(value: Value) {
    const has = this.has(value)
    delete this.map[value.hash]
    this._size--
    return has
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
    this._size = 0
  }

  get size() {
    return this._size
  }
}
