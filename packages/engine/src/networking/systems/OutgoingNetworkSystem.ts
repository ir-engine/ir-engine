import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateInterface, WorldStateModel } from '../schema/networkSchema'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { isZero } from '@xrengine/common/src/utils/mathUtils'
import { encodeVector3, encodeQuaternion } from '@xrengine/common/src/utils/encode'
import { arraysAreEqual } from '@xrengine/common/src/utils/miscUtils'
import { Action } from '../interfaces/Action'

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
      incomingActions.add(out as Required<Action>)
      outgoingActions.delete(out)
    }
  }

  Network.instance.transport?.sendActions(outgoingActions)
  outgoingActions.clear()
}

let prevWorldState: WorldStateInterface = {
  tick: 0,
  time: 0,
  pose: [],
  ikPose: []
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

  return () => {
    if (Engine.offlineMode) {
      sendActions()
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
        if (isZero(velC.velocity) || velocityIsTheSame(networkObject.networkId, velC.velocity)) vel = [0]
        else vel = encodeVector3(velC.velocity)
      }
      // const networkObjectOwnerComponent = getComponent(entity, NetworkObjectOwnerComponent)
      // networkObjectOwnerComponent && console.log('outgoing', getComponent(entity, NameComponent).name, transformComponent.position)
      // console.log('outgoing', getComponent(entity, NameComponent).name, transformComponent.position.toArray().concat(transformComponent.rotation.toArray()))
      if (
        !transformIsTheSame(
          networkObject.networkId,
          encodeVector3(transformComponent.position),
          encodeQuaternion(transformComponent.rotation),
          vel
        )
      )
        newWorldState.pose.push({
          networkId: networkObject.networkId,
          position: encodeVector3(transformComponent.position),
          rotation: encodeQuaternion(transformComponent.rotation),
          linearVelocity: vel !== undefined ? vel : [0],
          angularVelocity: angVel !== undefined ? angVel : [0]
        })
    }

    const networkComponent = getComponent(world.localClientEntity, NetworkObjectComponent)
    if (isClient && networkComponent) {
      const transformComponent = getComponent(world.localClientEntity, TransformComponent)
      let vel = undefined! as number[]
      let angVel = undefined
      if (hasComponent(world.localClientEntity, VelocityComponent)) {
        const velC = getComponent(world.localClientEntity, VelocityComponent)
        if (isZero(velC.velocity) || velocityIsTheSame(world.localClientEntity, velC.velocity)) vel = [0]
        else vel = encodeVector3(velC.velocity)
      }

      if (
        !transformIsTheSame(
          networkComponent.networkId,
          encodeVector3(transformComponent.position),
          encodeQuaternion(transformComponent.rotation),
          vel
        )
      )
        newWorldState.pose.push({
          networkId: networkComponent.networkId,
          position: encodeVector3(transformComponent.position),
          rotation: encodeQuaternion(transformComponent.rotation),
          linearVelocity: vel !== undefined ? vel : [0],
          angularVelocity: angVel !== undefined ? angVel : [0]
        })
    }

    for (const entity of ikTransformsQuery(world)) {
      const networkObject = getComponent(entity, NetworkObjectComponent)

      const xrInputs = getComponent(entity, XRInputSourceComponent)

      if (
        !ikPoseIsTheSame(
          networkObject.networkid,
          encodeVector3(xrInputs.head.position),
          encodeQuaternion(xrInputs.head.quaternion),
          encodeVector3(xrInputs.controllerLeft.position),
          encodeQuaternion(xrInputs.controllerLeft.quaternion),
          encodeVector3(xrInputs.controllerRight.position),
          encodeQuaternion(xrInputs.controllerRight.quaternion)
        )
      )
        newWorldState.ikPose.push({
          networkId: networkObject.networkId,
          headPosePosition: encodeVector3(xrInputs.head.position),
          headPoseRotation: encodeQuaternion(xrInputs.head.quaternion),
          leftPosePosition: encodeVector3(xrInputs.controllerLeft.position),
          leftPoseRotation: encodeQuaternion(xrInputs.controllerLeft.quaternion),
          rightPosePosition: encodeVector3(xrInputs.controllerRight.position),
          rightPoseRotation: encodeQuaternion(xrInputs.controllerRight.quaternion)
        })
    }

    try {
      const buffer = WorldStateModel.toBuffer(newWorldState)
      Network.instance.transport.sendData(buffer)
      prevWorldState = newWorldState
    } catch (e) {
      console.log('could not convert world state to a buffer, ' + e)
    }
  }
}

function velocityIsTheSame(netId, vel): boolean {
  for (let i = 0; i < prevWorldState.pose.length; i++) {
    if (prevWorldState.pose[i].networkId === netId) {
      if (arraysAreEqual(prevWorldState.pose[i].angularVelocity, vel)) {
        return true
      } else {
        return false
      }
    }
  }

  return false
}
function transformIsTheSame(netId, pos, rot, vel): boolean {
  if (vel === undefined) vel = [0]
  for (let i = 0; i < prevWorldState.pose.length; i++) {
    if (prevWorldState.pose[i].networkId === netId) {
      if (
        arraysAreEqual(prevWorldState.pose[i].position, pos) &&
        arraysAreEqual(prevWorldState.pose[i].rotation, rot) &&
        arraysAreEqual(prevWorldState.pose[i].linearVelocity, vel)
      ) {
        return true
      } else {
        return false
      }
    }
  }

  return false
}
function ikPoseIsTheSame(netId, hp, hr, lp, lr, rp, rr): boolean {
  for (let i = 0; i < prevWorldState.ikPose.length; i++) {
    if (prevWorldState.ikPose[i].networkId === netId) {
      if (
        arraysAreEqual(prevWorldState.ikPose[i].headPosePosition, hp) &&
        arraysAreEqual(prevWorldState.ikPose[i].headPoseRotation, hr) &&
        arraysAreEqual(prevWorldState.ikPose[i].leftPosePosition, lp) &&
        arraysAreEqual(prevWorldState.ikPose[i].leftPoseRotation, lr) &&
        arraysAreEqual(prevWorldState.ikPose[i].rightPosePosition, rp) &&
        arraysAreEqual(prevWorldState.ikPose[i].rightPoseRotation, rr)
      ) {
        return true
      } else {
        return false
      }
    }
  }

  return false
}
