import { Vector3 } from 'three'
import { RaycastQuery, SceneQueryType } from 'three-physx'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../../../physics/enums/CollisionGroups'
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { GolfCollisionGroups } from '../GolfGameConstants'

/**
 * @author HydraFire <github.com/HydraFire>
 */

const vector0 = new Vector3()
const vector1 = new Vector3()

export const initBallRaycast: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityOther?: Entity,
  time?: number,
  checks?: any
): void => {}
