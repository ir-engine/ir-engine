import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { getTargetEntity } from '../../../../game/functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */

 export const switchState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
   const entityArg = getTargetEntity(entity, entityTarget, args);
   if (hasComponent(entityArg, args.remove)) {
     removeStateComponent(entityArg, args.remove);
     addStateComponent(entityArg, args.add);
   }
 };
