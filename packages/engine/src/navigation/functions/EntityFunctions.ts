import { Vector3 } from 'three'
import invariant from 'tiny-invariant'

import multiLogger from '@xrengine/common/src/logger'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { THRESHOLD_ARRIVED_SQUARED } from '../constants'
import { roundmap } from './HelperFunctions'

// TODO test

export function getCurrentWaypoint(entity: Entity): Vector3 {
  const autoPilot = getComponent(entity, AutoPilotComponent)
  invariant(!!autoPilot, 'no existing autoPilot component')
  const { path, pathIndex } = autoPilot

  return pathIndex < path.length ? path[pathIndex] : path[path.length - 1]
}

export function isCloseEnoughToCurrentWaypoint(entity: Entity): boolean {
  const position = getComponent(entity, TransformComponent).position
  invariant(!!position, 'no existing transform component')
  const currentWayPoint = getCurrentWaypoint(entity)
  const distanceSquared = position.distanceToSquared(currentWayPoint)

  multiLogger.debug(
    'WAYPOINT',
    ...roundmap(currentWayPoint.toArray()),
    '\nPOSITION OF ENTITY',
    ...roundmap(position.toArray())
  )
  return distanceSquared < THRESHOLD_ARRIVED_SQUARED
}

export function hasMoreWaypoints(entity: Entity): boolean {
  const autoPilot = getComponent(entity, AutoPilotComponent)
  invariant(!!autoPilot, 'no existing autoPilot component')
  const path = autoPilot.path
  return autoPilot.pathIndex < path.length
}
