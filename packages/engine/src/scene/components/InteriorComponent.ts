import { Vector2 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type InteriorComponentType = {
  cubeMap: string
  tiling: number
  size: Vector2
}

export const InteriorComponent = createMappedComponent<InteriorComponentType>('InteriorComponent')
