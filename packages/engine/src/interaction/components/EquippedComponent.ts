import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const EquippedComponent = defineComponent({
  name: 'EquippedComponent',

  onInit(entity) {
    return {
      attachmentPoint: 'none' as XRHandedness,
      equipperEntity: null! as Entity
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.attachmentPoint === 'string') component.attachmentPoint.set(json.attachmentPoint)
    if (typeof json.equipperEntity === 'number') component.equipperEntity.set(json.equipperEntity)
  }
})
