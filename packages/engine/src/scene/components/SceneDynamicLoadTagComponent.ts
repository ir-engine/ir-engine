import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SceneDynamicLoadTagComponent = defineComponent({
  name: 'SceneDynamicLoadTagComponent',
  jsonID: 'dynamic-load',

  onInit(entity) {
    return {
      distance: 20,
      // runtime property
      loaded: false
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.distance) component.distance.set(json.distance)
    if (json.loaded) component.loaded.set(json.loaded)
  },

  toJSON: (entity, component) => {
    return {
      distance: component.distance.value
    }
  }
})
