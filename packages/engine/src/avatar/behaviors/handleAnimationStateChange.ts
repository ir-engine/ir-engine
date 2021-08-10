import { Entity } from '../../ecs/classes/Entity'
import { Network } from '../../networking/classes/Network'
import { convertBufferSupportedStringToObj } from '../../networking/functions/jsonSerialize'
import { NetworkObjectEditInterface } from '../../networking/interfaces/WorldState'
import { AnimationGraph } from '../animations/AnimationGraph'

export const handleAnimationStateChange = (editObject: NetworkObjectEditInterface): void => {
  if (!Network.instance.networkObjects[editObject.networkId]) {
    return console.warn(`Entity with id ${editObject.networkId} does not exist! You should probably reconnect...`)
  }

  if (Network.instance.networkObjects[editObject.networkId].ownerId === Network.instance.userId) return

  const entity = Network.instance.networkObjects[editObject.networkId].entity

  const animationDetail = convertBufferSupportedStringToObj(editObject.data[0])

  animationDetail.params.forceTransition = true
  AnimationGraph.forceUpdateAnimationState(entity, animationDetail.state, animationDetail.params)
}
