import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const DelegatedInputReceiverComponent = defineComponent({
  name: 'DelegatedInputReceiverComponent',

  onInit: (entity) => {
    return {
      networkId: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.networkId) component.networkId.set(json.networkId)
  }
})
