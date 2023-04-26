import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const EquippableComponent = defineComponent({
  name: 'EquippableComponent',
  jsonID: 'equippable',
  toJSON: () => true
})
