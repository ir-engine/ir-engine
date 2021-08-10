import { Entity } from '../../../../ecs/classes/Entity'
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage'

//import { ColliderComponent } from '../../../../physics/components/ColliderComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const saveScore = (entity: Entity): void => {
  console.warn('SAVE Score')
  const gameScore = getStorage(entity, { name: 'GameScore' })
  gameScore.score.hits += 1
  setStorage(entity, { name: 'GameScore' }, gameScore)
  console.warn(gameScore)
}
