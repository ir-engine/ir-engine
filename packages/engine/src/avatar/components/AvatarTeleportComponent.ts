import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarTeleportComponent = defineComponent({
  name: 'AvatarTeleportComponent',

  onAdd: (entity) => {
    return {
      side: null! as 'left' | 'right'
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.side) component.side = json.side as 'left' | 'right'
  },

  toJSON: () => {
    return null! as {
      side: 'left' | 'right'
    }
  }
})
