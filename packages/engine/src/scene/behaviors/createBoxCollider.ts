import { Behavior } from '../../common/interfaces/Behavior';
import { addColliderWithoutEntity } from '../../physics/behaviors/addColliderWithoutEntity';

export const createBoxColliderObject: Behavior = (entity, args: any) => {
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
