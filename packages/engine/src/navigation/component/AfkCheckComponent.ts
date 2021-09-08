import { Vector2, Vector3 } from 'three'
import { createMappedComponent, getComponent } from '../../ecs/functions/EntityFunctions'

export type AfkCheckComponentType = {
  isAfk: boolean
  prevPosition: Vector3
  cStep: number
  timer: number
}

export const AfkCheckComponent = createMappedComponent<AfkCheckComponentType>()
