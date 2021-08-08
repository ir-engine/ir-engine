import Lines from '../components/Lines'
import { addComponent, createEntity, getComponent } from '../../ecs/functions/EntityFunctions'
import PointsComponent from '../components/Points'
import Obj from '../components/Obj'
import { Component } from '../../ecs/classes/Component'

class DebugComponent extends Component<DebugComponent> {
  static points = null
  static lines = null

  static init() {
    const entity = createEntity()
    addComponent(entity, Obj)
    addComponent(entity, DebugComponent)
    addComponent(entity, PointsComponent)
    addComponent(entity, DebugComponent)

    this.points = getComponent(entity, PointsComponent)
    this.points.init()

    addComponent(entity, Lines)
    this.lines = getComponent(entity, Lines)
    this.lines.init()
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
