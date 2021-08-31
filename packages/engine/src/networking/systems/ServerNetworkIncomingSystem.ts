import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkClientInputInterface } from '../interfaces/WorldState'
import { ClientInputModel } from '../schema/clientInputSchema'
import { executeCommands } from '../functions/executeCommands'
import { defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeComponent } from '../../physics/components/ClientAuthoritativeComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'

export const ServerNetworkIncomingSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    // Create a new worldstate frame for next tick
    Network.instance.tick++

    // Set input values on server to values sent from clients
    // Parse incoming message queue
    while (Network.instance.incomingMessageQueueReliable.getBufferLength() > 0) {
      const buffer = Network.instance.incomingMessageQueueReliable.pop() as any

      let clientInput: NetworkClientInputInterface
      try {
        clientInput = ClientInputModel.fromBuffer(buffer)
      } catch (error) {
        console.warn('Unknown or corrupt data is entering the incoming server message stream', error, buffer)
        continue
      }
      if (!clientInput) continue

      if (Network.instance.networkObjects[clientInput.networkId] === undefined) {
        // console.error('Network object not found for networkId', clientInput.networkId);
        continue
      }

      const entity = Network.instance.networkObjects[clientInput.networkId].entity
      const avatar = getComponent(entity, AvatarComponent)

      if (!avatar) {
        console.log('input but no avatar...', entity, clientInput.networkId)
        continue
      }

      if (clientInput.commands.length > 0) {
        executeCommands(entity, clientInput.commands)
      }

      const transform = getComponent(entity, TransformComponent)
      transform.position.fromArray(clientInput.pose)
      transform.rotation.fromArray(clientInput.pose, 3)

      const xrInput = getComponent(entity, XRInputSourceComponent)
      if (xrInput) {
        if (clientInput.leftHand) {
          xrInput.head.position.fromArray(clientInput.head)
          xrInput.head.quaternion.fromArray(clientInput.head, 3)
        }
        if (clientInput.leftHand.length) {
          xrInput.controllerLeft.position.fromArray(clientInput.leftHand)
          xrInput.controllerLeft.quaternion.fromArray(clientInput.leftHand, 3)
        }
        if (clientInput.leftHand.length > 1) {
          xrInput.controllerRight.position.fromArray(clientInput.rightHand)
          xrInput.controllerRight.quaternion.fromArray(clientInput.rightHand, 3)
        }
      }

      for (const transform of clientInput.transforms) {
        const networkObject = Network.instance.networkObjects[transform.networkId]
        if (!networkObject) continue
        const clientAuthoritativeComponent = getComponent(networkObject.entity, ClientAuthoritativeComponent)
        if (
          networkObject &&
          clientAuthoritativeComponent &&
          clientAuthoritativeComponent.ownerNetworkId === clientInput.networkId
        ) {
          const transformComponent = getComponent(networkObject.entity, TransformComponent)
          if (transformComponent) {
            transformComponent.position.set(transform.x, transform.y, transform.z)
            transformComponent.rotation.set(transform.qX, transform.qY, transform.qZ, transform.qW)
          }
          const velocityComponent = getComponent(networkObject.entity, VelocityComponent)
          if (velocityComponent) {
            velocityComponent.velocity.set(transform.vX, transform.vY, transform.vZ)
          }
        }
      }
    }

    return world
  })
}
