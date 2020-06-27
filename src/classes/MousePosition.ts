import Vector2State from "../interfaces/Vector2State"

export default class MousePosition {
  current: Vector2State
  prev: Vector2State
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

  copy(source: MousePosition): MousePosition {
    this.current = source.current
    this.prev = source.prev
    return this
  }

  set(current: Vector2State, prev: Vector2State): MousePosition {
    this.current = current
    this.prev = prev
    return this
  }

  clone(): MousePosition {
    return new MousePosition().set(this.current, this.prev)
  }
}
