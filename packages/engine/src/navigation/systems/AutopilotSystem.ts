import { identity } from 'lodash'
import { Vector3 } from 'three'
import { Path } from 'yuka'

import { AvatarSettings } from '../../avatar/AvatarControllerSystem'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { findClosestProjectedPoint } from '../functions/findProjectedPoint'
import { getMovementDirection } from '../functions/inputFunctions'
import { updatePath } from '../functions/pathFunctions'

/** Distance from target point that is close enough to stop, in meters */
const THRESHOLD_ARRIVE = 0.44
const THRESHOLD_ARRIVED_SQUARED = THRESHOLD_ARRIVE * THRESHOLD_ARRIVE
/** Distance from target point that is close enough to start slowing down, in meters */
const THRESHOLD_ARRIVING = 6
const THRESHOLD_ARRIVING_SQUARED = THRESHOLD_ARRIVING * THRESHOLD_ARRIVING
/** m/s/s */
const ACCELERATION = 0.04
const INITIAL_SPEED = AvatarSettings.instance.walkSpeed / 4
const MIN_SPEED = INITIAL_SPEED
/** Current run speed seems rather Usain Bolt */
const MAX_SPEED = AvatarSettings.instance.runSpeed / 4

export default async function AutopilotSystem(world: World) {
  const navmeshesQuery = defineQuery([NavMeshComponent, Object3DComponent])
  const requestsQuery = defineQuery([AutoPilotRequestComponent])
  const autopilotQuery = defineQuery([AutoPilotComponent])

  return () => {
    // if(!isClient) return
    const entsWithNavMesh = navmeshesQuery()

    const surfaces = entsWithNavMesh
      .map((navMeshEntity) => getComponent(navMeshEntity, Object3DComponent).value)
      .filter(identity)

    for (const avatarEntity of requestsQuery.enter()) {
      const { unprojectedPoint } = getComponent(avatarEntity, AutoPilotRequestComponent)

      const [goalPoint, closestNavMeshIndex] = findClosestProjectedPoint(
        Engine.instance.currentWorld.camera,
        surfaces,
        unprojectedPoint
      )

      if (goalPoint) {
        const closestNavMeshEntity = entsWithNavMesh[closestNavMeshIndex]
        const avatarPosition = getComponent(avatarEntity, TransformComponent).position

        removeComponent(avatarEntity, AutoPilotComponent)
        addComponent(avatarEntity, AutoPilotComponent, {
          // TODO do we need goalPoint to be a property?
          endPoint: goalPoint,
          path: new Path(),
          speed: INITIAL_SPEED,
          maxSpeed: MAX_SPEED,
          minSpeed: MIN_SPEED
        })

        updatePath(
          getComponent(avatarEntity, AutoPilotComponent).path,
          getComponent(closestNavMeshEntity, NavMeshComponent).value,
          avatarPosition,
          goalPoint
        )
      }

      removeComponent(avatarEntity, AutoPilotRequestComponent)
    }

    const allOngoing = autopilotQuery(world)
    for (const avatarEntity of allOngoing) {
      const avatarPosition = getComponent(avatarEntity, TransformComponent).position
      const path = getComponent(avatarEntity, AutoPilotComponent).path
      // Assume avatar is already standing at start of path
      path.advance()

      const nextPoint = path.current() as unknown as Vector3
      const distanceSquared = avatarPosition.distanceToSquared(nextPoint)
      if (!avatarPosition || !nextPoint) debugger
      const autoPilot = getComponent(avatarEntity, AutoPilotComponent)
      const movement = getComponent(avatarEntity, AvatarControllerComponent).localMovementDirection

      if (path.finished() && distanceSquared < THRESHOLD_ARRIVED_SQUARED) {
        removeComponent(avatarEntity, AutoPilotComponent)
        movement.multiplyScalar(0)
        autoPilot.speed = INITIAL_SPEED
      } else {
        if (distanceSquared < THRESHOLD_ARRIVING_SQUARED) {
          autoPilot.speed = Math.max(autoPilot.minSpeed, autoPilot.speed * 0.9)
        } else {
          autoPilot.speed = Math.min(autoPilot.maxSpeed, autoPilot.speed + ACCELERATION)
        }
        movement.copy(getMovementDirection(nextPoint, avatarPosition)).multiplyScalar(autoPilot.speed)
      }
    }
  }
}
