import { Entity } from '../../../../ecs/classes/Entity';
import { hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { getTargetEntitys } from '../../../../game/functions/functions';

/**
 * @author HydraFire <github.com/HydraFire>
 */
export const customChecker: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any => {
  const entityArg = getTargetEntitys(entity, entityTarget, args);

  if (Array.isArray(entityArg)) {
    return entityArg.some(entityFinded => {

      if (args.watchers != undefined) {
         if(args.watchers.some( componentArr => componentArr.every( component => hasComponent(entityFinded, component))) ) {} else { return false }
      }

      if (args.checkers != undefined) {
         if(args.checkers.every(checker => checker.function(entityFinded, checker.args, entityTarget)) ) {} else { return false }
      }

      return true;
    })
  } else if (entityArg != undefined) {
    // TO DO: for arg.on = 'self' or 'target'
    return false
  }
};
