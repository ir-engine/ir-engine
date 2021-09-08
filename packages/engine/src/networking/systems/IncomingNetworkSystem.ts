import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { clientNetworkReceptor } from '../functions/clientNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { NetworkObjectOwnerComponent } from '../components/NetworkObjectOwnerComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'

export const IncomingNetworkSystem = async (world: World): Promise<System> => {
  if (isClient) world.receptors.add(clientNetworkReceptor)

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

        if (isClient) {
          Network.instance.tick = newWorldState.tick

          // on client, all incoming object poses handled by Interpolation
          if (newWorldState.pose.length) {
            const newServerSnapshot = createSnapshot(
              newWorldState.pose.map((pose) => {
                return {
                  networkId: pose.networkId,
                  x: pose.pose[0],
                  y: pose.pose[1],
                  z: pose.pose[2],
                  qX: pose.pose[3],
                  qY: pose.pose[4],
                  qZ: pose.pose[5],
                  qW: pose.pose[6]
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
              transformComponent.position.fromArray(pose.pose)
              transformComponent.rotation.fromArray(pose.pose, 3)
              continue
            }
            const networkObjectOwnerComponent = getComponent(networkObject.entity, NetworkObjectOwnerComponent)
            // networkObjectOwnerComponent && console.log('incoming', getComponent(networkObject.entity, NameComponent).name, pose, networkObjectOwnerComponent?.networkId, incomingNetworkId)
            if (networkObjectOwnerComponent && networkObjectOwnerComponent.networkId === incomingNetworkId) {
              const transform = getComponent(networkObject.entity, TransformComponent)
              if (transform) {
                transform.position.fromArray(pose.pose)
                transform.rotation.fromArray(pose.pose, 3)
              }
              const collider = getComponent(networkObject.entity, ColliderComponent)
              if (collider) {
                collider.body.updateTransform({
                  translation: { x: pose.pose[0], y: pose.pose[1], z: pose.pose[2] },
                  rotation: { x: pose.pose[3], y: pose.pose[4], z: pose.pose[5], w: pose.pose[6] }
                })
              }
            }
          }
        }

        for (const ikPose of newWorldState.ikPose) {
          if (!Network.instance.networkObjects[ikPose.networkId]) continue
          const entity = Network.instance.networkObjects[ikPose.networkId].entity

          if (isEntityLocalClient(entity) || !hasComponent(entity, XRInputSourceComponent)) continue

          const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
          const { headPose, leftPose, rightPose } = ikPose
          xrInputSourceComponent.head.position.fromArray(headPose)
          xrInputSourceComponent.head.quaternion.fromArray(headPose, 3)
          xrInputSourceComponent.controllerLeft.position.fromArray(leftPose)
          xrInputSourceComponent.controllerLeft.quaternion.fromArray(leftPose, 3)
          xrInputSourceComponent.controllerRight.position.fromArray(rightPose)
          xrInputSourceComponent.controllerRight.quaternion.fromArray(rightPose, 3)
        }
      } catch (e) {
        console.log('could not read world state from buffer')
      }
    }
  }
}
