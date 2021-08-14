import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../types/Checker'
import { VelocityComponent } from '../../../../physics/components/VelocityComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

type VelocityCheckArgs = {
  more: number
  less: number
}

export const ifVelocity: Checker = (entity: Entity, args: VelocityCheckArgs): any | undefined => {
  const velocity = getComponent(entity, VelocityComponent)

  const velocityMagnitude = velocity.velocity.length()

  if (args.more && args.less) {
    return velocityMagnitude >= args.more && velocityMagnitude <= args.less
  }
  return (args.more && velocityMagnitude > args.more) || (args.less && velocityMagnitude < args.less)
}
