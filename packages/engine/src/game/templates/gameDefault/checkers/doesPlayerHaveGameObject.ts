import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../../game/types/Checker'
import { GamePlayer } from '../../../../game/components/GamePlayer'
import { GameObject } from '../../../../game/components/GameObject'
import { NetworkObject } from '../../../../networking/components/NetworkObject'
import { getGame, getTargetEntity, getUuid } from '../../../../game/functions/functions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const doesPlayerHaveGameObject: Checker = (
  entity: Entity,
  args?: any,
  entityTarget?: Entity
): any | undefined => {
  // its work invers, true if dont have
  const game = getGame(entity)
  const ownerId = getUuid(entity)

  let answer

  if (game.gameObjects[args.objectRoleName].length === 0) {
    answer = false
  }

  if (
    game.gameObjects[args.objectRoleName].filter((entity) => getComponent(entity, NetworkObject)?.ownerId === ownerId)
      .length > 0
  ) {
    answer = true
  }
  if (args.invert ? !answer : answer) {
    // console.warn('doesPlayerHaveGameObject === true')
  }

  return args.invert ? !answer : answer
}
