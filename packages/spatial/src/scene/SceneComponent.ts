import { Entity, defineComponent } from '@etherealengine/ecs'

export const SceneComponent = defineComponent({
  name: 'SceneComponent',
  onInit(entity) {
    return {
      children: [] as Entity[]
      // environment
      // background
      // fog
    }
  },
  onSet(entity, component, json) {
    if (!json) return

    if (Array.isArray(json.children)) component.children.set(json.children)
  }
})
