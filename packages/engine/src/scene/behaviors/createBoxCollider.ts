import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, createEntity, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { RigidBody } from '../../physics/components/RigidBody';
import { addColliderWithoutEntity } from '../../physics/behaviors/addColliderWithoutEntity';

export const createBoxCollider: Behavior = (entity, args: any) => {
  console.log('****** Collider from Scene data, type: '+args.objArgs.type);
  console.log(args.objArgs);

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
