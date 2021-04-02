import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class RigidBody extends Component<any> {
  isKinematic = 0
}

RigidBody._schema = {
  isKinematic: { type: Types.Number, default: 0 }
};
