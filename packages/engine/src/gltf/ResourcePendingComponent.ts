import {
  Entity,
  defineComponent,
  getMutableComponent,
  getOptionalMutableComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs'
import { none } from '@etherealengine/hyperflux'

export const ResourcePendingComponent = defineComponent({
  name: 'ResourcePendingComponent',

  onInit(entity) {
    return {} as Record<string, { progress: number; total: number }>
  },

  setResource(entity: Entity, url: string, progress: number, total: number) {
    setComponent(entity, ResourcePendingComponent)

    const component = getMutableComponent(entity, ResourcePendingComponent)
    component[url].set({ progress, total })
  },

  removeResource(entity: Entity, url: string) {
    const component = getOptionalMutableComponent(entity, ResourcePendingComponent)
    if (!component) return
    if (!component[url].value) return

    component[url].set(none)

    if (!component.keys.length) {
      removeComponent(entity, ResourcePendingComponent)
    }
  }
})
