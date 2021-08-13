import { Mesh } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

import { DissolveEffect } from '../DissolveEffect'

export type AvatarDissolveComponentType = {
  effect: DissolveEffect
}
export const AvatarDissolveComponent = createMappedComponent<AvatarDissolveComponentType>()
