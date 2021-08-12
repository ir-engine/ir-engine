import { Vector3 } from 'three'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Network } from '../../../../networking/classes/Network'
import { NetworkObjectComponentOwner } from '../../../../networking/components/NetworkObjectComponentOwner'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGame } from '../../../functions/functions'
import { getStorage, setStorage } from '../../../functions/functionsStorage'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const getPositionNextPoint = (entity, positionCopyFromRole: any) => {
  // work with playerEntity but if you give game object will searsh playerEntity from owned component
  const ownerEntity = hasComponent(entity, GamePlayer)
    ? entity
    : Network.instance.networkObjects[getComponent(entity, NetworkObjectComponentOwner).networkId]?.entity
  const gameScore = getStorage(ownerEntity, { name: 'GameScore' })
  const game = getGame(entity)

  const teeEntity = game.gameObjects[positionCopyFromRole + gameScore.score.goal][0]

  if (teeEntity) {
    const teeTransform = getComponent(teeEntity, TransformComponent)
    return teeTransform.position
  } else {
    // do loop holes and re-start score on last goal
    // its just becouse we will have finish 3d UI
    const firstTeeEntity = game.gameObjects[positionCopyFromRole + 0][0]
    if (firstTeeEntity) {
      const teeTransform = getComponent(firstTeeEntity, TransformComponent)

      gameScore.score.hits = 0
      gameScore.score.goal = 0

      setStorage(ownerEntity, { name: 'GameScore' }, gameScore)
      return teeTransform.position
    }
    //
  }
  console.warn('Cant find Tee to teleport on', gameScore)
  return new Vector3(0, 10, 0)
}
