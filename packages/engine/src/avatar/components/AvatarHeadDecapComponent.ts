import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarHeadDecapComponentType = {
  opacity: number
  ready: boolean
}

export const AvatarHeadDecapComponent = createMappedComponent<AvatarHeadDecapComponentType>('AvatarHeadDecapComponent')
