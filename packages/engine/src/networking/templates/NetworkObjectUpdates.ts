import { handleAnimationStateChange } from '../../avatar/behaviors/handleAnimationStateChange'
import { handleObjectEquipped } from '../../interaction/functions/handleObjectEquipped'
import { handleForceTransform } from '../../physics/behaviors/handleForceTransform'
import { NetworkObjectEditInterface } from '../interfaces/WorldState'

export enum NetworkObjectUpdateType {
  ObjectEquipped,
  ForceTransformUpdate, // used for if the player is stuck, falling through the world or NaN'd
  AnimationUpdate
}

export const NetworkObjectUpdateMap = new Map<
  NetworkObjectUpdateType,
  (editObject: NetworkObjectEditInterface) => void
>()

NetworkObjectUpdateMap.set(NetworkObjectUpdateType.ObjectEquipped, handleObjectEquipped)
NetworkObjectUpdateMap.set(NetworkObjectUpdateType.ForceTransformUpdate, handleForceTransform)
NetworkObjectUpdateMap.set(NetworkObjectUpdateType.AnimationUpdate, handleAnimationStateChange)
