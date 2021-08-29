import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkClientInputInterface } from '../interfaces/WorldState'
import { ClientInputModel } from '../schema/clientInputSchema'
import { WorldStateModel } from '../schema/worldStateSchema'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { Group, Vector3 } from 'three'
import { executeCommands } from '../functions/executeCommands'
import { updatePlayerRotationFromViewVector } from '../../avatar/functions/updatePlayerRotationFromViewVector'
import { defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeComponent } from '../../physics/components/ClientAuthoritativeComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { XR6DOF } from '../../input/enums/InputEnums'

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
        try {
          WorldStateModel.fromBuffer(buffer)
          console.warn('Server is sending receiving its own outgoing messages...', error, buffer)
          continue
        } catch (error) {
          console.warn('Unknown or corrupt data is entering the incoming server message stream', error, buffer)
          continue
        }
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

      updatePlayerRotationFromViewVector(
        entity,
        new Vector3(clientInput.viewVector.x, clientInput.viewVector.y, clientInput.viewVector.z)
      )

      const userNetworkObject = getComponent(entity, NetworkObjectComponent)
      if (userNetworkObject != null) {
        userNetworkObject.snapShotTime = clientInput.snapShotTime
        if (userNetworkObject.snapShotTime > clientInput.snapShotTime) continue
      }

      // Get input component
      const inputComponent = getComponent(entity, InputComponent)
      if (!inputComponent) {
        continue
      }

      clientInput.data.forEach((data) => {
        // convert back any numbers to actual numbers - not a great solution but it works
        const num = Number(data.key)
        if (!Number.isNaN(num)) data.key = num

        const newDataState = new Map()

        const { key, value } = data
        if (inputComponent.schema.inputMap.has(key)) {
          newDataState.set(inputComponent.schema.inputMap.get(key), JSON.parse(JSON.stringify(value)))
        }

        inputComponent.data.push(newDataState)

        if (key === XR6DOF.HMD && !hasComponent(entity, XRInputSourceComponent)) {
          addComponent(entity, XRInputSourceComponent, {
            controllerLeft: new Group(),
            controllerRight: new Group(),
            controllerGripLeft: new Group(),
            controllerGripRight: new Group(),
            container: new Group(),
            head: new Group()
          })
        }
      })

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
