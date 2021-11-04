import { ITuple } from '../types'

export default class TileKey implements ITuple {
  _hash: string
  _x: number
  _y: number
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
    this._hash = `${this._x},${this._y}`
  }
  get hash() {
    return this._hash
  }

  get 0() {
    return this._x
  }
  get 1() {
    return this._x
  }
}
