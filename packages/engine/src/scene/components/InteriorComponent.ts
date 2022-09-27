import { Vector2 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Interior } from '../classes/Interior'

export type InteriorComponentType = {
  cubeMap: string
  tiling: number
  size: Vector2
  interior?: Interior
}

export const InteriorComponent = createMappedComponent<InteriorComponentType>('InteriorComponent')

export const SCENE_COMPONENT_INTERIOR = 'interior'
export const SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES = {
  cubeMap: '',
  tiling: 1,
  size: { x: 1, y: 1 }
}
