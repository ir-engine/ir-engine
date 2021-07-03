/** This Module contains function to perform different operations on 
 *    {@link https://threejs.org/docs/#api/en/core/Object3D | Object3D } from three.js library. 
 *     @packageDocumentation
 * */

import { Quaternion, Vector3 } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { addColliderWithoutEntity } from '../../physics/behaviors/colliderCreateFunctions';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const createBoxCollider: Behavior = (entity, args: BoxColliderProps) => {
  // console.log('createBoxCollider', args)
  addColliderWithoutEntity(
    { type: 'box', action: args.action, link: args.link, isTrigger: args.isTrigger },
    args.position,
    args.quaternion,
    args.scale,
    {
      collisionLayer: args.collisionLayer,
      collisionMask: args.collisionMask
    },
  );
};

export interface BoxColliderProps {
  position: Vector3,
  quaternion: Quaternion,
  scale: Vector3,
  isTrigger: boolean,
  action : string,
  link : string,
  collisionLayer:string | number,
  collisionMask : string | number
}
