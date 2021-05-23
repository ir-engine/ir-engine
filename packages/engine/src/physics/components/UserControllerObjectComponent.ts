import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

/**
 * @author Josh Field <github.com/HexaField>
 */

export class UserControlledColliderComponent extends Component<UserControlledColliderComponent> {
  ownerNetworkId: number;
}

UserControlledColliderComponent._schema = {
  ownerNetworkId: { type: Types.Number, default: null },
};
