import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { defineQuery } from 'bitecs'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateInterface, WorldStateModel } from '../schema/networkSchema'
import { Pose } from '../../transform/TransformInterfaces'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/isClient'
import { NetworkObjectOwnerComponent } from '../../networking/components/NetworkObjectOwnerComponent'
import { getLocalNetworkId } from '../functions/getLocalNetworkId'
import { Engine } from '../../ecs/classes/Engine'
import { IncomingActionType } from '../interfaces/NetworkTransport'
import { System } from '../../ecs/classes/System'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { isZero } from '@xrengine/common/src/utils/mathUtils'
import { Euler, Quaternion } from '@etherealjs/core'

function sendActions() {
  if (!isClient) {
    // On server:
    // incoming actions (that haven't been removed) are sent to all clients
    Network.instance.transport.sendActions(Network.instance.incomingActions)
    // outgoing actions are dispatched back to self as incoming actions (handled in next frame)
    const serverActions = Network.instance.outgoingActions as IncomingActionType[]
    for (const a of serverActions) if (!a.$userId) a.$userId = 'server'
    Network.instance.incomingActions = serverActions
    Network.instance.outgoingActions = []
  } else {
    // On client:
    // we only send actions to server (server will send back our action if it's allowed)
    Network.instance.transport?.sendActions(Network.instance.outgoingActions)
    Network.instance.incomingActions = []
    Network.instance.outgoingActions = []
  }
}

export default async function OutgoingNetworkSystem(world: World): Promise<System> {
  /**
   * For the client, we only want to send out objects we have authority over,
   *   which are the local avatar and any owned objects
   * For the server, we want to send all objects
   */

  const networkTransformsQuery = isClient
    ? defineQuery([NetworkObjectOwnerComponent, NetworkObjectComponent, TransformComponent])
    : defineQuery([NetworkObjectComponent, TransformComponent])

  const ikTransformsQuery = isClient
    ? defineQuery([AvatarControllerComponent, XRInputSourceComponent])
    : defineQuery([XRInputSourceComponent])

  const velQuery = isClient
    ? defineQuery([NetworkObjectOwnerComponent, NetworkObjectComponent, VelocityComponent])
    : defineQuery([NetworkObjectComponent, VelocityComponent])

  // TODO: reduce quaternions over network to three components

  return () => {
    if (Engine.offlineMode) {
      sendActions()
      return world
    }

    if (
      isClient &&
      (!Network.instance.localClientEntity || !hasComponent(Network.instance.localClientEntity, NetworkObjectComponent))
    ) {
      return world
    }

    sendActions()

    const newWorldState: WorldStateInterface = {
      tick: Network.instance.tick,
      time: Date.now(),
      pose: [],
      ikPose: []
    }

    for (const entity of networkTransformsQuery(world)) {
      const transformComponent = getComponent(entity, TransformComponent)
      const networkObject = getComponent(entity, NetworkObjectComponent)

      let vel = undefined
      let angVel = undefined
      if (hasComponent(entity, VelocityComponent)) {
        const velC = getComponent(entity, VelocityComponent)
        vel = velC.velocity.toArray()
      }

      // const networkObjectOwnerComponent = getComponent(entity, NetworkObjectOwnerComponent)
      // networkObjectOwnerComponent && console.log('outgoing', getComponent(entity, NameComponent).name, transformComponent.position)
      // console.log('outgoing', getComponent(entity, NameComponent).name, transformComponent.position.toArray().concat(transformComponent.rotation.toArray()))
      newWorldState.pose.push({
        networkId: networkObject.networkId,
        position: transformComponent.position.toArray(),
        rotation: transformComponent.rotation.toArray(),
        linearVelocity: vel !== undefined ? vel : [0, 0, 0],
        angularVelocity: angVel !== undefined ? angVel : [0, 0, 0]
      })
    }

    if (isClient) {
      const transformComponent = getComponent(Network.instance.localClientEntity, TransformComponent)

      let vel = undefined
      let angVel = undefined
      if (hasComponent(Network.instance.localClientEntity, VelocityComponent)) {
        const velC = getComponent(Network.instance.localClientEntity, VelocityComponent)
        vel = velC.velocity.toArray()
      }

      newWorldState.pose.push({
        networkId: getLocalNetworkId(),
        position: transformComponent.position.toArray(),
        rotation: transformComponent.rotation.toArray(),
        linearVelocity: vel !== undefined ? vel : [0, 0, 0],
        angularVelocity: angVel !== undefined ? angVel : [0, 0, 0]
      })
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

      newWorldState.ikPose.push({
        networkId: networkObject.networkId,
        headPose,
        leftPose,
        rightPose
      })
    }

    try {
      const buffer = WorldStateModel.toBuffer(newWorldState)
      Network.instance.transport.sendData(buffer)
    } catch (e) {
      console.log('could not convert world state to a buffer, ' + e)
    }
  }
}
