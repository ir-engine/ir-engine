import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
/**
  * the component is added to any entity and hangs the camera watching it
 */
export class FollowCameraComponent extends Component<FollowCameraComponent> {
  mode: string
  distance: number
  minDistance: number
  maxDistance: number
}

FollowCameraComponent.schema = {
  mode: { type: Types.String, default: 'thirdPerson' },
  distance: { type: Types.Number, default: 3 },
  minDistance: { type: Types.Number, default: 2 },
  maxDistance: { type: Types.Number, default: 7 }
};
