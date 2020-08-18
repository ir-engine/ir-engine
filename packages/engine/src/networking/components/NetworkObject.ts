import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

interface PropTypes {
  networkId: number
  ownerId: number
}

export class NetworkObject extends Component<PropTypes> {}

NetworkObject.schema = {
  ownerId: { type: Types.Number },
  networkId: { type: Types.Number }
};
