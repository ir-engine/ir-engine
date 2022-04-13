import { Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarSwerveComponentType = {
  axis: Vector3
}
export const AvatarSwerveComponent = createMappedComponent<AvatarSwerveComponentType>('AvatarSwerveComponent')
