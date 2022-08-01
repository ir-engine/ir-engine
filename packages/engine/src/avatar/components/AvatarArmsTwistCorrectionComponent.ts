import { Quaternion } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type AvatarArmsTwistCorrectionComponentType = {
  LeftHandBindRotationInv: Quaternion
  LeftArmTwistAmount: number

  RightHandBindRotationInv: Quaternion
  RightArmTwistAmount: number
}

export const AvatarArmsTwistCorrectionComponent = createMappedComponent<AvatarArmsTwistCorrectionComponentType>(
  'AvatarArmsTwistCorrectionComponent'
)
