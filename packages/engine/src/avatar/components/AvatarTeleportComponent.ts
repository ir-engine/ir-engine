import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarTeleportComponent = defineComponent({
  name: 'AvatarTeleportComponent',

  onInit: (entity) => {
    return {
      side: null! as 'left' | 'right'
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.side === 'string') component.side.set(json.side as 'left' | 'right')
  },

  toJSON: () => {
    return null! as {
      side: 'left' | 'right'
    }
  }
})
