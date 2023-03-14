import { ComponentType, defineComponent } from '../../ecs/functions/ComponentFunctions'

export const GLTFLoadedComponent = defineComponent({
  name: 'GLTFLoadedComponent',

  onInit: (entity) => {
    return [] as ComponentType<any>[]
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (Array.isArray(json)) {
      component.set(json)
    }
  }
})
