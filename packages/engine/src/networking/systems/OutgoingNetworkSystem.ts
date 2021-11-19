import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { World } from '../../ecs/classes/World'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { isZero } from '@xrengine/common/src/utils/mathUtils'
import { arraysAreEqual } from '@xrengine/common/src/utils/miscUtils'
import { Action } from '../interfaces/Action'
import { Changed, defineSerializer, pipe } from 'bitecs'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { NetworkTransport } from '../interfaces/NetworkTransport'
import { Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'

/***********
 * QUERIES *
 **********/

const networkTransformsQuery = defineQuery([NetworkObjectComponent, TransformComponent])
const ownedNetworkTransformsQuery = defineQuery([NetworkObjectOwnedTag, NetworkObjectComponent, TransformComponent])

const serialize = defineSerializer([NetworkObjectComponent, Changed(TransformComponent)])

const ikTransformsQuery = isClient
  ? defineQuery([AvatarControllerComponent, XRInputSourceComponent])
  : defineQuery([XRInputSourceComponent])

const xrHandsQuery = isClient
  ? defineQuery([AvatarControllerComponent, XRHandsInputComponent])
  : defineQuery([XRHandsInputComponent])

/*************
 * UTILITIES *
 ************/

function velocityIsTheSame(previousNetworkState, netId, vel): boolean {
  for (let i = 0; i < previousNetworkState.pose.length; i++) {
    if (previousNetworkState.pose[i].networkId === netId) {
      return arraysAreEqual(previousNetworkState.pose[i].angularVelocity, vel)
    }
  }

  return false
}
function transformIsTheSame(previousNetworkState, netId, pos, rot, vel): boolean {
  if (vel === undefined) vel = [0]
  for (let i = 0; i < previousNetworkState.pose.length; i++) {
    if (previousNetworkState.pose[i].networkId === netId) {
      return (
        arraysAreEqual(previousNetworkState.pose[i].position, pos) &&
        arraysAreEqual(previousNetworkState.pose[i].rotation, rot) &&
        arraysAreEqual(previousNetworkState.pose[i].linearVelocity, vel)
      )
    }
  }

  return false
}
function isControllerPoseTheSame(previousNetworkState, netId, hp, hr, lp, lr, rp, rr): boolean {
  for (let i = 0; i < previousNetworkState.controllerPose.length; i++) {
    if (previousNetworkState.controllerPose[i].networkId === netId) {
      return (
        arraysAreEqual(previousNetworkState.controllerPose[i].headPosePosition, hp) &&
        arraysAreEqual(previousNetworkState.controllerPose[i].headPoseRotation, hr) &&
        arraysAreEqual(previousNetworkState.controllerPose[i].leftRayPosition, lp) &&
        arraysAreEqual(previousNetworkState.controllerPose[i].leftRayRotation, lr) &&
        arraysAreEqual(previousNetworkState.controllerPose[i].rightRayPosition, rp) &&
        arraysAreEqual(previousNetworkState.controllerPose[i].rightRayRotation, rr)
      )
    }
  }

  return false
}

/************************
 * ACTION PREPROCESSING *
 ***********************/

export const forwardIncomingActionsFromOthersIfHost = (world: World) => {
  const { incomingActions, outgoingActions } = world

  if (world.isHosting) {
    for (const incoming of incomingActions) {
      // if incoming action is not from this client
      if (incoming.$from !== Engine.userId) {
        // forward it out
        outgoingActions.add(incoming)
      }
    }
  }

  incomingActions.clear()

  return world
}

export const rerouteOutgoingActionsBoundForSelf = (world: World) => {
  const { incomingActions, outgoingActions } = world

  for (const out of outgoingActions) {
    // if it's a forwarded action, use existing $from id
    // if not, use this client's userId
    out.$from = out.$from ?? Engine.userId
    // if action is from this client and going to this client
    if (out.$from === Engine.userId && out.$to === 'local') {
      // add action to incoming action and remove from outgoing actions
      // this prevents the action from leaving this client and applying itself to other connected clients' state
      incomingActions.add(out as Required<Action>)
      outgoingActions.delete(out)
    }
    // if client is hosting and action is from this client
    if (world.isHosting && out.$from === Engine.userId) {
      // add outgoing action to incoming action, but do not remove from outgoing actions
      // this applies the action to both this host and other connected clients' state
      incomingActions.add(out as Required<Action>)
    }
  }

  return world
}

// prettier-ignore
export const rerouteActions = pipe(
  forwardIncomingActionsFromOthersIfHost,
  rerouteOutgoingActionsBoundForSelf,
)

/***************
 * DATA QUEING *
 **************/

export const queueEntityTransform = (world: World, entity: Entity) => {
  const { outgoingNetworkState, previousNetworkState } = world

  const networkObject = getComponent(entity, NetworkObjectComponent)
  const transformComponent = getComponent(entity, TransformComponent)

  if (!networkObject || !transformComponent) return world

  let vel = undefined! as number[]
  let angVel = undefined
  if (hasComponent(entity, VelocityComponent)) {
    const velC = getComponent(entity, VelocityComponent)
    if (isZero(velC.velocity) || velocityIsTheSame(previousNetworkState, networkObject.networkId, velC.velocity))
      vel = [0]
    else vel = velC.velocity.toArray()
  }

  if (
    // if there is no previous state (first frame)
    previousNetworkState === undefined ||
    // or if the transform is not the same as last frame
    !transformIsTheSame(
      previousNetworkState,
      networkObject.networkId,
      transformComponent.position.toArray(),
      transformComponent.rotation.toArray(),
      vel
    )
  ) {
    outgoingNetworkState.pose.push({
      networkId: networkObject.networkId,
      position: transformComponent.position.toArray(),
      rotation: transformComponent.rotation.toArray(),
      linearVelocity: vel !== undefined ? vel : [0],
      angularVelocity: angVel !== undefined ? angVel : [0]
    })
  }

  return world
}

export const queueUnchangedPosesServer = (world: World) => {
  const ents = networkTransformsQuery(world)
  for (let i = 0; i < ents.length; i++) {
    queueEntityTransform(world, ents[i])
  }
  return world
}

// todo: move to client-specific system?
export const queueUnchangedPosesClient = (world: World) => {
  const ents = ownedNetworkTransformsQuery(world)
  for (let i = 0; i < ents.length; i++) {
    queueEntityTransform(world, ents[i])
  }
  return world
}

export const queueUnchangedControllerPoses = (world: World) => {
  const { outgoingNetworkState, previousNetworkState } = world

  for (const entity of ikTransformsQuery(world)) {
    const { networkId } = getComponent(entity, NetworkObjectComponent)

    const xrInputs = getComponent(entity, XRInputSourceComponent)

    const headPosePosition = xrInputs.head.position.toArray()
    const headPoseRotation = xrInputs.head.quaternion.toArray()

    const controllerLeft = isClient ? xrInputs.controllerLeft.parent! : xrInputs.controllerLeft
    const controllerRight = isClient ? xrInputs.controllerRight.parent! : xrInputs.controllerRight
    const controllerGripLeft = isClient ? xrInputs.controllerGripLeft.parent! : xrInputs.controllerGripLeft
    const controllerGripRight = isClient ? xrInputs.controllerGripRight.parent! : xrInputs.controllerGripRight

    const leftRayPosition = controllerLeft.position.toArray()
    const leftRayRotation = controllerLeft.quaternion.toArray()
    const rightRayPosition = controllerRight.position.toArray()
    const rightRayRotation = controllerRight.quaternion.toArray()
    const leftGripPosition = controllerGripLeft.position.toArray()
    const leftGripRotation = controllerGripLeft.quaternion.toArray()
    const rightGripPosition = controllerGripRight.position.toArray()
    const rightGripRotation = controllerGripRight.quaternion.toArray()

    if (
      // if there is no previous state (first frame)
      previousNetworkState === undefined ||
      // or if the transform is not the same as last frame
      !isControllerPoseTheSame(
        previousNetworkState,
        networkId,
        headPosePosition,
        headPoseRotation,
        leftRayPosition,
        leftRayRotation,
        rightRayPosition,
        rightRayRotation
      )
    ) {
      outgoingNetworkState.controllerPose.push({
        networkId,
        headPosePosition,
        headPoseRotation,
        leftRayPosition,
        leftRayRotation,
        rightRayPosition,
        rightRayRotation,
        leftGripPosition,
        leftGripRotation,
        rightGripPosition,
        rightGripRotation
      })
    }
  }
  return world
}

export const queueXRHandPoses = (world: World) => {
  const { outgoingNetworkState } = world

  for (const entity of xrHandsQuery(world)) {
    const { networkId } = getComponent(entity, NetworkObjectComponent)
    const xrHands = getComponent(entity, XRHandsInputComponent)
    const hands: any = [
      {
        joints: [] as any
      },
      {
        joints: [] as any
      }
    ]

    for (let xrHand of xrHands.hands) {
      const joints = (xrHand as any).joints
      if (!joints) continue

      const hand = hands[xrHand.userData.handedness == 'left' ? 0 : 1]

      for (const [key, value] of Object.entries(joints)) {
        const position = (value as Mesh).position.toArray()
        const rotation = (value as Mesh).quaternion.toArray()

        hand.joints.push({
          key,
          position,
          rotation
        })
      }
    }

    outgoingNetworkState.handsPose.push({
      networkId,
      hands
    })
  }

  return world
}

const initNetworkStates = (world: World) => {
  world.previousNetworkState = {
    tick: world.fixedTick,
    time: Date.now(),
    pose: [],
    controllerPose: [],
    handsPose: []
  }
  world.outgoingNetworkState = {
    tick: world.fixedTick,
    time: Date.now(),
    pose: [],
    controllerPose: [],
    handsPose: []
  }
  return world
}

export const resetNetworkState = (world: World) => {
  const { outgoingNetworkState, previousNetworkState } = world

  // copy previous state
  previousNetworkState.pose = outgoingNetworkState.pose
  previousNetworkState.controllerPose = outgoingNetworkState.controllerPose
  previousNetworkState.handsPose = outgoingNetworkState.handsPose

  // reset current state
  outgoingNetworkState.pose = []
  outgoingNetworkState.controllerPose = []
  outgoingNetworkState.handsPose = []

  return world
}

// prettier-ignore
export const queueAllOutgoingPoses = pipe(
  resetNetworkState,
  /**
   * For the client, we only want to send out objects we have authority over,
   *   which are the local avatar and any owned objects
   * For the server, we want to send all objects
   */
  isClient ? queueUnchangedPosesClient : queueUnchangedPosesServer,
  queueXRHandPoses,
  queueUnchangedControllerPoses
)

// prettier-ignore
export const queueAllOutgoingPosesSoA = pipe(
  /**
   * For the client, we only want to send out objects we have authority over,
   *   which are the local avatar and any owned objects
   * For the server, we want to send all objects
   */
  isClient ? queueUnchangedPosesClient : queueUnchangedPosesServer,
)

/****************
 * DATA SENDING *
 ***************/

const sendActionsOnTransport = (transport: NetworkTransport) => (world: World) => {
  const { outgoingActions } = world

  transport.sendActions(outgoingActions)

  outgoingActions.clear()

  return world
}

const sendDataOnTransport = (transport: NetworkTransport) => (data) => {
  try {
    transport.sendData(data)
  } catch (e) {
    console.error(e)
  }
}

export default async function OutgoingNetworkSystem(world: World): Promise<System> {
  const sendActions = sendActionsOnTransport(Network.instance.transport)
  const sendData = sendDataOnTransport(Network.instance.transport)

  const serializeAndSendNetworkTransforms = pipe(networkTransformsQuery, serialize, sendData)

  initNetworkStates(world)

  return () => {
    rerouteActions(world)

    // side effect - network IO
    try {
      sendActions(world)
    } catch (e) {
      console.error(e)
    }

    if (Engine.offlineMode) return

    serializeAndSendNetworkTransforms(world)

    // queueAllOutgoingPoses(world)

    // side effect - network IO
    // try {
    // const data = WorldStateModel.toBuffer(world.outgoingNetworkState)
    // sendData(data)
    // } catch (e) {
    //   console.error(e)
    // }
  }
}
