import { Material, MaterialParameters, Texture, Vector3 } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { createMappedComponent } from '../../../ecs/functions/ComponentFunctions'

export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialComponentType = {
  prototype: string
  material: Material
  parameters: { [field: string]: any }
}

export const MaterialComponent = createMappedComponent<MaterialComponentType>('MaterialComponent')
