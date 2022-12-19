import { Object3D } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarComponentType = {
  /** @todo move this to AvatarRigComponent */
  model: Object3D | null
  avatarHeight: number
  avatarHalfHeight: number
}

export const AvatarComponent = createMappedComponent<AvatarComponentType>('AvatarComponent')
