import { Component } from '../../ecs/classes/Component'
import { Vector3, Quaternion, Euler } from 'three'
import { Types } from '../../ecs/types/Types'

export class TransformComponent extends Component<TransformComponent> {
  position: Vector3
  rotation: Quaternion
  scale: Vector3

  static _schema = {
    position: { type: Types.Vector3Type, default: new Vector3() },
    rotation: { type: Types.QuaternionType, default: new Quaternion() },
    scale: { type: Types.Vector3Type, default: new Vector3(1, 1, 1) }
  }

  constructor() {
    super()
    this.reset()
  }

  copy(src: { position?: Vector3; rotation?: Quaternion; scale?: Vector3; velocity?: Vector3 }): this {
    if (src.position) {
      this.position.copy(src.position)
    }
    if (src.rotation) {
      this.rotation.copy(src.rotation)
    }
    if (src.scale) {
      this.scale.copy(src.scale)
    }

    return this
  }

  reset(): void {
    this.position = new Vector3()
    this.rotation = new Quaternion()
    this.scale = new Vector3(1, 1, 1)
  }
}
