// Todo: Attach stuff to be like inventory, etc, later, and use me!

import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class NetworkClient extends Component<NetworkClient> {
  networkId: number
  userId: string
  name: string
}

NetworkClient.schema = {
  networkId: { type: Types.Number },
  userId: { type: Types.String, default: '' },
  name: { type: Types.String, default: 'Player' }
};
