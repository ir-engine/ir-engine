import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../types/Checker'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { getStorage } from '../../../functions/functionsStorage'
import { GolfBallComponent } from '../components/GolfBallComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifOutCourse: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  const golfBallComponent = getComponent(entity, GolfBallComponent)
  if (!golfBallComponent.groundRaycast) return

  console.log('OUT OF COURSE', golfBallComponent.groundRaycast.hits[0])
  return typeof golfBallComponent.groundRaycast.hits[0] === 'undefined'
}

export const ifFirstHit: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  const gameScore = getStorage(entity, { name: 'GameScore' })
  return gameScore.score.hits === 0
}
