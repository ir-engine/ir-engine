import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../types/Checker'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { getTargetEntity } from '../../../functions/functions'
import { GolfClubComponent } from '../../Golf/components/GolfClubComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifVelocity: Checker = (entity: Entity, args?: any): any | undefined => {
  const fromComponent = args.component ?? ColliderComponent

  if (hasComponent(entity, fromComponent)) {
    const collider: ColliderComponent | GolfClubComponent = getComponent(entity, fromComponent)

    const velocity = collider.velocity.length()
    // console.log(velocity)
    if (args.more && args.less) {
      return velocity >= args.more && velocity <= args.less
    }
    return (args.more && velocity >= args.more) || (args.less && velocity <= args.less)
  }
  return false
}
