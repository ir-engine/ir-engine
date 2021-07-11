import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const executeBehaviorArray = (args): any => {
  return (entity: Entity, args?: any, delta?: number, entityOther?: Entity, time?: number, checks?: any) => {
    args.forEach((behavior) => behavior(entity, args, delta, entityOther, time, checks))
  }
}
