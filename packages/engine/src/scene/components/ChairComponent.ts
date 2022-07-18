import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MountPointComponentType = {
  type: string
}

export const MountPointComponent = createMappedComponent<MountPointComponentType>('MountPointComponent')
