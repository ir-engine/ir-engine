import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'

export type SystemComponentType = {
  filePath: string
  systemUpdateType: keyof typeof SystemUpdateType
  enableClient: boolean
  enableServer: boolean
  args: any
}

export const SystemComponent = createMappedComponent<SystemComponentType>('SystemComponent')

export const SCENE_COMPONENT_SYSTEM = 'system'
export const SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES = {
  filePath: '',
  systemUpdateType: SystemUpdateType.UPDATE,
  enableClient: true,
  enableServer: true,
  args: {}
}
