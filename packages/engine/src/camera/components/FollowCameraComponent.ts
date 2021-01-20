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
  raycastBoxOn: boolean
  rx1: number // first right x point of screen, two-dimensional square on the screen, hitting which the interactive objects are highlighted
  ry1: number // first right y point of screen
  rx2: number // second right x point of screen
  ry2: number // second right y point of screen
  farDistance: number // distance to which interactive objects from the camera will be highlighted
}

FollowCameraComponent._schema = {
  mode: { type: Types.String, default: 'thirdPersonLocked' },
  distance: { type: Types.Number, default: 3 },
  minDistance: { type: Types.Number, default: 0.5 },
  maxDistance: { type: Types.Number, default: 7 },
  raycastBoxOn: { type: Types.Boolean, default: true },
  rx1: { type: Types.Number, default: -0.1 },
  ry1: { type: Types.Number, default: -0.1 },
  rx2: { type: Types.Number, default: 0.1 },
  ry2: { type: Types.Number, default: 0.1 },
  farDistance: { type: Types.Number, default: 5 },
};
