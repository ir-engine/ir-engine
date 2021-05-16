import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getTargetEntity } from '../../../functions/functions';
import { addActionComponent } from '../../../functions/functionsActions';
/**
 * @author HydraFire <github.com/HydraFire>
 */


export const giveAction: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const entityArg = getTargetEntity(entity, entityTarget, args);
  addActionComponent(entityArg, args.action);
}
