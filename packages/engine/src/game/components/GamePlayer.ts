import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

type OwnedObjects = {
  [role: string]: Entity
}

export type GamePlayerType = {
  gameName: string
  role: string
  uuid: string
  ownedObjects: OwnedObjects
}

export const GamePlayer = createMappedComponent<GamePlayerType>()
