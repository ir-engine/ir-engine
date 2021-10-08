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
import { pipe } from 'bitecs'

const networkTransformsQuery =
  // isClient
  //   ? defineQuery([NetworkObjectOwnerComponent, NetworkObjectComponent, TransformComponent]) :
  defineQuery([NetworkObjectComponent, TransformComponent])

const ikTransformsQuery = isClient
  ? defineQuery([AvatarControllerComponent, XRInputSourceComponent])
  : defineQuery([XRInputSourceComponent])

function velocityIsTheSame(previousNetworkState, netId, vel): boolean {
  for (let i = 0; i < previousNetworkState.pose.length; i++) {
    if (previousNetworkState.pose[i].networkId === netId) {
      if (arraysAreEqual(previousNetworkState.pose[i].angularVelocity, vel)) {
        return true
      } else {
        return false
      }
    }
  }

  return false
}
function transformIsTheSame(previousNetworkState, netId, pos, rot, vel): boolean {
  if (vel === undefined) vel = [0]
  for (let i = 0; i < previousNetworkState.pose.length; i++) {
    if (previousNetworkState.pose[i].networkId === netId) {
      if (
        arraysAreEqual(previousNetworkState.pose[i].position, pos) &&
        arraysAreEqual(previousNetworkState.pose[i].rotation, rot) &&
        arraysAreEqual(previousNetworkState.pose[i].linearVelocity, vel)
      ) {
        return true
      } else {
        return false
      }
    }
  }

  return false
}
function ikPoseIsTheSame(previousNetworkState, netId, hp, hr, lp, lr, rp, rr): boolean {
  for (let i = 0; i < previousNetworkState.ikPose.length; i++) {
    if (previousNetworkState.ikPose[i].networkId === netId) {
      if (
        arraysAreEqual(previousNetworkState.ikPose[i].headPosePosition, hp) &&
        arraysAreEqual(previousNetworkState.ikPose[i].headPoseRotation, hr) &&
        arraysAreEqual(previousNetworkState.ikPose[i].leftPosePosition, lp) &&
        arraysAreEqual(previousNetworkState.ikPose[i].leftPoseRotation, lr) &&
        arraysAreEqual(previousNetworkState.ikPose[i].rightPosePosition, rp) &&
        arraysAreEqual(previousNetworkState.ikPose[i].rightPoseRotation, rr)
      ) {
        return true
      } else {
        return false
      }
    }
  }

  return false
}

export const queueUnchangedPoses = (world: World) => {
  const { currentNetworkState, previousNetworkState } = world

  const ents = networkTransformsQuery(world)
  for (let i = 0; i < ents.length; i++) {
    const entity = ents[i]
    const networkObject = getComponent(entity, NetworkObjectComponent)

    // only send poses if we are hosting (for now synonymous with server) or if we are the owner
    if (!world.isHosting || networkObject.userId !== Engine.userId) continue

    const transformComponent = getComponent(entity, TransformComponent)

    let vel = undefined! as number[]
    let angVel = undefined
    if (hasComponent(entity, VelocityComponent)) {
      const velC = getComponent(entity, VelocityComponent)
      if (isZero(velC.velocity) || velocityIsTheSame(previousNetworkState, networkObject.networkId, velC.velocity))
        vel = [0]
      else vel = encodeVector3(velC.velocity)
    }
    // const networkObjectOwnerComponent = getComponent(entity, NetworkObjectOwnerComponent)
    // networkObjectOwnerComponent && console.log('outgoing', getComponent(entity, NameComponent).name, transformComponent.position)
    // console.log('outgoing', getComponent(entity, NameComponent).name, transformComponent.position.toArray().concat(transformComponent.rotation.toArray()))
    if (
      !transformIsTheSame(
        previousNetworkState,
        networkObject.networkId,
        encodeVector3(transformComponent.position),
        encodeQuaternion(transformComponent.rotation),
        vel
      )
    )
      currentNetworkState.pose.push({
        networkId: networkObject.networkId,
        position: encodeVector3(transformComponent.position),
        rotation: encodeQuaternion(transformComponent.rotation),
        linearVelocity: vel !== undefined ? vel : [0],
        angularVelocity: angVel !== undefined ? angVel : [0]
      })
  }
  return world
}

// todo: move to client-specific system
export const queueUnchangedPosesForClient = (world) => {
  const { currentNetworkState, previousNetworkState } = world

  const networkComponent = getComponent(world.localClientEntity, NetworkObjectComponent)
  if (isClient && networkComponent) {
    const transformComponent = getComponent(world.localClientEntity, TransformComponent)
    let vel = undefined! as number[]
    let angVel = undefined
    if (hasComponent(world.localClientEntity, VelocityComponent)) {
      const velC = getComponent(world.localClientEntity, VelocityComponent)
      if (isZero(velC.velocity) || velocityIsTheSame(previousNetworkState, world.localClientEntity, velC.velocity))
        vel = [0]
      else vel = encodeVector3(velC.velocity)
    }

    if (
      !transformIsTheSame(
        previousNetworkState,
        networkComponent.networkId,
        encodeVector3(transformComponent.position),
        encodeQuaternion(transformComponent.rotation),
        vel
      )
    )
      currentNetworkState.pose.push({
        networkId: networkComponent.networkId,
        position: encodeVector3(transformComponent.position),
        rotation: encodeQuaternion(transformComponent.rotation),
        linearVelocity: vel !== undefined ? vel : [0],
        angularVelocity: angVel !== undefined ? angVel : [0]
      })
  }
  return world
}

export const queueUnchangedIkPoses = (world) => {
  const { currentNetworkState, previousNetworkState } = world

  const ents = ikTransformsQuery(world)
  for (let i = 0; i < ents.length; i++) {
    const entity = ents[i]

    const { networkId } = getComponent(entity, NetworkObjectComponent)

    const xrInputs = getComponent(entity, XRInputSourceComponent)

    const headPosePosition = encodeVector3(xrInputs.head.position)
    const headPoseRotation = encodeQuaternion(xrInputs.head.quaternion)
    const leftPosePosition = encodeVector3(xrInputs.controllerLeft.position)
    const leftPoseRotation = encodeQuaternion(xrInputs.controllerLeft.quaternion)
    const rightPosePosition = encodeVector3(xrInputs.controllerRight.position)
    const rightPoseRotation = encodeQuaternion(xrInputs.controllerRight.quaternion)

    if (
      !ikPoseIsTheSame(
        previousNetworkState,
        networkId,
        headPosePosition,
        headPoseRotation,
        leftPosePosition,
        leftPoseRotation,
        rightPosePosition,
        rightPoseRotation
      )
    )
      currentNetworkState.ikPose.push({
        networkId,
        headPosePosition,
        headPoseRotation,
        leftPosePosition,
        leftPoseRotation,
        rightPosePosition,
        rightPoseRotation
      })
  }
  return world
}

export const sendActions = (world) => {
  const { incomingActions, outgoingActions } = world

  // if hosting, forward all non-local incoming actions
  if (world.isHosting) {
    for (const incoming of incomingActions) {
      if (incoming.$from !== Engine.userId) {
        outgoingActions.add(incoming)
      }
    }
  }

  incomingActions.clear()

  for (const out of outgoingActions) {
    out.$from = out.$from ?? Engine.userId
    if (out.$from === Engine.userId && out.$to === 'local') {
      incomingActions.add(out as Required<Action>)
      outgoingActions.delete(out)
    }
    if (world.isHosting && out.$from === Engine.userId) {
      incomingActions.add(out as Required<Action>)
    }
  }
  Network.instance.transport?.sendActions(outgoingActions)

  outgoingActions.clear()
}

// prettier-ignore
export const queueAllOutgoingPoses = pipe(
  queueUnchangedPoses, 
  queueUnchangedPosesForClient, 
  queueUnchangedIkPoses
)

// prettier-ignore
export default async function OutgoingNetworkSystem(world: World): Promise<System> {
  /**
   * For the client, we only want to send out objects we have authority over,
   *   which are the local avatar and any owned objects
   * For the server, we want to send all objects
   */
  world.currentNetworkState = {
    tick: world.fixedTick,
    time: Date.now(),
    pose: [],
    ikPose: []
  }

  return () => {
    sendActions(world)

    if (Engine.offlineMode) return

    // reset old data
    world.currentNetworkState.tick = world.fixedTick
    world.currentNetworkState.time = Date.now()
    world.currentNetworkState.pose = []
    world.currentNetworkState.ikPose = []

    queueAllOutgoingPoses(world)

    try {
      const buffer = WorldStateModel.toBuffer(world.currentNetworkState)
      Network.instance.transport.sendData(buffer)
      world.previousNetworkState = world.currentNetworkState
    } catch (e) {
      console.log('could not convert world state to a buffer, ' + e)
    }
    
  }
}
