import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class NetworkObject extends Component<NetworkObject> {
  networkId: number
  ownerId: string
  componentMap: any
  snapShotTime: any
}

NetworkObject._schema = {
  ownerId: { type: Types.String },
  networkId: { type: Types.Number },
  componentMap: { type: Types.Ref },
  snapShotTime: { type: Types.Number }
};
