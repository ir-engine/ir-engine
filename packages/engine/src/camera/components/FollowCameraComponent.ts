import { Vector3 } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { CameraModes } from '../types/CameraModes';

/** The component is added to any entity and hangs the camera watching it. */
export class FollowCameraComponent extends Component<FollowCameraComponent> {
  /** * **Default** value is ```'thirdPerson'```. */
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
  offset: Vector3
  theta: number
  phi: number
  shoulderSide: boolean
}

FollowCameraComponent._schema = {
  mode: { type: Types.String, default: CameraModes.ThirdPerson },
  distance: { type: Types.Number, default: 3 },
  minDistance: { type: Types.Number, default: 1 },
  maxDistance: { type: Types.Number, default: 10 },
  raycastBoxOn: { type: Types.Boolean, default: true },
  rx1: { type: Types.Number, default: -0.1 },
  ry1: { type: Types.Number, default: -0.1 },
  rx2: { type: Types.Number, default: 0.1 },
  ry2: { type: Types.Number, default: 0.1 },
  farDistance: { type: Types.Number, default: 5 },
  offset: { type: Types.Vector3Type, default: new Vector3(0, 1, 0) },
  theta: { type: Types.Number, default: 0 },
  phi: { type: Types.Number, default: 0 },
  shoulderSide: { type: Types.Boolean, default: true },
};
