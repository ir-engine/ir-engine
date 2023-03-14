import { Material } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { defineComponent } from '../../../ecs/functions/ComponentFunctions'
import { MaterialSource } from './MaterialSource'

export type MaterialWithEntity = Material & { entity: Entity }

export type MaterialComponentType = {
  prototype: string
  material: Material
  parameters: { [field: string]: any }
  src: MaterialSource
}

export const MaterialComponent = defineComponent({
  name: 'MaterialComponent',

  onInit(entity) {
    return {
      prototype: '',
      material: new Material(),
      parameters: {},
      src: null
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.prototype !== 'undefined') component.prototype.set(json.prototype)
    if (typeof json.material !== 'undefined') component.material.set(json.material)
    if (typeof json.parameters !== 'undefined') component.parameters.set(json.parameters)
    if (typeof json.src !== 'undefined') component.src.set(json.src)
  }
})
