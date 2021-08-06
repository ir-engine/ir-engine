import { Quaternion, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class SpawnNetworkObjectComponent extends Component<SpawnNetworkObjectComponent> {
  ownerId: string
  uniqueId: string
  networkId: number
  parameters: any
  static _schema = {
    ownerId: { type: Types.String },
    uniqueId: { type: Types.String },
    networkId: { type: Types.Number },
    parameters: { type: Types.Ref }
  }
}
