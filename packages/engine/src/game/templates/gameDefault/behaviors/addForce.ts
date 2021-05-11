import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';


/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addForce: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const collider = getComponent(entity, ColliderComponent);
  collider.applyForce(new Vector3(0,0,1), new Vector3(0,0,args.force));
};
