import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

type AvatarPendingComponentType = {
  url: string
}

export const AvatarPendingComponent = createMappedComponent<AvatarPendingComponentType>('AvatarPendingComponent')
