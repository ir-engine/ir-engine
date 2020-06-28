import Axis2D from "../interfaces/Axis2D"

export default class Axis2DState {
  current: Axis2D
  prev: Axis2D
  constructor() {
    this.current = {
      x: 0,
      y: 0
    }
    this.prev = {
      x: 0,
      y: 0
    }
  }

  copy(source: Axis2DState): Axis2DState {
    this.current = source.current
    this.prev = source.prev
    return this
  }

  set(current: Axis2D, prev: Axis2D): Axis2DState {
    this.current = current
    this.prev = prev
    return this
  }

  clone(): Axis2DState {
    return new Axis2DState().set(this.current, this.prev)
  }
}
