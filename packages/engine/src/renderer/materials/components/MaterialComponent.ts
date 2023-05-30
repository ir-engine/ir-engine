import { Material } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { defineComponent } from '../../../ecs/functions/ComponentFunctions'
import { MaterialSource } from './MaterialSource'

export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialComponentType = {
  prototype: string
  material: Material
  parameters: { [field: string]: any }
  plugins: string[]
  src: MaterialSource
}
