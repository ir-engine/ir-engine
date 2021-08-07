import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType, SIXDOFType } from '../../common/types/NumericalTypes'
import { System } from '../../ecs/classes/System'
import { addComponent, getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { DelegatedInputReceiver } from '../../input/components/DelegatedInputReceiver'
import { Input } from '../../input/components/Input'
import { InputType } from '../../input/enums/InputType'
import { InputValue } from '../../input/interfaces/InputValue'
import { InputAlias } from '../../input/types/InputAlias'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Network } from '../classes/Network'
import { NetworkObject } from '../components/NetworkObject'
import { NetworkClientInputInterface } from '../interfaces/WorldState'
import { ClientInputModel } from '../schema/clientInputSchema'
import { WorldStateModel } from '../schema/worldStateSchema'
import { GamePlayer } from '../../game/components/GamePlayer'
import { applyVelocity, sendSpawnGameObjects, sendState } from '../../game/functions/functionsState'
import { getGameFromName } from '../../game/functions/functions'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { Vector3 } from 'three'
import { executeCommands } from '../functions/executeCommands'
import { ClientActionToServer } from '../../game/templates/DefaultGameStateAction'
import { updatePlayerRotationFromViewVector } from '../../avatar/functions/updatePlayerRotationFromViewVector'

export function cancelAllInputs(entity) {
  getMutableComponent(entity, Input)?.data.forEach((value) => {
    value.lifecycleState = LifecycleValue.ENDED
  })
}
export class ServerNetworkIncomingSystem extends System {
  execute = (delta: number): void => {
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
        Network.instance.networkObjects[clientInput.networkId].component.entity,
        DelegatedInputReceiver
      )
      const inputClientNetworkId = delegatedInputReceiver ? delegatedInputReceiver.networkId : clientInput.networkId
      const entity = Network.instance.networkObjects[clientInput.networkId].component.entity
      const entityInputReceiver = Network.instance.networkObjects[inputClientNetworkId].component.entity

      if (clientInput.clientGameAction.length > 0) {
        clientInput.clientGameAction.forEach((action) => {
          const playerComp = getComponent<GamePlayer>(entity, GamePlayer)
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

      const avatar = getMutableComponent(entity, AvatarComponent)

      if (avatar) {
        updatePlayerRotationFromViewVector(entity, clientInput.viewVector as Vector3)
      } else {
        console.log('input but no avatar...', clientInput.networkId)
      }

      const userNetworkObject = getMutableComponent(entity, NetworkObject)
      if (userNetworkObject != null) {
        userNetworkObject.snapShotTime = clientInput.snapShotTime
        if (userNetworkObject.snapShotTime > clientInput.snapShotTime) continue
      }

      // this snapShotTime which will be sent bac k to the client, so that he knows exactly what inputs led to the change and when it was.

      // Get input component
      const input = getMutableComponent(entityInputReceiver, Input)
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
        addComponent(entity, XRInputSourceComponent)
      }

      // call input behaviors
      input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
        if (input.schema.behaviorMap.has(key)) {
          input.schema.behaviorMap.get(key)(entity, key, value, delta)
        }
      })
    }

    // Apply input for local user input onto client
    for (const entity of this.queryResults.networkObjectsWithInput.all) {
      //  const avatar = getMutableComponent(entity, AvatarComponent);
      const input = getMutableComponent(entity, Input)

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

    for (const entity of this.queryResults.networkObjectsWithInput.added) {
      const input = getComponent(entity, Input)
      input.schema.onAdded(entity, delta)
    }

    for (const entity of this.queryResults.networkObjectsWithInput.removed) {
      const input = getComponent(entity, Input, true)
      input.schema.onRemove(entity, delta)
    }

    for (const entity of this.queryResults.delegatedInputRouting.added) {
      const networkId = getComponent(entity, DelegatedInputReceiver).networkId
      if (Network.instance.networkObjects[networkId]) {
        cancelAllInputs(Network.instance.networkObjects[networkId].component.entity)
      }
      cancelAllInputs(entity)
    }
    for (const entity of this.queryResults.delegatedInputRouting.removed) {
      cancelAllInputs(entity)
    }

    // Handle server input from client
    for (const entity of this.queryResults.networkClientInputXR.all) {
      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent)

      const inputs = getMutableComponent(entity, Input)

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
  }

  /** Queries of the system. */
  static queries: any = {
    delegatedInputRouting: {
      components: [DelegatedInputReceiver],
      listen: {
        added: true,
        removed: true
      }
    },
    networkObjectsWithInput: {
      components: [NetworkObject, Input],
      listen: {
        added: true,
        removed: true
      }
    },
    networkClientInputXR: {
      components: [Input, XRInputSourceComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
