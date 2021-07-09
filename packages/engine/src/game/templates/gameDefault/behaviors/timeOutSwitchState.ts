import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState'
import { getTargetEntity } from '../../../functions/functions'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const timeOutSwitchState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const entityArg = getTargetEntity(entity, entityTarget, args)

  setTimeout(() => {
    if (hasComponent(entityArg, args.remove)) {
      removeStateComponent(entityArg, args.remove)
      addStateComponent(entityArg, args.add)
    }
  }, args.time)
}
