import { Behavior } from '../../common/interfaces/Behavior';
import { addColliderWithoutEntity } from '../../physics/behaviors/addColliderWithoutEntity';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const createBoxColliderObject: Behavior = (entity, args: any) => {
  // console.log('****** Collider from Scene data, type: '+args.objArgs.type);
  addColliderWithoutEntity(
    {type:args.objArgs.type},
    args.objArgs.position,
    args.objArgs.quaternion,
    args.objArgs.scale,
    {
      mesh: args.objArgs.mesh,
      vertices:  args.objArgs.vertices,
      indices:   args.objArgs.indices
    }
  );
};
