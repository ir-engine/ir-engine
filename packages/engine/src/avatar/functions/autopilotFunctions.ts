import { Vector3 } from 'three'

import { V_010 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'

const interactionGroups = getInteractionGroups(
  CollisionGroups.Avatars,
  CollisionGroups.Ground | CollisionGroups.Default
)
const raycastArgs = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 20,
  groups: interactionGroups
} as RaycastArgs

export const autopilotGetPosition = (entity: Entity): Vector3 | undefined => {
  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const world = Engine.instance.currentWorld

  const castedRay = Physics.castRayFromCamera(world.camera, world.pointerState.position, physicsWorld, raycastArgs)
  if (!castedRay.length || !assessWalkability(entity, castedRay[0])) return undefined
  return castedRay[0].position as Vector3
}

const minDot = 0.45
export const assessWalkability = (entity: Entity, castedRay: RaycastHit): boolean => {
  const normal = new Vector3(castedRay.normal.x, castedRay.normal.y, castedRay.normal.z)
  const flatEnough = normal.dot(V_010) > minDot
  return flatEnough
}
