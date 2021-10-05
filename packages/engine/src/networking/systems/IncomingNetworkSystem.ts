import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { WorldStateModel } from '../schema/networkSchema'
import { incomingNetworkReceptor } from '../functions/incomingNetworkReceptor'
import { isEntityLocalClient } from '../functions/isEntityLocalClient'
import { isClient } from '../../common/functions/isClient'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { Engine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { decodeVector3, decodeQuaternion } from '@xrengine/common/src/utils/decode'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { pipe } from 'bitecs'

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
      // if (newWorldState.pose.length) console.log('new world state: ' + JSON.stringify(newWorldState))

      // todo: move to client-specific system
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
          console.warn(`Rejecting update for non-existing network object ${pose.networkId}`)
          continue
        }
        const networkComponent = getComponent(networkObjectEntity, NetworkObjectComponent)

        // don't apply state if this client has ownership
        const weHaveOwnership = networkComponent.userId === Engine.userId
        if (weHaveOwnership) continue

        // console.log(`Recieved update for network object ${pose.networkId}, ${JSON.stringify(getEntityComponents(world, networkObjectEntity))}`)

        if (hasComponent(networkObjectEntity, VelocityComponent)) {
          const velC = getComponent(networkObjectEntity, VelocityComponent)
          if (pose.linearVelocity.length === 1) velC.velocity.setScalar(0)
          else velC.velocity.copy(decodeVector3(pose.linearVelocity))
        }

        if (hasComponent(networkObjectEntity, ColliderComponent)) {
          const collider = getComponent(networkObjectEntity, ColliderComponent)
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

        if (hasComponent(networkObjectEntity, TransformComponent)) {
          const transformComponent = getComponent(networkObjectEntity, TransformComponent)
          transformComponent.position.copy(decodeVector3(pose.position))
          transformComponent.rotation.copy(decodeQuaternion(pose.rotation))
        }
        // }
      }
      // }

      for (let i = 0; i < newWorldState.ikPose.length; i++) {
        const ikPose = newWorldState.ikPose[i]

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
      console.log('could not process world state buffer, ' + e + ' ' + e.stack)
    }
  }

  return world
}

// prettier-ignore
export const applyIncomingNetworkState = pipe(
  applyDelayedActions, 
  applyIncomingActions,
  applyUnreliableQueue(Network.instance),
)

export default async function IncomingNetworkSystem(world: World): Promise<System> {
  world.receptors.add(incomingNetworkReceptor)
  return () => applyIncomingNetworkState(world)
}
