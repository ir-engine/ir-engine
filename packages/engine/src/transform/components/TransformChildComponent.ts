import { Quaternion, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class TransformChildComponent extends Component<TransformChildComponent> {
  parent: any
  offsetPosition: Vector3
  offsetQuaternion: Quaternion
}
TransformChildComponent._schema = {
  parent: { default: null, type: Types.Ref },
  offsetPosition: { default: new Vector3(), type: Types.Vector3Type },
  offsetQuaternion: { default: new Quaternion(), type: Types.QuaternionType }
}
