import { Quaternion, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class RespawnTagComponent extends Component<RespawnTagComponent> {
  position: Vector3
  rotation: Quaternion

  static _schema = {
    position: { type: Types.Ref },
    rotation: { type: Types.Ref }
  }
}
