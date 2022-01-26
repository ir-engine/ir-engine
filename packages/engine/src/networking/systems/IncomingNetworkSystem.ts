import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { incomingNetworkReceptor } from '../functions/incomingNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { World } from '../../ecs/classes/World'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { pipe } from 'bitecs'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { Group } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { defaultAvatarHalfHeight } from '../../avatar/functions/createAvatar'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { deepEqual } from '../../common/functions/deepEqual'
import { Engine } from '../../ecs/classes/Engine'
import { validateNetworkObjects } from '../functions/validateNetworkObjects'
import { createDataReader } from '../serialization/AoS/DataReader'

export const applyUnreliableQueue = (networkInstance: Network) => (world: World) => {
  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = networkInstance

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    const buffer = incomingMessageQueueUnreliable.pop()
    const userId = incomingMessageQueueUnreliableIDs.pop() as UserId

    try {
      const newWorldState = WorldStateModel.fromBuffer(buffer)

      if (isClient) {
        world.fixedTick = Math.max(newWorldState.tick, world.fixedTick)
      }

      //add velocity to player to check how it works and apply here the read of velocities

      //  // on client, all incoming object poses handled by Interpolation
      //   if (newWorldState && newWorldState.pose.length) {
      //     let pos
      //     let rot

      //     const newServerSnapshot = createSnapshot(
      //       newWorldState.pose.map((pose) => {
      //         pos = decodeVector3(pose.position)
      //         rot = decodeQuaternion(pose.rotation)
      //         return {
      //           networkId: pose.networkId,
      //           x: pos.x,
      //           y: pos.y,
      //           z: pos.z,
      //           qX: rot.x,
      //           qY: rot.y,
      //           qZ: rot.z,
      //           qW: rot.w
      //         }
      //       })
      //     )
      //     newServerSnapshot.time = newWorldState.time
      //     Network.instance.snapshot = newServerSnapshot
      //     addSnapshot(newServerSnapshot)
      //   }
      // } else if (newWorldState) {
      for (let i = 0; i < newWorldState.pose.length; i++) {
        const pose = newWorldState.pose[i]

        const networkObjectEntity = world.getNetworkObject(pose.ownerId, pose.networkId)
        if (!networkObjectEntity) {
          console.warn(`Rejecting update for non-existing network object: ${pose.ownerId} ${pose.networkId}`)
          continue
        }

        // don't apply state if this client has ownership
        const weHaveOwnership = hasComponent(networkObjectEntity, NetworkObjectOwnedTag)
        if (weHaveOwnership) {
          // console.warn(`Received network update for entity that this client owns: ${pose.networkId}`)
          continue
        }

        // console.log(`Recieved update for network object ${pose.networkId}, ${JSON.stringify(getEntityComponents(world, networkObjectEntity))}`)

        if (hasComponent(networkObjectEntity, VelocityComponent)) {
          const velC = getComponent(networkObjectEntity, VelocityComponent)
          if (pose.linearVelocity.length === 1) velC.velocity.setScalar(0)
          else velC.velocity.fromArray(pose.linearVelocity)
        }

        if (hasComponent(networkObjectEntity, ColliderComponent)) {
          const isAvatar = hasComponent(networkObjectEntity, AvatarComponent)
          const collider = getComponent(networkObjectEntity, ColliderComponent)
          const pos = pose.position
          const rot = pose.rotation

          // TODO: Find a cleaner way to shift the avatar's capsule
          const yOffset = isAvatar ? defaultAvatarHalfHeight : 0

          collider.body.setGlobalPose(
            {
              translation: { x: pos[0], y: pos[1] + yOffset, z: pos[2] },
              rotation: { x: rot[0], y: rot[1], z: rot[2], w: rot[3] }
            },
            true
          )
        }

        if (hasComponent(networkObjectEntity, TransformComponent)) {
          const transformComponent = getComponent(networkObjectEntity, TransformComponent)
          transformComponent.position.fromArray(pose.position)
          transformComponent.rotation.fromArray(pose.rotation)
        }
        // }
      }
      // }

      for (let i = 0; i < newWorldState.controllerPose.length; i++) {
        const ikPose = newWorldState.controllerPose[i]

        const entity = world.getNetworkObject(ikPose.ownerId, ikPose.networkId)

        if (isEntityLocalClient(entity) || !hasComponent(entity, XRInputSourceComponent)) continue

        const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
        const {
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
        } = ikPose
        xrInputSourceComponent.head.position.fromArray(headPosePosition)
        xrInputSourceComponent.head.quaternion.fromArray(headPoseRotation)
        xrInputSourceComponent.controllerLeft.position.fromArray(leftRayPosition)
        xrInputSourceComponent.controllerLeft.quaternion.fromArray(leftRayRotation)
        xrInputSourceComponent.controllerRight.position.fromArray(rightRayPosition)
        xrInputSourceComponent.controllerRight.quaternion.fromArray(rightRayRotation)
        xrInputSourceComponent.controllerGripLeft.position.fromArray(leftGripPosition)
        xrInputSourceComponent.controllerGripLeft.quaternion.fromArray(leftGripRotation)
        xrInputSourceComponent.controllerGripRight.position.fromArray(rightGripPosition)
        xrInputSourceComponent.controllerGripRight.quaternion.fromArray(rightGripRotation)
      }

      for (const netHands of newWorldState.handsPose) {
        const entity = world.getNetworkObject(netHands.ownerId, netHands.networkId)
        if (isEntityLocalClient(entity) || !hasComponent(entity, XRHandsInputComponent)) continue

        const xrHandsComponent = getComponent(entity, XRHandsInputComponent)

        netHands.hands.forEach((data, i) => {
          const hand = xrHandsComponent.hands[i] as any

          if (!hand.joints) {
            hand.joints = {}
          }

          // Populate joints
          data.joints.forEach((j) => {
            if (!hand.joints[j.key]) {
              hand.joints[j.key] = new Group()
            }

            const joint = hand.joints[j.key] as Group
            joint.position.fromArray(j.position)
            joint.quaternion.fromArray(j.rotation)
          })
        })
      }
    } catch (e) {
      console.log('could not process world state buffer, ' + e + ' ' + e.stack)
    }
  }

  return world
}

export const applyUnreliableQueueFast = (networkInstance: Network, deserialize: Function) => (world: World) => {
  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = networkInstance

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    deserialize(world, packet)
  }
}

export default async function IncomingNetworkSystem(world: World) {
  const deserialize = createDataReader()

  // prettier-ignore
  const applyIncomingNetworkState = pipe(
    // applyUnreliableQueue(Network.instance),
    applyUnreliableQueueFast(Network.instance, deserialize),
  )

  const VALIDATE_NETWORK_INTERVAL = 300 // TODO: /** world.tickRate * 5 */

  return () => {
    if (!Engine.isInitialized) return
    applyIncomingNetworkState(world)
    if (Engine.userId === world.hostId && world.fixedTick % VALIDATE_NETWORK_INTERVAL === 0)
      validateNetworkObjects(world)
  }
}
