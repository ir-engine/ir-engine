import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { Vault } from '../classes/Vault'
import { defineQuery, defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateInterface, WorldStateModel } from '../schema/networkSchema'
import { Pose } from '../../transform/TransformInterfaces'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/isClient'
import { ClientAuthoritativeComponent } from '../../physics/components/ClientAuthoritativeComponent'
import { getLocalNetworkId } from '../functions/getLocalNetworkId'

export const OutgoingNetworkSystem = async (): Promise<System> => {
  /**
   * For the client, we only want to send out objects we have authority over,
   *   which are the local avatar and any owned objects
   * For the server, we want to send all objects
   */

  const networkTransformsQuery = isClient
    ? defineQuery([ClientAuthoritativeComponent, NetworkObjectComponent, TransformComponent])
    : defineQuery([NetworkObjectComponent, TransformComponent])

  const avatarTransformsQuery = defineQuery([AvatarComponent])

  const ikTransformsQuery = isClient
    ? defineQuery([AvatarControllerComponent, XRInputSourceComponent])
    : defineQuery([XRInputSourceComponent])

  // TODO: reduce quaternions over network to three components

  return defineSystem((world: ECSWorld) => {
    if (
      isClient &&
      (typeof Network.instance.localClientEntity === 'undefined' ||
        !hasComponent(Network.instance.localClientEntity, NetworkObjectComponent))
    )
      return world
    const transformState: WorldStateInterface = {
      tick: Network.instance.tick,
      time: Date.now(),
      pose: [],
      ikPose: []
    }

    for (const entity of networkTransformsQuery(world)) {
      const transformComponent = getComponent(entity, TransformComponent)
      const networkObject = getComponent(entity, NetworkObjectComponent)

      transformState.pose.push({
        networkId: networkObject.networkId,
        pose: transformComponent.position.toArray().concat(transformComponent.rotation.toArray()) as Pose
      })
    }

    if (isClient) {
      const transformComponent = getComponent(Network.instance.localClientEntity, TransformComponent)
      transformState.pose.push({
        networkId: getLocalNetworkId(),
        pose: transformComponent.position.toArray().concat(transformComponent.rotation.toArray()) as Pose
      })
    } else {
      for (const entity of avatarTransformsQuery(world)) {
        const transformComponent = getComponent(entity, TransformComponent)
        const networkObject = getComponent(entity, NetworkObjectComponent)

        // TODO: reduce quaternions over network to three components
        transformState.pose.push({
          networkId: networkObject.networkId,
          pose: transformComponent.position.toArray().concat(transformComponent.rotation.toArray()) as Pose
        })
      }
    }

    for (const entity of ikTransformsQuery(world)) {
      const networkObject = getComponent(entity, NetworkObjectComponent)

      const xrInputs = getComponent(entity, XRInputSourceComponent)
      const headPose = xrInputs.head.position.toArray().concat(xrInputs.head.quaternion.toArray()) as Pose
      const leftPose = xrInputs.controllerLeft.position
        .toArray()
        .concat(xrInputs.controllerLeft.quaternion.toArray()) as Pose
      const rightPose = xrInputs.controllerRight.position
        .toArray()
        .concat(xrInputs.controllerRight.quaternion.toArray()) as Pose

      transformState.ikPose.push({
        networkId: networkObject.networkId,
        headPose,
        leftPose,
        rightPose
      })
    }

    try {
      // console.log(transformState)
      Network.instance.transport.sendData(WorldStateModel.toBuffer(transformState))
    } catch (e) {
      console.error(transformState)
    }

    return world
  })
}
