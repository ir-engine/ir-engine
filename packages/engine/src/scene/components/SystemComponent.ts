import { ComponentType, defineComponent } from '../../ecs/functions/ComponentFunctions'
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

    // backwards compat
    convertSystemComponentJSON(json as any)

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

/**
 * Converts old system update types to new insert order and insert uuid
 * @param json
 * @returns
 */
export const convertSystemComponentJSON = (
  json: ComponentType<typeof SystemComponent> & { systemUpdateType: string }
) => {
  if (typeof json.systemUpdateType === 'string') {
    switch (json.systemUpdateType) {
      case 'UPDATE_EARLY':
        json.insertOrder = 'before'
        json.insertUUID = InputSystemGroup
        break
      case 'UPDATE':
        json.insertOrder = 'with'
        json.insertUUID = InputSystemGroup
        break
      case 'UPDATE_LATE':
        json.insertOrder = 'after'
        json.insertUUID = InputSystemGroup
        break
      case 'FIXED_EARLY':
        json.insertOrder = 'before'
        json.insertUUID = SimulationSystemGroup
        break
      case 'FIXED':
        json.insertOrder = 'with'
        json.insertUUID = SimulationSystemGroup
        break
      case 'FIXED_LATE':
        json.insertOrder = 'after'
        json.insertUUID = SimulationSystemGroup
        break
      case 'PRE_RENDER':
        json.insertOrder = 'before'
        json.insertUUID = PresentationSystemGroup
        break
      case 'RENDER':
        json.insertOrder = 'with'
        json.insertUUID = PresentationSystemGroup
        break
      case 'POST_RENDER':
        json.insertOrder = 'after'
        json.insertUUID = PresentationSystemGroup
        break
    }
  }
  return json
}
