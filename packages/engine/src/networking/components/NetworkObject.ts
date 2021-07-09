import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/** Component class for network objects. */
export class NetworkObject extends Component<NetworkObject> {
  /** Network id of the object. */
  networkId: number
  /** Owner id of the object. */
  ownerId: string
  /** Entity unique Id from editor scene. */
  uniqueId: string
  /** Map of components associated with this object. */
  componentMap: any
  /** Snapshot time of the object. */
  snapShotTime: any
}

NetworkObject._schema = {
  ownerId: { type: Types.String },
  networkId: { type: Types.Number },
  uniqueId: { type: Types.String },
  componentMap: { type: Types.Ref },
  snapShotTime: { type: Types.Number, default: 0 }
}
