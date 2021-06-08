import { Behavior } from '../../common/interfaces/Behavior';
import { addColliderWithoutEntity } from '../../physics/behaviors/colliderCreateFunctions';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const createBoxCollider: Behavior = (entity, args: any) => {
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
