import { Material } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export type MaterialMap = {
  id: string
  material: Material
}

export const AvatarEffectComponent = defineComponent({
  name: 'AvatarEffectComponent',
  onInit: (entity) => {
    return {
      sourceEntity: null! as Entity,
      opacityMultiplier: 1,
      originMaterials: [] as Array<MaterialMap>
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.sourceEntity) component.sourceEntity.set(json.sourceEntity)
    if (json.opacityMultiplier) component.opacityMultiplier.set(json.opacityMultiplier)
    if (json.originMaterials) component.originMaterials.set(json.originMaterials as Array<MaterialMap>)
  }
})
