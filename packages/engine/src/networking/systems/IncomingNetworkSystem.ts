import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { incomingNetworkReceptor } from '../functions/incomingNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { NetworkObjectOwnerComponent } from '../components/NetworkObjectOwnerComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { decodeVector3, decodeQuaternion } from '@xrengine/common/src/utils/decode'
import { NameComponent } from '../../scene/components/NameComponent'

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  world.receptors.add(incomingNetworkReceptor)

  return () => {
    for (const action of Network.instance.incomingActions) {
      for (const receptor of world.receptors) receptor(action)
    }

    if (!isClient) {
      // Progress server to next tick
      Network.instance.tick++
    }

    const unreliableQueue = Network.instance.incomingMessageQueueUnreliable

    while (unreliableQueue.getBufferLength() > 0) {
      const buffer = unreliableQueue.pop()

      const userId = Network.instance.incomingMessageQueueUnreliableIDs.pop()

      // TODO: ensure networkId is always defined on Network.instance.clients instead of this
      const networkObj = Object.values(Network.instance.networkObjects).find((networkObject) => {
        return networkObject.uniqueId === userId
      })

      if (!isClient && !networkObj) return
      const incomingNetworkId = isClient ? 'server' : getComponent(networkObj.entity, NetworkObjectComponent).networkId
      //

      try {
        const newWorldState = WorldStateModel.fromBuffer(buffer)
        if (!newWorldState) return
        //console.log('new world state: ' + JSON.stringify(newWorldState))

        if (isClient) {
          //add velocity to player to check how it works and apply here the read of velocities
          Network.instance.tick = newWorldState.tick

          // on client, all incoming object poses handled by Interpolation
          if (newWorldState.pose.length) {
            let pos
            let rot

            const newServerSnapshot = createSnapshot(
              newWorldState.pose.map((pose) => {
                pos = decodeVector3(pose.position)
                rot = decodeQuaternion(pose.rotation)
                return {
                  networkId: pose.networkId,
                  x: pos.x,
                  y: pos.y,
                  z: pos.z,
                  qX: rot.x,
                  qY: rot.y,
                  qZ: rot.z,
                  qW: rot.w
                }
              })
            )
            newServerSnapshot.time = newWorldState.time
            Network.instance.snapshot = newServerSnapshot
            addSnapshot(newServerSnapshot)
          }
        } else {
          for (const pose of newWorldState.pose) {
            const networkObject = Network.instance.networkObjects[pose.networkId]
            if (!networkObject) continue

            if (hasComponent(networkObject.entity, AvatarComponent)) {
              if (hasComponent(networkObject.entity, AvatarControllerComponent)) continue
              const transformComponent = getComponent(networkObject.entity, TransformComponent)
              transformComponent.position.copy(decodeVector3(pose.position))
              transformComponent.rotation.copy(decodeQuaternion(pose.rotation))
              continue
            }

            if (hasComponent(networkObject.entity, VelocityComponent)) {
              const velC = getComponent(networkObj.entity, VelocityComponent)
              if (pose.linearVelocity.length === 1) velC.velocity.setScalar(0)
              else velC.velocity.copy(decodeVector3(pose.linearVelocity))
            }
            //get the angular velocity and apply if it has the appropriate component

            const networkObjectOwnerComponent = getComponent(networkObject.entity, NetworkObjectOwnerComponent)
            // console.log('incoming', getComponent(networkObject.entity, NameComponent).name, pose, networkObjectOwnerComponent?.networkId, incomingNetworkId)
            if (networkObjectOwnerComponent && networkObjectOwnerComponent.networkId === incomingNetworkId) {
              const transform = getComponent(networkObject.entity, TransformComponent)
              if (transform) {
                transform.position.copy(decodeVector3(pose.position))
                transform.rotation.copy(decodeQuaternion(pose.rotation))
              }
              const collider = getComponent(networkObject.entity, ColliderComponent)
              if (collider) {
                const pos = decodeVector3(pose.position)
                const rot = decodeQuaternion(pose.rotation)
                collider.body.setGlobalPose(
                  {
                    translation: { x: pos.x, y: pos.y, z: pos.z },
                    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w }
                  },
                  true
                )
              }
            }
          }
        }

        for (const ikPose of newWorldState.ikPose) {
          if (!Network.instance.networkObjects[ikPose.networkId]) continue
          const entity = Network.instance.networkObjects[ikPose.networkId].entity

          if (isEntityLocalClient(entity) || !hasComponent(entity, XRInputSourceComponent)) continue

          const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
          const {
            headPosePosition,
            headPoseRotation,
            leftPosePosition,
            leftPoseRotation,
            rightPosePosition,
            rightPoseRotation
          } = ikPose
          xrInputSourceComponent.head.position.copy(decodeVector3(headPosePosition))
          xrInputSourceComponent.head.quaternion.copy(decodeQuaternion(headPoseRotation))
          xrInputSourceComponent.controllerLeft.position.copy(decodeVector3(leftPosePosition))
          xrInputSourceComponent.controllerLeft.quaternion.copy(decodeQuaternion(leftPoseRotation))
          xrInputSourceComponent.controllerRight.position.copy(decodeVector3(rightPosePosition))
          xrInputSourceComponent.controllerRight.quaternion.copy(decodeQuaternion(rightPoseRotation))
        }
      } catch (e) {
        console.log('could not convert world state to a buffer, ' + e + ' ' + e.stack)
      }
    }
  }
}
