import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SpectatorComponent = defineComponent({
  name: 'SpectatorComponent',

  onInit: (entity) => {
    return {
      userId: '' as UserId
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.userId) component.userId.set(json.userId)
  }
})
