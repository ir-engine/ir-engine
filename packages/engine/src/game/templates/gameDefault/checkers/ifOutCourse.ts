import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { Checker } from '../../../types/Checker'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { getTargetEntity } from '../../../functions/functions'
import { GolfClubComponent } from '../../Golf/components/GolfClubComponent'
import { getStorage } from '../../../functions/functionsStorage'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifOutCourse: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  //  const entityArg = getTargetEntity(entity, entityTarget, args);
  // const fromComponent  = args.component ?? ColliderComponent;

  if (hasComponent(entity, ColliderComponent)) {
    const collider = getComponent(entity, ColliderComponent) as ColliderComponent
    const ballPosition = collider.body.transform.translation
    collider.raycastQuery.origin.copy(ballPosition)

    //  console.warn(collider.raycastQuery.hits[0]?.distance, collider.raycastQuery.hits[0]?.distance === undefined);

    // GolfCollisionGroups.Course
    return collider.raycastQuery.hits[0]?.distance === undefined
  }
  return false
}

export const ifFirstHit: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  const gameScore = getStorage(entity, { name: 'GameScore' })
  return gameScore.score.hits === 0
}
