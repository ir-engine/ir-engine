import { Vector3 } from 'three'
import { createMappedComponent } from '../ecs/ComponentFunctions'

export type DebugArrowComponentType = {
  color: number
  direction: Vector3
  position: Vector3
}

export const DebugArrowComponent = createMappedComponent<DebugArrowComponentType>('DebugArrowComponent')
