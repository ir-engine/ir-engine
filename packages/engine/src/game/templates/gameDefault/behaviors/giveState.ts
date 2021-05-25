import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { addStateComponent } from '../../../../game/functions/functionsState';
import { getTargetEntity } from '../../../functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */


export const giveState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const entityArg = getTargetEntity(entity, entityTarget, args);
  addStateComponent(entityArg, args.component);
}
