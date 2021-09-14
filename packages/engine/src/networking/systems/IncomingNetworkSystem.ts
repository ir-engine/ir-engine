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

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  world.receptors.add(incomingNetworkReceptor)

  return () => {
    for (const action of Network.instance.incomingActions) {
      console.log(`\n\nACTION ${action.type}`, action, '\n\n')
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
          //add velocity to player to check how it works and apply here the read of velocities
          Network.instance.tick = newWorldState.tick

          // on client, all incoming object poses handled by Interpolation
          if (newWorldState.pose.length) {
            const newServerSnapshot = createSnapshot(
              newWorldState.pose.map((pose) => {
                return {
                  networkId: pose.networkId,
                  x: pose.position[0],
                  y: pose.position[1],
                  z: pose.position[2],
                  qX: pose.rotation[0],
                  qY: pose.rotation[1],
                  qZ: pose.rotation[2],
                  qW: pose.rotation[3]
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
              transformComponent.position.fromArray(pose.position)
              transformComponent.rotation.fromArray(pose.rotation)
              continue
            }

            if (hasComponent(networkObject.entity, VelocityComponent)) {
              const velC = getComponent(networkObj.entity, VelocityComponent)
              velC.velocity.fromArray(pose.linearVelocity)
            }
            //get the angular velocity and apply if it has the appropriate component

            const networkObjectOwnerComponent = getComponent(networkObject.entity, NetworkObjectOwnerComponent)
            // networkObjectOwnerComponent && console.log('incoming', getComponent(networkObject.entity, NameComponent).name, pose, networkObjectOwnerComponent?.networkId, incomingNetworkId)
            if (networkObjectOwnerComponent && networkObjectOwnerComponent.networkId === incomingNetworkId) {
              const transform = getComponent(networkObject.entity, TransformComponent)
              if (transform) {
                transform.position.fromArray(pose.position)
                transform.rotation.fromArray(pose.rotation)
              }
              const collider = getComponent(networkObject.entity, ColliderComponent)
              if (collider) {
                collider.body.updateTransform({
                  translation: { x: pose.position[0], y: pose.position[1], z: pose.position[2] },
                  rotation: { x: pose.rotation[0], y: pose.rotation[1], z: pose.rotation[2], w: pose.rotation[3] }
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
        console.log('could not convert world state to a buffer, ' + e + ' ' + e.stack)
      }
    }
  }
}
