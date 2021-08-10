import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { GameObjectInteractionSchema } from '../interfaces/GameObjectPrefab'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export type GameObjectType = {
  gameName: string
  role: string
  uuid: string
  collisionBehaviors: GameObjectInteractionSchema
}

export const GameObject = createMappedComponent<GameObjectType>()
