import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
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
import { decodeVector3, decodeQuaternion } from '@xrengine/common/src/utils/decode'
import { Action } from '../interfaces/Action'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  world.receptors.add(incomingNetworkReceptor)

  const delayedActions = new Set<Required<Action>>()

  return () => {
    const incomingActions = Engine.defaultWorld!.incomingActions

    if (incomingActions.size) console.log(`Dispatching actions for simulation tick: ${world.fixedTick}`)

    for (const action of delayedActions) {
      if (action.$tick <= world.fixedTick) {
        console.log(`DELAYED ACTION ${action.type}`, action)
        delayedActions.delete(action)
        for (const receptor of world.receptors) {
          receptor(action)
        }
      }
    }
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
      for (const receptor of world.receptors) receptor(action)
    }

    const unreliableQueue = Network.instance.incomingMessageQueueUnreliable

    while (unreliableQueue.getBufferLength() > 0) {
      const buffer = unreliableQueue.pop()

      const userId = Network.instance.incomingMessageQueueUnreliableIDs.pop() as UserId

      try {
        const newWorldState = WorldStateModel.fromBuffer(buffer)
        //console.log('new world state: ' + JSON.stringify(newWorldState))

        if (isClient) {
          world.fixedTick = newWorldState.tick
          //add velocity to player to check how it works and apply here the read of velocities

          // on client, all incoming object poses handled by Interpolation
          if (newWorldState && newWorldState.pose.length) {
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
        } else if (newWorldState) {
          for (const pose of newWorldState.pose) {
            const networkObjectEntity = world.getNetworkObject(pose.networkId)
            if (!networkObjectEntity) continue

            const networkComponent = getComponent(networkObjectEntity, NetworkObjectComponent)

            if (hasComponent(networkObjectEntity, AvatarComponent)) {
              if (hasComponent(networkObjectEntity, AvatarControllerComponent)) continue
              const transformComponent = getComponent(networkObjectEntity, TransformComponent)
              transformComponent.position.copy(decodeVector3(pose.position))
              transformComponent.rotation.copy(decodeQuaternion(pose.rotation))
              continue
            }

            if (hasComponent(networkObjectEntity, VelocityComponent)) {
              const velC = getComponent(networkObjectEntity, VelocityComponent)
              if (pose.linearVelocity.length === 1) velC.velocity.setScalar(0)
              else velC.velocity.copy(decodeVector3(pose.linearVelocity))
            }

            if (networkComponent.userId === userId) {
              const transform = getComponent(networkObjectEntity, TransformComponent)
              if (transform) {
                transform.position.copy(decodeVector3(pose.position))
                transform.rotation.copy(decodeQuaternion(pose.rotation))
              }
              const collider = getComponent(networkObjectEntity, ColliderComponent)
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
            // }
          }
        }

        for (const ikPose of newWorldState.ikPose) {
          const entity = world.getNetworkObject(ikPose.networkId)

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
