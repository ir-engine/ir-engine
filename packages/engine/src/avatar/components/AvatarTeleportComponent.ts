import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarTeleportComponent = defineComponent({
  name: 'AvatarTeleportComponent',

  onInit: (entity) => {
    return {
      side: null! as XRHandedness
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.side === 'string') component.side.set(json.side as XRHandedness)
  },

  toJSON: () => {
    return null! as {
      side: XRHandedness
    }
  }
})
