import { Vector3 } from 'three'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGame, getTargetEntity } from '../../../functions/functions'
import { removeStateComponent } from '../../../functions/functionsState'
import { getStorage, setStorage } from '../../../functions/functionsStorage'
import { State } from '../../../types/GameComponents'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const getPositionNextPoint = (entity: Entity, args?: any, entityTarget?: Entity) => {
  let gameScore = null
  if (hasComponent(entity, GamePlayer)) {
    gameScore = getStorage(entity, { name: 'GameScore' })
  } else if (hasComponent(entityTarget, GamePlayer)) {
    gameScore = getStorage(entityTarget, { name: 'GameScore' })
  }

  const game = getGame(entity)
  console.warn(args.positionCopyFromRole + gameScore.score.goal)
  const teeEntity = game.gameObjects[args.positionCopyFromRole + gameScore.score.goal][0]
  if (teeEntity) {
    const teeTransform = getComponent(teeEntity, TransformComponent)
    args.position = teeTransform.position
    return args
  } else {
    // do loop holes and re-start score on last goal
    // its just becouse we will have finish 3d UI
    const firstTeeEntity = game.gameObjects[args.positionCopyFromRole + 0][0]
    if (firstTeeEntity) {
      const teeTransform = getComponent(firstTeeEntity, TransformComponent)
      args.position = teeTransform.position

      gameScore.score.hits = 0
      gameScore.score.goal = 0

      if (hasComponent(entity, GamePlayer)) {
        setStorage(entity, { name: 'GameScore' }, gameScore)
      } else if (hasComponent(entityTarget, GamePlayer)) {
        setStorage(entityTarget, { name: 'GameScore' }, gameScore)
      }
      return args
    }
    //
  }
  args.position = new Vector3()
  return args
}
