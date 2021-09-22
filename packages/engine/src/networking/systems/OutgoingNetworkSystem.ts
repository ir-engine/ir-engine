import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateInterface, WorldStateModel } from '../schema/networkSchema'
import { Pose } from '../../transform/TransformInterfaces'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/isClient'
import { getLocalNetworkId } from '../functions/getLocalNetworkId'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { VelocityComponent } from '../../physics/components/VelocityComponent'

function sendActions() {
  const incomingActions = Engine.defaultWorld!.incomingActions
  const outgoingActions = Engine.defaultWorld!.outgoingActions

  // if hosting, forward all non-local incoming actions
  if (Engine.defaultWorld!.isHosting) {
    for (const incoming of incomingActions) {
      if (incoming.$to !== Engine.userId) {
        outgoingActions.add(incoming)
      }
    }
  }

  incomingActions.clear()

  // move local actions directly to incoming queue
  for (const out of outgoingActions) {
    if (out.$to !== Engine.userId) {
      incomingActions.add(out)
      outgoingActions.delete(out)
    }
  }

  Network.instance.transport?.sendActions(outgoingActions)
  outgoingActions.clear()
}

export default async function OutgoingNetworkSystem(world: World): Promise<System> {
  /**
   * For the client, we only want to send out objects we have authority over,
   *   which are the local avatar and any owned objects
   * For the server, we want to send all objects
   */

  const networkTransformsQuery =
    // isClient
    //   ? defineQuery([NetworkObjectOwnerComponent, NetworkObjectComponent, TransformComponent]) :
    defineQuery([NetworkObjectComponent, TransformComponent])

  const ikTransformsQuery = isClient
    ? defineQuery([AvatarControllerComponent, XRInputSourceComponent])
    : defineQuery([XRInputSourceComponent])

  // TODO: reduce quaternions over network to three components

  return () => {
    if (Engine.offlineMode) {
      sendActions()
      return
    }

    if (isClient && (!world.localClientEntity || !hasComponent(world.localClientEntity, NetworkObjectComponent))) {
      return
    }

    sendActions()

    const newWorldState: WorldStateInterface = {
      tick: world.fixedTick,
      time: Date.now(),
      pose: [],
      ikPose: []
    }

    for (const entity of networkTransformsQuery(world)) {
      const transformComponent = getComponent(entity, TransformComponent)
      const networkObject = getComponent(entity, NetworkObjectComponent)

      let vel = undefined! as number[]
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
      const transformComponent = getComponent(world.localClientEntity, TransformComponent)
      let vel = undefined! as number[]
      let angVel = undefined
      if (hasComponent(world.localClientEntity, VelocityComponent)) {
        const velC = getComponent(world.localClientEntity, VelocityComponent)
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
