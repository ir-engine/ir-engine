import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType, SIXDOFType } from '../../common/types/NumericalTypes'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { DelegatedInputReceiverComponent } from '../../input/components/DelegatedInputReceiverComponent'
import { InputComponent } from '../../input/components/InputComponent'
import { InputType } from '../../input/enums/InputType'
import { InputValue } from '../../input/interfaces/InputValue'
import { InputAlias } from '../../input/types/InputAlias'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkClientInputInterface } from '../interfaces/WorldState'
import { ClientInputModel } from '../schema/clientInputSchema'
import { WorldStateModel } from '../schema/worldStateSchema'
import { GamePlayer } from '../../game/components/GamePlayer'
import { applyVelocity, sendSpawnGameObjects, sendState } from '../../game/functions/functionsState'
import { getGameFromName } from '../../game/functions/functions'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { Group, Vector3 } from 'three'
import { executeCommands } from '../functions/executeCommands'
import { ClientActionToServer } from '../../game/templates/DefaultGameStateAction'
import { updatePlayerRotationFromViewVector } from '../../avatar/functions/updatePlayerRotationFromViewVector'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeTagComponent } from '../../physics/components/ClientAuthoritativeTagComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

export function cancelAllInputs(entity) {
  getComponent(entity, InputComponent)?.data.forEach((value) => {
    value.lifecycleState = LifecycleValue.ENDED
  })
}

export const ServerNetworkIncomingSystem = async (): Promise<System> => {
  const delegatedInputRoutingQuery = defineQuery([DelegatedInputReceiverComponent])
  const delegatedInputRoutingAddQuery = enterQuery(delegatedInputRoutingQuery)
  const delegatedInputRoutingRemoveQuery = exitQuery(delegatedInputRoutingQuery)

  const networkObjectsWithInputQuery = defineQuery([DelegatedInputReceiverComponent])
  const networkObjectsWithInputAddQuery = enterQuery(networkObjectsWithInputQuery)
  const networkObjectsWithInputRemoveQuery = exitQuery(networkObjectsWithInputQuery)

  const networkClientInputXRQuery = defineQuery([DelegatedInputReceiverComponent])

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

      // TODO: Handle client incoming state actions
      // Are they host or not?
      // Validate against host or non/host actions
      // If action is valid, apply behavior for server
      // Game state updated = true

      // Outside of for loop, if game state updated is true, flag update world state

      // Add handlers to game state schema, valid requests should get added to the GameStateActions queue on the server

      if (Network.instance.networkObjects[clientInput.networkId] === undefined) {
        // console.error('Network object not found for networkId', clientInput.networkId);
        continue
      }

      const delegatedInputReceiver = getComponent(
        Network.instance.networkObjects[clientInput.networkId].entity,
        DelegatedInputReceiverComponent
      )
      const inputClientNetworkId = delegatedInputReceiver ? delegatedInputReceiver.networkId : clientInput.networkId
      const entity = Network.instance.networkObjects[clientInput.networkId].entity
      const entityInputReceiver = Network.instance.networkObjects[inputClientNetworkId].entity

      if (clientInput.clientGameAction.length > 0) {
        clientInput.clientGameAction.forEach((action) => {
          const playerComp = getComponent(entity, GamePlayer)
          if (playerComp === undefined) return
          if (action.type === ClientActionToServer[0]) {
            sendState(getGameFromName(playerComp.gameName), playerComp)
          } else if (action.type === ClientActionToServer[1]) {
            sendSpawnGameObjects(getGameFromName(playerComp.gameName), action.uuid)
          } else if (action.type === ClientActionToServer[2]) {
            applyVelocity(playerComp, action.velocity)
          }
        })
      }

      if (clientInput.commands.length > 0) {
        executeCommands(entity, clientInput.commands)
      }

      const avatar = getComponent(entity, AvatarComponent)

      if (avatar) {
        updatePlayerRotationFromViewVector(entity, clientInput.viewVector as Vector3)
      } else {
        console.log('input but no avatar...', entity, clientInput.networkId)
      }

      const userNetworkObject = getComponent(entity, NetworkObjectComponent)
      if (userNetworkObject != null) {
        userNetworkObject.snapShotTime = clientInput.snapShotTime
        if (userNetworkObject.snapShotTime > clientInput.snapShotTime) continue
      }

      // this snapShotTime which will be sent bac k to the client, so that he knows exactly what inputs led to the change and when it was.

      // Get input component
      const input = getComponent(entityInputReceiver, InputComponent)
      if (!input) {
        continue
      }
      // Clear current data
      input.data.clear()

      // Apply button input
      for (let i = 0; i < clientInput.buttons.length; i++) {
        input.data.set(clientInput.buttons[i].input, {
          type: InputType.BUTTON,
          value: clientInput.buttons[i].value,
          lifecycleState: clientInput.buttons[i].lifecycleState
        })
      }
      // Axis 1D input
      for (let i = 0; i < clientInput.axes1d.length; i++)
        input.data.set(clientInput.axes1d[i].input, {
          type: InputType.ONEDIM,
          value: clientInput.axes1d[i].value,
          lifecycleState: clientInput.axes1d[i].lifecycleState
        })

      // Axis 2D input
      for (let i = 0; i < clientInput.axes2d.length; i++)
        input.data.set(clientInput.axes2d[i].input, {
          type: InputType.TWODIM,
          value: clientInput.axes2d[i].value,
          lifecycleState: clientInput.axes2d[i].lifecycleState
        })

      // Axis 6DOF input
      for (let i = 0; i < clientInput.axes6DOF.length; i++) {
        input.data.set(clientInput.axes6DOF[i].input, {
          type: InputType.SIXDOF,
          value: clientInput.axes6DOF[i].value,
          lifecycleState: LifecycleValue.CONTINUED
        })
      }

      if (clientInput.axes6DOF.length && !hasComponent(entity, XRInputSourceComponent)) {
        addComponent(entity, XRInputSourceComponent, {
          controllerLeft: new Group(),
          controllerRight: new Group(),
          controllerGripLeft: new Group(),
          controllerGripRight: new Group(),
          controllerGroup: new Group(),
          head: new Group()
        })
      }

      // call input behaviors
      input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
        if (input.schema.behaviorMap.has(key)) {
          input.schema.behaviorMap.get(key)(entity, key, value, delta)
        }
      })

      for (const transform of clientInput.transforms) {
        const networkObject = Network.instance.networkObjects[transform.networkId]
        if (networkObject && hasComponent(networkObject.entity, ClientAuthoritativeTagComponent)) {
          const transformComponent = getComponent(networkObject.entity, TransformComponent)
          if (transformComponent) {
            transformComponent.position.set(transform.x, transform.y, transform.z)
            transformComponent.rotation.set(transform.qX, transform.qY, transform.qZ, transform.qW)
          }
        }
      }
    }

    // Apply input for local user input onto client
    for (const entity of networkObjectsWithInputQuery(world)) {
      //  const avatar = getComponent(entity, AvatarComponent);
      const input = getComponent(entity, InputComponent)

      input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
        // If the input is a button
        if (value.type === InputType.BUTTON) {
          // If the input exists on the input map (otherwise ignore it)
          if (value.lifecycleState === LifecycleValue.ENDED) {
            input.data.delete(key)
          }
        }
      })
    }

    for (const entity of networkObjectsWithInputAddQuery(world)) {
      const input = getComponent(entity, InputComponent)
      input.schema.onAdded(entity, delta)
    }

    for (const entity of networkObjectsWithInputRemoveQuery(world)) {
      const input = getComponent(entity, InputComponent, true)
      input.schema.onRemove(entity, delta)
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

    // Handle server input from client
    for (const entity of networkClientInputXRQuery(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

      const inputs = getComponent(entity, InputComponent)

      if (!inputs.data.has(BaseInput.XR_HEAD)) continue

      const head = inputs.data.get(BaseInput.XR_HEAD).value as SIXDOFType
      const left = inputs.data.get(BaseInput.XR_CONTROLLER_LEFT_HAND).value as SIXDOFType
      const right = inputs.data.get(BaseInput.XR_CONTROLLER_RIGHT_HAND).value as SIXDOFType

      xrInputSourceComponent.head.position.set(head.x, head.y, head.z)
      xrInputSourceComponent.head.quaternion.set(head.qX, head.qY, head.qZ, head.qW)

      xrInputSourceComponent.controllerLeft.position.set(left.x, left.y, left.z)
      xrInputSourceComponent.controllerLeft.quaternion.set(left.qX, left.qY, left.qZ, left.qW)

      xrInputSourceComponent.controllerRight.position.set(right.x, right.y, right.z)
      xrInputSourceComponent.controllerRight.quaternion.set(right.qX, right.qY, right.qZ, right.qW)
    }

    return world
  })
}
