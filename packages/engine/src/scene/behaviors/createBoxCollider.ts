import { Behavior } from '../../common/interfaces/Behavior';
import { addColliderWithoutEntity } from '../../physics/behaviors/colliderCreateFunctions';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const createBoxCollider: Behavior = (entity, args: any) => {
  addColliderWithoutEntity(
    { type:args.type },
    args.position,
    args.quaternion,
    args.scale,
    {
      mesh: args.mesh,
      vertices: args.vertices,
      indices: args.indices,
      collisionLayer: args.collisionLayer,
      collisionMask: args.collisionMask
    },
  );
};
