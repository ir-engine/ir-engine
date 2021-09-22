import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network, UserId } from '../classes/Network'
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { incomingNetworkReceptor } from '../functions/incomingNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { Engine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../../physics/components/VelocityComponent'

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  world.receptors.add(incomingNetworkReceptor)

  const delayedActions = []

  return () => {
    for (const action of Engine.defaultWorld!.incomingActions) {
      if (action.$tick > world.fixedTick) {
        delayedActions.push()
      }
      console.log(`\n\nACTION ${action.type}`, action, '\n\n')
      for (const receptor of world.receptors) receptor(action)
    }

    const unreliableQueue = Network.instance.incomingMessageQueueUnreliable

    while (unreliableQueue.getBufferLength() > 0) {
      const buffer = unreliableQueue.pop()

      const userId = Network.instance.incomingMessageQueueUnreliableIDs.pop() as UserId

      // TODO: ensure networkId is always defined on Network.instance.clients instead of this
      const ownerEntity = world.getUserAvatarEntity(userId)

      if (!isClient && !ownerEntity) return

      try {
        const newWorldState = WorldStateModel.fromBuffer(buffer)

        if (isClient) {
          //add velocity to player to check how it works and apply here the read of velocities

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
            const networkObjectEntity = world.getNetworkObject(pose.networkId)
            if (!networkObjectEntity) continue

            if (hasComponent(networkObjectEntity, AvatarComponent)) {
              if (hasComponent(networkObjectEntity, AvatarControllerComponent)) continue
              const transformComponent = getComponent(networkObjectEntity, TransformComponent)
              transformComponent.position.fromArray(pose.position)
              transformComponent.rotation.fromArray(pose.rotation)
              continue
            }

            if (hasComponent(networkObjectEntity, VelocityComponent)) {
              const velC = getComponent(networkObjectEntity, VelocityComponent)
              velC.velocity.fromArray(pose.linearVelocity)
            }
            //get the angular velocity and apply if it has the appropriate component

            // const networkObject = getComponent(networkObjectEntity, NetworkObjectComponent)
            // if (networkObject.userId === userId) {
            const transform = getComponent(networkObjectEntity, TransformComponent)
            if (transform) {
              transform.position.fromArray(pose.position)
              transform.rotation.fromArray(pose.rotation)
            }
            const collider = getComponent(networkObjectEntity, ColliderComponent)
            if (collider) {
              collider.body.updateTransform({
                translation: { x: pose.position[0], y: pose.position[1], z: pose.position[2] },
                rotation: { x: pose.rotation[0], y: pose.rotation[1], z: pose.rotation[2], w: pose.rotation[3] }
              })
            }
            // }
          }
        }

        for (const ikPose of newWorldState.ikPose) {
          const entity = world.getNetworkObject(ikPose.networkId)

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
