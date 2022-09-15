import { identity, noop } from 'lodash'
import { MathUtils } from 'three'
import invariant from 'tiny-invariant'

import multiLogger from '@xrengine/common/src/logger'

import { AvatarControllerComponent } from '../avatar/components/AvatarControllerComponent'
import { buildState, State } from '../common/functions/EntityStateMachineFunctions'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent } from '../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../scene/components/NavMeshComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AutoPilotComponent } from './component/AutoPilotComponent'
import { AutoPilotRequestComponent } from './component/AutoPilotRequestComponent'
import { ACCELERATION, THRESHOLD_ARRIVING_FACTOR, THRESHOLD_TURN_FACTOR } from './constants'
import { getCurrentWaypoint, hasMoreWaypoints, isCloseEnoughToCurrentWaypoint } from './functions/EntityFunctions'
import { debugvec } from './functions/HelperFunctions'
import { getMovementDirection } from './functions/MathFunctions'
import { findLengthSquared, updatePath } from './functions/PathFunctions'
import { findFirstIntersection } from './functions/RaycastingFunctions'

export const AtRestState: State = buildState('At Rest', noop, enterState_AtRest)
  .addTransition({
    description: 'agent has received find path request',
    getState: () => FindPathState,
    test: (entity) => hasComponent(entity, AutoPilotRequestComponent)
  })
  .completeBuild()

const FindPathState: State = buildState('Find Path', executeState_FindPath)
  .addTransition({
    description: 'find path request has been handled',
    getState: () => FollowPathState,
    test: (entity) => !hasComponent(entity, AutoPilotRequestComponent)
  })
  .completeBuild()

const FollowPathState: State = buildState('Follow Path', executeState_FollowPath)
  .addTransition({
    description: 'agent is close enough to current waypoint',
    getState: () => NextWaypointState,
    test: (entity) => isCloseEnoughToCurrentWaypoint(entity)
  })
  .completeBuild()

const NextWaypointState: State = buildState('Next Waypoint', noop, enterState_NextWaypoint)
  .addTransition({
    description: "there's more waypoints",
    getState: () => FollowPathState,
    test: (entity) => hasMoreWaypoints(entity)
  })
  .addTransition({
    description: 'agent is close enough to last waypoint',
    getState: () => AtRestState,
    test: (entity) => isCloseEnoughToCurrentWaypoint(entity)
  })
  .addTransition({
    description: 'not quite there yet',
    getState: () => FollowPathState,
    test: (_entity) => true
  })
  .completeBuild()

export function executeState_FindPath(entity: Entity) {
  const request = getComponent(entity, AutoPilotRequestComponent)
  invariant(!!request, 'no existing autoPilot request component')
  const autoPilot = getComponent(entity, AutoPilotComponent)
  invariant(!!autoPilot, 'no existing autoPilot component')
  invariant(hasComponent(entity, TransformComponent), 'no existing TransformComponent')

  const surfaces = autoPilot.navMeshEntities
    .map((navMeshEntity) => getComponent(navMeshEntity, Object3DComponent).value)
    .filter(identity)

  invariant(surfaces.length > 0, 'no Object3DComponents for given NavMesh entities')

  const [goalPoint, closestNavMeshIndex] = findFirstIntersection(
    Engine.instance.currentWorld.camera,
    surfaces,
    request.unprojectedPoint
  )

  autoPilot.closestNavMeshIndex = closestNavMeshIndex

  if (goalPoint) {
    const closestNavMeshEntity = autoPilot.navMeshEntities[closestNavMeshIndex]
    const avatarPosition = getComponent(entity, TransformComponent).position

    updatePath(autoPilot.path, getComponent(closestNavMeshEntity, NavMeshComponent).value, avatarPosition, goalPoint)
    removeComponent(entity, AutoPilotRequestComponent)
  }
}

export function executeState_FollowPath(entity: Entity) {
  invariant(hasComponent(entity, TransformComponent), 'no existing TransformComponent')
  const position = getComponent(entity, TransformComponent).position
  const autoPilot = getComponent(entity, AutoPilotComponent)
  invariant(!!autoPilot, 'no existing AutoPilotComponent')
  const currentWayPoint = getCurrentWaypoint(entity)
  const controller = getComponent(entity, AvatarControllerComponent)
  invariant(!!controller, 'no existing AvatarControllerComponent')
  const movement = controller.localMovementDirection

  const distanceSquaredNextPoint = position.distanceToSquared(currentWayPoint)
  const distanceSquaredTotal = findLengthSquared([...autoPilot.path], autoPilot.pathIndex)

  if (
    distanceSquaredTotal < THRESHOLD_ARRIVING_FACTOR * autoPilot.speed ||
    distanceSquaredNextPoint < THRESHOLD_TURN_FACTOR * autoPilot.speed
  ) {
    autoPilot.speed -= ACCELERATION
  } else {
    autoPilot.speed += ACCELERATION
  }
  autoPilot.speed = MathUtils.clamp(autoPilot.speed, autoPilot.minSpeed, autoPilot.maxSpeed)

  const direction = getMovementDirection(currentWayPoint, position)
  multiLogger.debug(
    'TO CURRENT WAYPOINT',
    ...debugvec(direction),
    '\nWAYPOINTS REMAINING',
    autoPilot.path.length - autoPilot.pathIndex
  )

  movement.copy(direction).multiplyScalar(autoPilot.speed)
  controller.movementMode = 'absolute'
}

export function enterState_NextWaypoint(entity: Entity) {
  const autoPilot = getComponent(entity, AutoPilotComponent)
  invariant(!!autoPilot, 'no existing AutoPilotComponent')
  if (autoPilot.pathIndex < autoPilot.path.length) {
    autoPilot.pathIndex++
  }
  multiLogger.debug('NEW WAYPOINT INDEX', autoPilot.pathIndex)
}

export function enterState_AtRest(entity: Entity) {
  const controller = getComponent(entity, AvatarControllerComponent)
  invariant(!!controller, 'no existing AvatarControllerComponent')
  const movement = controller.localMovementDirection

  movement.multiplyScalar(0)
  controller.movementMode = 'relative'
  // Prevent avatar from twirling or overstepping the target point
  controller.velocitySimulator.init()
}
