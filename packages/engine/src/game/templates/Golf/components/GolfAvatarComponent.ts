import { Group } from 'three'
import { createMappedComponent } from '../../../../ecs/functions/EntityFunctions'

type GolfAvatarComponentType = {
  headModel: Group
  leftHandModel: Group
  rightHandModel: Group
  torsoModel: Group
}

export const GolfAvatarComponent = createMappedComponent<GolfAvatarComponentType>()