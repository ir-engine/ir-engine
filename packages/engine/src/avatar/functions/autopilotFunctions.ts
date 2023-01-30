import { Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'

export const autopilotGetPosition = (entity: Entity): Vector3 | undefined => {
  const physicsWorld = Engine.instance.currentWorld.physicsWorld
  const world = Engine.instance.currentWorld
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, CollisionGroups.Ground)
  const raycastArgs = {
    type: SceneQueryType.Closest,
    origin: new Vector3(),
    direction: new Vector3(),
    maxDistance: 20,
    groups: interactionGroups
  } as RaycastArgs

  const castedRay = Physics.castRayFromCamera(world.camera, world.pointerState.position, physicsWorld, raycastArgs)

  if (castedRay.length) {
    return castedRay[0].position as Vector3
  }
  return undefined
}
