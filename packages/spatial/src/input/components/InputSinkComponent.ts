import { defineComponent, UndefinedEntity } from '@etherealengine/ecs'

export const InputSinkComponent = defineComponent({
  name: 'InputSinkComponent',

  onInit: () => {
    return {
      inputEntity: UndefinedEntity
    }
  },
  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.inputEntity === 'number') component.inputEntity.set(json.inputEntity)
  }
})
