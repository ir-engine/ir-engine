import { handleAnimationStateChange } from '../../character/behaviors/handleAnimationStateChange'
import { handleObjectEquipped } from '../../interaction/functions/handleObjectEquipped'
import { handleForceTransform } from '../../physics/behaviors/handleForceTransform'
import { handleVehicleStateChange } from '../../vehicle/behaviors/handleVehicleStateChange'

export enum NetworkObjectUpdateType {
  VehicleStateChange,
  ObjectEquipped,
  ForceTransformUpdate, // used for if the player is stuck, falling through the world or NaN'd
  AnimationUpdate,
}

export const NetworkObjectUpdateSchema = {
  [NetworkObjectUpdateType.VehicleStateChange]: [
    {
      behavior: handleVehicleStateChange
    }
  ],
  [NetworkObjectUpdateType.ObjectEquipped]: [
    {
      behavior: handleObjectEquipped
    }
  ],
  [NetworkObjectUpdateType.ForceTransformUpdate]: [
    {
      behavior: handleForceTransform
    }
  ],
  [NetworkObjectUpdateType.AnimationUpdate]: [
    {
      behavior: handleAnimationStateChange
    }
  ]
}
