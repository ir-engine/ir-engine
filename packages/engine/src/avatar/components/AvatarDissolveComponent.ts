import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { DissolveEffect } from '../DissolveEffect'

export type AvatarDissolveComponentType = {
  effect: DissolveEffect
}

export const AvatarDissolveComponent = createMappedComponent<AvatarDissolveComponentType>('AvatarDissolveComponent')
