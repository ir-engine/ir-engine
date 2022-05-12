import { AvatarControllerType } from 'src/input/enums/InputEnums'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarInputControllerTypeUpdatePendingComponentType = {
  newControllerType: AvatarControllerType
}

export const AvatarInputControllerTypeUpdatePendingComponent =
  createMappedComponent<AvatarInputControllerTypeUpdatePendingComponentType>(
    'AvatarInputControllerTypeUpdatePendingComponent'
  )
