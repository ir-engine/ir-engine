import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

/** The component is added to any entity and hangs the camera watching it. */
export class FollowCameraComponent extends Component<FollowCameraComponent> {
  /** * **Default** value is ```'thirdPersonLocked'```. */
  mode: string
  /** * **Default** value is 3. */
  distance: number
  /** * **Default** value is 2. */
  minDistance: number
  /** * **Default** value is 7. */
  maxDistance: number
  /** * **Default** value is ```true```. */
  raycastBoxOn: boolean
  /**
   * First right x point of screen, two-dimensional square on the screen, hitting which the interactive objects are highlighted.\
   * **Default** value is -0.1.
   */
  rx1: number
  /** First right y point of screen. **Default** value is -0.1. */
  ry1: number
  /** Second right x point of screen. **Default** value is 0.1. */
  rx2: number
  /** Second right y point of screen. **Default** value is 0.1. */
  ry2: number
  /** Distance to which interactive objects from the camera will be highlighted. **Default** value is 5. */
  farDistance: number
}

FollowCameraComponent._schema = {
  mode: { type: Types.String, default: 'thirdPersonLocked' },
  distance: { type: Types.Number, default: 3 },
  minDistance: { type: Types.Number, default: 2 },
  maxDistance: { type: Types.Number, default: 7 },
  raycastBoxOn: { type: Types.Boolean, default: true },
  rx1: { type: Types.Number, default: -0.1 },
  ry1: { type: Types.Number, default: -0.1 },
  rx2: { type: Types.Number, default: 0.1 },
  ry2: { type: Types.Number, default: 0.1 },
  farDistance: { type: Types.Number, default: 5 },
};
