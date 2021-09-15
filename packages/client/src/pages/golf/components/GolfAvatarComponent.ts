import { Group } from 'three'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type GolfAvatarComponentType = {
  headModel: Group
  leftHandModel: Group
  rightHandModel: Group
  torsoModel: Group
}

export const GolfAvatarComponent = createMappedComponent<GolfAvatarComponentType>('GolfAvatarComponent')
