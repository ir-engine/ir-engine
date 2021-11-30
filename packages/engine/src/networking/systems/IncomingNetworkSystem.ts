import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { incomingNetworkReceptor } from '../functions/incomingNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { useEngine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { pipe } from 'bitecs'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { Group } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { avatarHalfHeight } from '../../avatar/functions/createAvatar'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'

export const applyDelayedActions = (world: World) => {
  const { delayedActions } = world

  for (const action of delayedActions) {
    if (action.$tick <= world.fixedTick) {
      console.log(`DELAYED ACTION ${action.type}`, action)
      delayedActions.delete(action)
      for (const receptor of world.receptors) {
        receptor(action)
      }
    }
  }

  return world
}

export const applyIncomingActions = (world: World) => {
  const { incomingActions, delayedActions } = world

  if (incomingActions.size) console.log(`Dispatching actions for simulation tick: ${world.fixedTick}`)

  for (const action of incomingActions) {
    if (action.$tick > world.fixedTick) {
      delayedActions.add(action)
      continue
    }
    if (action.$tick < world.fixedTick) {
      console.warn(`LATE ACTION ${action.type}`, action)
    } else {
      console.log(`ACTION ${action.type}`, action)
    }
    for (const receptor of world.receptors)
      try {
        receptor(action)
      } catch (e) {
        console.error(e)
        incomingActions.delete(action)
      }
  }

  return world
}

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

        const networkObjectEntity = world.getNetworkObject(pose.networkId)
        if (!networkObjectEntity) {
          console.warn(`Rejecting update for non-existing network object: ${pose.networkId}`)
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
          const yOffset = isAvatar ? avatarHalfHeight : 0

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

        const entity = world.getNetworkObject(ikPose.networkId)

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
        const entity = world.getNetworkObject(netHands.networkId)
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

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  // prettier-ignore
  const applyIncomingNetworkState = pipe(
    applyDelayedActions, 
    applyIncomingActions,
    applyUnreliableQueue(Network.instance),
  )

  world.receptors.push(incomingNetworkReceptor)

  return () => applyIncomingNetworkState(world)
}
