import { Quaternion, Vector3 } from "three";
import type { Body, ColliderHitEvent } from "three-physx";
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class ColliderComponent extends Component<ColliderComponent> {
  bodytype: any
  body: Body
  type: string
  mass: number
  position: Vector3 = new Vector3()
  /**
   * The velocity as calculated by either the physics engine or the physics system for manually inteprolated objects
   */
  velocity: Vector3 = new Vector3()
  quaternion: Quaternion  = new Quaternion()
  scale: Vector3 = new Vector3()
  mesh: any
  vertices: any
  indices: any
  collisionLayer: any
  collisionMask: any
}

ColliderComponent._schema = {
  bodytype: { type: Types.Ref, default: null },
  body: { type: Types.Ref, default: null },
  type: { type: Types.String, default: 'box' },
  mass: { type: Types.Number, default: 0 },
  position: { type: Types.Ref, default: null },
  velocity: { type: Types.Ref, default: null },
  quaternion: { type: Types.Ref, default: null },
  scale: { type: Types.Ref, default: null },
  mesh: { type: Types.Ref, default: null},
  vertices: { type: Types.Ref, default: null},
  indices: { type: Types.Ref, default: null},
  collisionLayer: { type: Types.Number, default: null },
  collisionMask: { type: Types.Number, default: -1 }
};
