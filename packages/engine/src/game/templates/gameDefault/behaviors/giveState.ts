import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getTargetEntity } from '../../../functions/functions';
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
/**
 * @author HydraFire <github.com/HydraFire>
 */


export const giveState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const entityArg = getTargetEntity(entity, entityTarget, args);
  addStateComponent(entityArg, args.component);
}
