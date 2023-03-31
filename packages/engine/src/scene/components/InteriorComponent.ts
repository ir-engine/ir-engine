import { Vector2 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { Interior } from '../classes/Interior'

export type InteriorComponentType = {
  cubeMap: string
  tiling: number
  size: Vector2
  interior?: Interior
}

export const InteriorComponent = defineComponent({
  name: 'InteriorComponent',
  onInit: () => {
    return {
      cubeMap: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES.cubeMap,
      tiling: SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES.tiling,
      size: new Vector2().copy(SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES.size)
    } as InteriorComponentType
  },
  toJSON(entity, component) {
    return {
      cubeMap: component.cubeMap.value,
      tiling: component.tiling.value,
      size: component.size.value
    }
  },
  errors: ['LOADING_ERROR']
})

export const SCENE_COMPONENT_INTERIOR = 'interior'
export const SCENE_COMPONENT_INTERIOR_DEFAULT_VALUES = {
  cubeMap: '',
  tiling: 1,
  size: { x: 1, y: 1 } as Vector2
}
