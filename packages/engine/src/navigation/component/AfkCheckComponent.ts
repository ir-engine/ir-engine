import { Vector2, Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AfkCheckComponentType = {
  isAfk: boolean
  prevPosition: Vector3
  cStep: number
  cStep2: number
  timer: number
}

export const AfkCheckComponent = createMappedComponent<AfkCheckComponentType>('AfkCheckComponent')
