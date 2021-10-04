import { Mesh } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type AvatarPendingComponentType = {
  light: Mesh
  plate: Mesh
}

export const AvatarPendingComponent = createMappedComponent<AvatarPendingComponentType>('AvatarPendingComponent')
