import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarControllerType } from '../../input/enums/InputEnums'

export type AvatarInputControllerTypeUpdatePendingComponentType = {
  newControllerType: AvatarControllerType
}

export const AvatarInputControllerTypeUpdatePendingComponent =
  createMappedComponent<AvatarInputControllerTypeUpdatePendingComponentType>(
    'AvatarInputControllerTypeUpdatePendingComponent'
  )
