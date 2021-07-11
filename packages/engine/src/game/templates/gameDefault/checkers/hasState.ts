import { Entity } from '../../../../ecs/classes/Entity'
import { hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../types/Checker'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const hasState: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  return hasComponent(entity, args.stateComponent)
}
