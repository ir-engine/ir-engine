import { identity } from 'lodash'
import { MathUtils } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { AvatarSettings } from '../../avatar/AvatarControllerSystem'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { DebugAutoPilotComponent } from '../../debug/DebugAutoPilotComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { EngineRendererAction } from '../../renderer/EngineRendererState'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { findClosestProjectedPoint } from '../functions/findProjectedPoint'
import { findLengthSquared, updatePath } from '../functions/pathFunctions'
import { getMovementDirection } from '../functions/vectorFunctions'

/** Distance from target point that is close enough to stop */
const THRESHOLD_ARRIVE = 0.2
const THRESHOLD_ARRIVED_SQUARED = THRESHOLD_ARRIVE * THRESHOLD_ARRIVE
/** Distance from target point that is close enough to start slowing down, as factor of avatar speed */
const THRESHOLD_ARRIVING_FACTOR = 12
/** Slowing down around turns prevents orbiting behavior */
const THRESHOLD_TURN_FACTOR = 6
const ACCELERATION = 0.04
const INITIAL_SPEED = AvatarSettings.instance.walkSpeed / 4
const MIN_SPEED = INITIAL_SPEED
/** Current run speed seems rather Usain Bolt */
const MAX_SPEED = AvatarSettings.instance.runSpeed / 6

export default async function AutopilotSystem(world: World) {
  const navmeshesQuery = defineQuery([NavMeshComponent, Object3DComponent])
  const requestsQuery = defineQuery([AutoPilotRequestComponent])
  const autopilotQuery = defineQuery([AutoPilotComponent])
  const getDebugActionQueue = createActionQueue(EngineRendererAction.setNavigationDebug.matches)

  let debugMode = false
  let wasDebugMode = false

  return () => {
    const entsWithNavMesh = navmeshesQuery()
    const debugActions = getDebugActionQueue()
    wasDebugMode = debugMode
    debugMode = debugActions.length > 0 ? debugActions[debugActions.length - 1].navigationDebugEnable : debugMode
    const debugInfo = debugMode ? { polygonPath: [] } : null

    const surfaces = entsWithNavMesh
      .map((navMeshEntity) => getComponent(navMeshEntity, Object3DComponent).value)
      .filter(identity)

    if (debugMode && !wasDebugMode) {
      for (let ent of entsWithNavMesh) {
        addComponent(ent, DebugNavMeshComponent, {})
      }
    }
    if (!debugMode && wasDebugMode) {
      for (let ent of entsWithNavMesh) {
        removeComponent(ent, DebugNavMeshComponent)
      }
    }

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
          path: [],
          pathIndex: 0,
          speed: INITIAL_SPEED,
          maxSpeed: MAX_SPEED,
          minSpeed: MIN_SPEED
        })

        updatePath(
          getComponent(avatarEntity, AutoPilotComponent).path,
          getComponent(closestNavMeshEntity, NavMeshComponent).value,
          avatarPosition,
          goalPoint,
          debugInfo
        )

        if (debugMode) {
          removeComponent(avatarEntity, DebugAutoPilotComponent)
          addComponent(avatarEntity, DebugAutoPilotComponent, {
            navMeshEntity: closestNavMeshEntity,
            polygonPath: debugInfo!.polygonPath
          })
        }
      }

      removeComponent(avatarEntity, AutoPilotRequestComponent)
    }

    const allOngoing = autopilotQuery(world)
    for (const avatarEntity of allOngoing) {
      const avatarPosition = getComponent(avatarEntity, TransformComponent).position
      const autoPilot = getComponent(avatarEntity, AutoPilotComponent)
      const path = autoPilot.path
      const nextPoint = path[autoPilot.pathIndex]
      const distanceSquaredNextPoint = avatarPosition.distanceToSquared(nextPoint)
      const distanceSquaredTotal = findLengthSquared(autoPilot.path, autoPilot.pathIndex)
      const controller = getComponent(avatarEntity, AvatarControllerComponent)
      const movement = controller.localMovementDirection

      if (autoPilot.pathIndex >= path.length - 1 && distanceSquaredNextPoint < THRESHOLD_ARRIVED_SQUARED) {
        removeComponent(avatarEntity, AutoPilotComponent)
        movement.multiplyScalar(0)
        autoPilot.speed = INITIAL_SPEED
        controller.movementMode = 'relative'
        // Prevent avatar from twirling or overstepping the target point
        controller.velocitySimulator.init()
      } else {
        if (distanceSquaredNextPoint < THRESHOLD_ARRIVED_SQUARED) {
          autoPilot.pathIndex++
        }
        if (
          distanceSquaredTotal < THRESHOLD_ARRIVING_FACTOR * autoPilot.speed ||
          distanceSquaredNextPoint < THRESHOLD_TURN_FACTOR * autoPilot.speed
        ) {
          autoPilot.speed = MathUtils.clamp(autoPilot.speed - ACCELERATION, autoPilot.minSpeed, autoPilot.maxSpeed)
        } else {
          autoPilot.speed = MathUtils.clamp(autoPilot.speed + ACCELERATION, autoPilot.minSpeed, autoPilot.maxSpeed)
        }
        movement.copy(getMovementDirection(nextPoint, avatarPosition)).multiplyScalar(autoPilot.speed)
        controller.movementMode = 'absolute'
      }
    }
  }
}
