import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

export class NetworkObjectOwner extends Component<NetworkObjectOwner> {
  /** Network id of the object owner. */
  networkId: number
}

NetworkObjectOwner._schema = {
  networkId: { type: Types.Number }
}
