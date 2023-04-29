import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { EquippedComponent } from './EquippedComponent'

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
  },

  onRemove(entity, component) {
    const equippedEntity = component.equippedEntity.value
    removeComponent(equippedEntity, EquippedComponent)
  }
})
