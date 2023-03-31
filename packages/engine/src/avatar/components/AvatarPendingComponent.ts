import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarPendingComponent = defineComponent({
  name: 'AvatarPendingComponent',

  onInit(entity) {
    return {
      url: ''
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.url) component.url.set(json.url)
  }
})
