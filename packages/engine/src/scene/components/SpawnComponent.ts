import { Quaternion, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class SpawnComponent extends Component<SpawnComponent> {
  userId: string
  static _schema = {
    userId: { type: Types.String }
  }
}
