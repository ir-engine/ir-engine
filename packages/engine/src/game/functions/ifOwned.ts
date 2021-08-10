import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Checker } from '../types/Checker'
import { GamePlayer } from '../components/GamePlayer'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifOwned: Checker = (entity: Entity, entityTarget?: Entity): any | undefined => {
  if (hasComponent(entity, GamePlayer)) {
    return getComponent(entity, GamePlayer).uuid == getComponent(entityTarget, NetworkObjectComponent).ownerId
  } else {
    return (
      getComponent(entity, NetworkObjectComponent).ownerId == getComponent(entityTarget, NetworkObjectComponent).ownerId
    )
  }
}
