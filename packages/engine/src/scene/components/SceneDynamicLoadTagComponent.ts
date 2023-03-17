import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SceneDynamicLoadTagComponent = defineComponent({
  name: 'SceneDynamicLoadTagComponent',

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

export const SCENE_COMPONENT_DYNAMIC_LOAD = 'dynamic-load'
export const SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES = {
  distance: 20
}
