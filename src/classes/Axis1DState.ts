import Axis1D from "../interfaces/Axis1D"

export default class Axis1DState {
  current: Axis1D
  prev: Axis1D
  constructor() {
    this.current = {
      x: 0
    }
    this.prev = {
      x: 0
    }
  }

  copy(source: Axis1DState): Axis1DState {
    this.current = source.current
    this.prev = source.prev
    return this
  }

  set(current: Axis1D, prev: Axis1D): Axis1DState {
    this.current = current
    this.prev = prev
    return this
  }

  clone(): Axis1DState {
    return new Axis1DState().set(this.current, this.prev)
  }
}
