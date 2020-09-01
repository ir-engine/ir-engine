import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class NetworkObject extends Component<NetworkObject> {
  networkId: number | string
  ownerId: number
  componentMap: any
}

NetworkObject.schema = {
  ownerId: { type: Types.Number },
  networkId: { type: Types.Number },
  componentMap: { type: Types.Ref }
};
