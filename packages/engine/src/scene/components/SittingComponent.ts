import { AvatarStates } from '../../avatar/animation/Util'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SittingComponentType = {
  mountPointEntity: Entity
  state: typeof AvatarStates.SIT_ENTER | typeof AvatarStates.SIT_IDLE | typeof AvatarStates.SIT_LEAVE
}

export const SittingComponent = createMappedComponent<SittingComponentType>('SittingComponent')
