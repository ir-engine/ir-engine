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
