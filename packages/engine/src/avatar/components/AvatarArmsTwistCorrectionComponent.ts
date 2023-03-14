import { Quaternion } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarArmsTwistCorrectionComponent = defineComponent({
  name: 'AvatarArmsTwistCorrectionComponent',

  onInit: (entity) => {
    return {
      LeftHandBindRotationInv: new Quaternion(),
      LeftArmTwistAmount: 0,
      RightHandBindRotationInv: new Quaternion(),
      RightArmTwistAmount: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.LeftHandBindRotationInv) component.LeftHandBindRotationInv.set(json.LeftHandBindRotationInv)
    if (json.LeftArmTwistAmount) component.LeftArmTwistAmount.set(json.LeftArmTwistAmount)
    if (json.RightHandBindRotationInv) component.RightHandBindRotationInv.set(json.RightHandBindRotationInv)
    if (json.RightArmTwistAmount) component.RightArmTwistAmount.set(json.RightArmTwistAmount)
  }
})
