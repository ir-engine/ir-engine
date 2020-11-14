import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from '../../physics/components/ColliderComponent';

export const createBoxCollider: Behavior = (entity, args: any) => {
   addComponent(entity, ColliderComponent, args.objArgs);
};
