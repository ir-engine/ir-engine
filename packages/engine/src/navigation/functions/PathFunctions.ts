import { Vector3 } from 'three'

import { NavMesh } from '../../scene/classes/NavMesh'
import { fromYukaVector, toYukaVector } from './MathFunctions'

export const updatePath = (path: Vector3[], navMesh: NavMesh, from: Vector3, to: Vector3): Vector3[] => {
  const points = navMesh.findPath(toYukaVector(from), toYukaVector(to))

  // Copy array
  for (let i = 0; i < points.length; i++) {
    if (path[i]) {
      path[i].copy(points[i] as any)
    } else {
      path[i] = fromYukaVector(points[i])
    }
  }
  path.length = points.length

  return path
}

export function findLengthSquared(path: Vector3[], startIndex: number): number {
  let result = 0
  for (let i = startIndex; i < path.length - 1; i++) {
    result += path[i].distanceToSquared(path[i + 1])
  }
  return result
}
