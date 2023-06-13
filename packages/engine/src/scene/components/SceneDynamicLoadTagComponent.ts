import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SceneDynamicLoadTagComponent = defineComponent({
  name: 'SceneDynamicLoadTagComponent',
  jsonID: 'dynamic-load',

  onInit(entity) {
    return {
      distance: 20
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.distance) component.distance.set(json.distance)
  },

  toJSON: (entity, component) => {
    return {
      distance: component.distance.value
    }
  }
})
