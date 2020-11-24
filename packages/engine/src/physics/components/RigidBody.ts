import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class RigidBody extends Component<any> {
  isKinematic = 0
}

RigidBody.schema = {
  isKinematic: { type: Types.Number, default: 0 }
};
