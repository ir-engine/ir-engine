import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const EquipperComponent = defineComponent({
  name: 'EquipperComponent',

  onInit(entity) {
    return {
      equippedEntity: null! as Entity
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.equippedEntity === 'number') component.equippedEntity.set(json.equippedEntity)
  }
})
