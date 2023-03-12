import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'

export const SystemComponent = defineComponent({
  name: 'SystemComponent',

  onInit(entity) {
    return {
      filePath: '',
      systemUpdateType: SystemUpdateType.UPDATE as keyof typeof SystemUpdateType,
      enableClient: true,
      enableServer: true,
      args: {} as Record<any, any>
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.filePath === 'string') component.filePath.set(json.filePath)
    if (typeof json.systemUpdateType === 'string') component.systemUpdateType.set(json.systemUpdateType)
    if (typeof json.enableClient === 'boolean') component.enableClient.set(json.enableClient)
    if (typeof json.enableServer === 'boolean') component.enableServer.set(json.enableServer)
    if (typeof json.args === 'object') component.args.set(json.args)
  }
})

export const SCENE_COMPONENT_SYSTEM = 'system'
