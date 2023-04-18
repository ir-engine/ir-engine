import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { InputSystemGroup, PresentationSystemGroup, SimulationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { SystemUUID } from '../../ecs/functions/SystemFunctions'

export const SystemComponent = defineComponent({
  name: 'SystemComponent',
  jsonID: 'system',

  onInit(entity) {
    return {
      filePath: '',
      insertUUID: '' as SystemUUID,
      insertOrder: '' as 'before' | 'with' | 'after',
      enableClient: true,
      enableServer: true,
      args: {} as Record<any, any>
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.filePath === 'string') component.filePath.set(json.filePath)
    if (typeof json.insertUUID === 'string') component.insertUUID.set(json.insertUUID)
    if (typeof json.insertOrder === 'string') component.insertOrder.set(json.insertOrder)
    if (typeof json.enableClient === 'boolean') component.enableClient.set(json.enableClient)
    if (typeof json.enableServer === 'boolean') component.enableServer.set(json.enableServer)
    if (typeof json.args === 'object') component.args.set(json.args)

    // backwards compat
    if (typeof (json as any).systemUpdateType === 'string') {
      switch ((json as any).systemUpdateType) {
        case 'UPDATE_EARLY':
          component.insertOrder.set('before')
          component.insertUUID.set(InputSystemGroup)
          break
        case 'UPDATE':
          component.insertOrder.set('with')
          component.insertUUID.set(InputSystemGroup)
          break
        case 'UPDATE_LATE':
          component.insertOrder.set('after')
          component.insertUUID.set(InputSystemGroup)
          break
        case 'FIXED_EARLY':
          component.insertOrder.set('before')
          component.insertUUID.set(SimulationSystemGroup)
          break
        case 'FIXED':
          component.insertOrder.set('with')
          component.insertUUID.set(SimulationSystemGroup)
          break
        case 'FIXED_LATE':
          component.insertOrder.set('after')
          component.insertUUID.set(SimulationSystemGroup)
          break
        case 'PRE_RENDER':
          component.insertOrder.set('before')
          component.insertUUID.set(PresentationSystemGroup)
          break
        case 'RENDER':
          component.insertOrder.set('with')
          component.insertUUID.set(PresentationSystemGroup)
          break
        case 'POST_RENDER':
          component.insertOrder.set('after')
          component.insertUUID.set(PresentationSystemGroup)
          break
      }
    }
  },

  toJSON(entity, component) {
    return {
      filePath: component.filePath.value,
      insertUUID: component.insertUUID.value,
      insertOrder: component.insertOrder.value,
      enableClient: component.enableClient.value,
      enableServer: component.enableServer.value,
      args: component.args.value
    }
  }
})
