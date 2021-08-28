import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { DelegatedInputReceiverComponent } from '../../input/components/DelegatedInputReceiverComponent'
import { InputComponent } from '../../input/components/InputComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkClientInputInterface } from '../interfaces/WorldState'
import { ClientInputModel } from '../schema/clientInputSchema'
import { WorldStateModel } from '../schema/worldStateSchema'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { Group, Vector3 } from 'three'
import { executeCommands } from '../functions/executeCommands'
import { updatePlayerRotationFromViewVector } from '../../avatar/functions/updatePlayerRotationFromViewVector'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeComponent } from '../../physics/components/ClientAuthoritativeComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { XR6DOF } from '../../input/enums/InputEnums'

export function cancelAllInputs(entity) {
  getComponent(entity, InputComponent)?.data.forEach((value) => {
    value.lifecycleState = LifecycleValue.ENDED
  })
}

export const ServerNetworkIncomingSystem = async (): Promise<System> => {
  const delegatedInputRoutingQuery = defineQuery([DelegatedInputReceiverComponent])
  const delegatedInputRoutingAddQuery = enterQuery(delegatedInputRoutingQuery)
  const delegatedInputRoutingRemoveQuery = exitQuery(delegatedInputRoutingQuery)

  const networkClientInputXRQuery = defineQuery([InputComponent, XRInputSourceComponent])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

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

      // const delegatedInputReceiver = getComponent(
      //   Network.instance.networkObjects[clientInput.networkId].entity,
      //   DelegatedInputReceiverComponent
      // )
      // const inputClientNetworkId = delegatedInputReceiver ? delegatedInputReceiver.networkId : clientInput.networkId
      const entity = Network.instance.networkObjects[clientInput.networkId].entity
      // const entityInputReceiver = Network.instance.networkObjects[inputClientNetworkId].entity

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

      inputComponent.prevData.clear()
      inputComponent.data.forEach((value, key) => {
        inputComponent.prevData.set(key, value)
      })

      clientInput.data.forEach((data) => {
        // convert back any numbers to actual numbers - not a great solution but it works
        const num = Number(data.key)
        if (!Number.isNaN(num)) data.key = num

        const { key, value } = data
        if (inputComponent.schema.inputMap.has(key)) {
          inputComponent.data.set(inputComponent.schema.inputMap.get(key), JSON.parse(JSON.stringify(value)))
        }

        if (key === XR6DOF.HMD && !hasComponent(entity, XRInputSourceComponent)) {
          addComponent(entity, XRInputSourceComponent, {
            controllerLeft: new Group(),
            controllerRight: new Group(),
            controllerGripLeft: new Group(),
            controllerGripRight: new Group(),
            controllerGroup: new Group(),
            head: new Group()
          })
        }
      })

      inputComponent.data.forEach((value, key) => {
        if (inputComponent.schema.behaviorMap.has(key)) {
          inputComponent.schema.behaviorMap.get(key)(entity, key, value, delta)
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

    for (const entity of delegatedInputRoutingAddQuery(world)) {
      const networkId = getComponent(entity, DelegatedInputReceiverComponent).networkId
      if (Network.instance.networkObjects[networkId]) {
        cancelAllInputs(Network.instance.networkObjects[networkId].entity)
      }
      cancelAllInputs(entity)
    }
    for (const entity of delegatedInputRoutingRemoveQuery(world)) {
      cancelAllInputs(entity)
    }

    for (const entity of networkClientInputXRQuery(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const inputComponent = getComponent(entity, InputComponent)

      if (!inputComponent.data.has(BaseInput.XR_HEAD)) continue

      const head = inputComponent.data.get(BaseInput.XR_HEAD).value
      const left = inputComponent.data.get(BaseInput.XR_CONTROLLER_LEFT_HAND).value
      const right = inputComponent.data.get(BaseInput.XR_CONTROLLER_RIGHT_HAND).value

      xrInputSourceComponent.head.position.set(head[0], head[1], head[2])
      xrInputSourceComponent.head.quaternion.set(head[3], head[4], head[5], head[6])

      xrInputSourceComponent.controllerLeft.position.set(left[0], left[1], left[2])
      xrInputSourceComponent.controllerLeft.quaternion.set(left[3], left[4], left[5], left[6])

      xrInputSourceComponent.controllerRight.position.set(right[0], right[1], right[2])
      xrInputSourceComponent.controllerRight.quaternion.set(right[3], right[4], right[5], right[6])
    }

    return world
  })
}
