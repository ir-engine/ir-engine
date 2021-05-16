import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { getStorage } from '../../../../game/functions/functionsStorage';
import { Checker } from '../../../../game/types/Checker';
import { getTargetEntity } from '../../../../game/functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const customChecker: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any => {
  const entityArg = getTargetEntity(entity, entityTarget, args);

  if (Array.isArray(entityArg))  {
    return entityArg.some(entityFinded => {

      if (args.watchers != undefined) {
         if(args.watchers.some( componentArr => componentArr.every( component => hasComponent(entityFinded, component))) ) {} else { return false };
      }

      if (args.checkers != undefined) {
         if(args.checkers.every(checker => checker.function(entityFinded, checker.args, undefined)) ) {} else { return false };
      }

      return true;
    })
  } else if (entityArg != undefined) {
    // TO DO: for arg.on = 'me' or 'target'
    return false
  }
};
