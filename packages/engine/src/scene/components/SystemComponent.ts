import { defineComponent } from '../../ecs/functions/ComponentFunctions'
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
