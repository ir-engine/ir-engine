import { Quaternion } from 'three'
import { teleportPlayer } from '../../../../character/prefabs/NetworkPlayerCharacter'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const teleportPlayerBehavior: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.warn('Teleport Player', args)
  teleportPlayer(entity, args.position, new Quaternion())
}
