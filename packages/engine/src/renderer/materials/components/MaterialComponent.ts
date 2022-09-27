import { Material, MaterialParameters, Texture, Vector3 } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { createMappedComponent } from '../../../ecs/functions/ComponentFunctions'
import { MaterialSource } from './MaterialSource'

export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialComponentType = {
  prototype: string
  material: Material
  parameters: { [field: string]: any }
  src: MaterialSource
}

export const MaterialComponent = createMappedComponent<MaterialComponentType>('MaterialComponent')
