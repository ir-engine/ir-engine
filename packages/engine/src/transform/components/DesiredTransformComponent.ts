import { Component } from '../../ecs/classes/Component'
import { Vector3, Quaternion, Euler } from 'three'
import { Types } from '../../ecs/types/Types'

export class DesiredTransformComponent extends Component<DesiredTransformComponent> {
  position: Vector3
  rotation: Quaternion
  positionRate: number
  rotationRate: number
  lockRotationAxis: [boolean, boolean, boolean]
}

DesiredTransformComponent._schema = {
  position: { default: new Vector3(), type: Types.Vector3Type },
  rotation: { default: new Quaternion(), type: Types.QuaternionType },
  positionRate: { default: 2, type: Types.Number },
  rotationRate: { default: 4, type: Types.Number },
  lockRotationAxis: { default: [false, false, false], type: Types.Array }
}
