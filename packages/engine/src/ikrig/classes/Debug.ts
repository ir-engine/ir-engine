import { createEntity } from '../../ecs/functions/EntityFunctions'

class DebugComponent {
  static points = null
  static lines = null

  static init() {
    const entity = createEntity()
    // TODO: This is from ECSY, needs to be bitECS'd
    // addComponent(entity, Obj)
    // addComponent(entity, DebugComponent)
    // addComponent(entity, PointsComponent)
    // addComponent(entity, DebugComponent)

    // this.points = getMutableComponent(entity, PointsComponent)
    // this.points.init()

    // addComponent(entity, Lines)
    // this.lines = getMutableComponent(entity, Lines)
    // this.lines.init()
    return this
  }

  static reset() {
    this.points.reset()
    this.lines.reset()
    return this
  }

  static setPoint(p, hex: any = 0xff0000, shape = null, size = null) {
    this.points.add(p, hex, shape, size)
    return this
  }
  static setLine(p0, p1, hex_0: any = 0xff0000, hex_1 = null, is_dash = false) {
    this.lines.add(p0, p1, hex_0, hex_1, is_dash)
    return this
  }
}

export default DebugComponent