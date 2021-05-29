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
  position: Vector3
  quaternion: Quaternion
  scale: Vector3
  mesh: any
  vertices: any
  indices: any
  collisionLayer: any
  collisionMask: any
  collisions: ColliderHitEvent[] = [];
}

ColliderComponent._schema = {
  bodytype: { type: Types.Ref, default: null },
  body: { type: Types.Ref, default: null },
  type: { type: Types.String, default: 'box' },
  mass: { type: Types.Number, default: 0 },
  position: { type: Types.Ref, default: new Vector3() },
  quaternion: { type: Types.Ref, default: new Quaternion() },
  scale: { type: Types.Ref, default: new Vector3() },
  mesh: { type: Types.Ref, default: null},
  vertices: { type: Types.Ref, default: null},
  indices: { type: Types.Ref, default: null},
  collisionLayer: { type: Types.Number, default: null },
  collisionMask: { type: Types.Number, default: -1 }
};
