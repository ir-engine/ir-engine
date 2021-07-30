import { handleAnimationStateChange } from '../../character/behaviors/handleAnimationStateChange'
import { handleObjectEquipped } from '../../interaction/functions/handleObjectEquipped'
import { handleForceTransform } from '../../physics/behaviors/handleForceTransform'

export enum NetworkObjectUpdateType {
  ObjectEquipped,
  ForceTransformUpdate, // used for if the player is stuck, falling through the world or NaN'd
  AnimationUpdate
}

export const NetworkObjectUpdateSchema = {
  [NetworkObjectUpdateType.ObjectEquipped]: handleObjectEquipped,
  [NetworkObjectUpdateType.ForceTransformUpdate]: handleForceTransform,
  [NetworkObjectUpdateType.AnimationUpdate]: handleAnimationStateChange
}
