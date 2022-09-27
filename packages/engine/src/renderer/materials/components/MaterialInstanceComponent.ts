import { Mesh } from 'three'

import { createMappedComponent } from '../../../ecs/functions/ComponentFunctions'

export type MaterialInstanceComponentType = {
  material: string
  mesh: Mesh
}

export const MaterialInstanceComponent =
  createMappedComponent<MaterialInstanceComponentType>('MaterialInstanceComponent')
