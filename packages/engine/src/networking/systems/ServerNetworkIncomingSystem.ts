import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { getBit } from '../../common/functions/bitFunctions';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { DelegatedInputReceiver } from '../../input/components/DelegatedInputReceiver';
import { Input } from '../../input/components/Input';
import { InputType } from '../../input/enums/InputType';
import { InputValue } from '../../input/interfaces/InputValue';
import { InputAlias } from '../../input/types/InputAlias';
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { CHARACTER_STATES } from '../../character/state/CharacterStates';
import { initiateIK, stopIK } from '../../xr/functions/IKFunctions';
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { handleInputFromNonLocalClients } from '../functions/handleInputOnServer';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { NetworkClientInputInterface } from "../interfaces/WorldState";
import { ClientInputModel } from '../schema/clientInputSchema';
import { WorldStateModel } from '../schema/worldStateSchema';
import { GamePlayer } from '../../game/components/GamePlayer';
import { sendState } from '../../game/functions/functionsState';
import { StateEntity } from '../types/SnapshotDataTypes';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { isClient } from '../../common/functions/isClient';
import { getGameFromName } from '../../game/functions/functions';


// function switchInputs(clientInput) {
//   if (hasComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar)) {
//     return getComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar).networkCarId;
//   } else {
//     return clientInput.networkId;
//   }
// }


export function cancelAllInputs(entity) {
  getMutableComponent(entity, Input)?.data.forEach((value) => {
    value.lifecycleState = LifecycleValue.ENDED;
  })
}

const updateCharacterState = (entity: Entity, newState: number) => {
  const actor = getMutableComponent(entity, CharacterComponent);
  const stateChanges = newState ^ actor.state; // xor to get state changes
  if (getBit(stateChanges, CHARACTER_STATES.VR)) {
    // do server VR stuff for actor
    if (getBit(newState, CHARACTER_STATES.VR)) {
      initiateIK(entity)
    } else {
      stopIK(entity)
    }
  }
  actor.state = newState;
}

/** System class to handle incoming messages. */
export class ServerNetworkIncomingSystem extends System {
  /** Input component of the system. */
  private _inputComponent: Input

  /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;

  /**
   * Constructs the system.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: { schema: NetworkSchema, app: any }) {
    super(attributes);

    const { schema, app } = attributes;
    Network.instance.schema = schema;
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport(app);
    // Buffer model for worldState
    //  Network.instance.snapshotModel = new Model(snapshotSchema)

    this.isServer = !isClient;

    // Initialize the server automatically - client is initialized in connectToServer
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
    }
  }

  /** Call execution on server */
  execute = (delta: number): void => {
    // Create a new worldstate frame for next tick
    Network.instance.tick++;
    Network.instance.worldState = {
      tick: Network.instance.tick,
      time: 0,
      transforms: [],
      ikTransforms: [],
      inputs: [],
      clientsConnected: Network.instance.clientsConnected,
      clientsDisconnected: Network.instance.clientsDisconnected,
      createObjects: Network.instance.createObjects,
      editObjects: Network.instance.editObjects,
      destroyObjects: Network.instance.destroyObjects,
      gameState: Network.instance.gameState,//.length > 0 ? JSON.stringify(Network.instance.gameState) : [],
      gameStateActions: Network.instance.gameStateActions
    };

    Network.instance.clientsConnected = [];
    Network.instance.clientsDisconnected = [];
    Network.instance.createObjects = [];
    Network.instance.editObjects = [];
    Network.instance.destroyObjects = [];
    Network.instance.gameState = [];
    Network.instance.gameStateActions = [];

    // Set input values on server to values sent from clients
    // Parse incoming message queue
    while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
      const buffer = Network.instance.incomingMessageQueue.pop() as any;

      let clientInput: NetworkClientInputInterface;
      try {
        clientInput = ClientInputModel.fromBuffer(buffer);
      } catch (error) {
        try {
          WorldStateModel.fromBuffer(buffer)
          console.warn('Server is sending receiving its own outgoing messages...', error, buffer)
          return;
        } catch (error) {
          console.warn('Unknown or corrupt data is entering the incoming server message stream', error, buffer)
          return;
        }
      }
      if (!clientInput) return;

      // TODO: Handle client incoming state actions
      // Are they host or not?
      // Validate against host or non/host actions
      // If action is valid, apply behavior for server
      // Game state updated = true

      // Outside of for loop, if game state updated is true, flag update world state

      // Add handlers to game state schema, valid requests should get added to the GameStateActions queue on the server

      if (Network.instance.networkObjects[clientInput.networkId] === undefined) {
        console.error('Network object not found for networkId', clientInput.networkId);
        return;
      }

      if (clientInput.clientGameAction.length > 0) {
        clientInput.clientGameAction.forEach(action => {
          if (action.type === 'require') {
            const entity = Network.instance.networkObjects[clientInput.networkId].component.entity;
            const playerComp = getComponent<GamePlayer>(entity, GamePlayer);
            if (playerComp === undefined) return;
            sendState(getGameFromName(playerComp.gameName), playerComp);
          }
        })
      }

      const actor = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, CharacterComponent);

      if (actor) {
        actor.viewVector.set(
          clientInput.viewVector.x,
          clientInput.viewVector.y,
          clientInput.viewVector.z
        );
        updateCharacterState(Network.instance.networkObjects[clientInput.networkId].component.entity, clientInput.characterState);

      } else {
        console.log('input but no actor...', clientInput.networkId)
      }
      // its warns the car that a passenger or driver wants to get out
      // and does not allow the passenger to drive the car
      // vehicleInputCheck(clientInput);
      // this function change network id to which the inputs will be applied
      // clientInput.switchInputs ? console.warn('switchInputs: ' + clientInput.switchInputs) : '';
      // clientInput.switchInputs ? clearFreezeInputs(clientInput) : '';

      const networkObject = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, NetworkObject);
      networkObject.snapShotTime = clientInput.snapShotTime;
      if (networkObject.snapShotTime > clientInput.snapShotTime) return;
      // clientInput.networkId = switchInputs(clientInput);
      const delegatedInputReceiver = getComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, DelegatedInputReceiver);

      const inputClientNetworkId = delegatedInputReceiver ? delegatedInputReceiver.networkId : clientInput.networkId;
      // this snapShotTime which will be sent bac k to the client, so that he knows exactly what inputs led to the change and when it was.

      // Get input component
      const input = getMutableComponent(Network.instance.networkObjects[inputClientNetworkId].component.entity, Input);
      if (!input) {
        return;
      }
      // Clear current data
      input.data.clear();

      // Apply button input
      for (let i = 0; i < clientInput.buttons.length; i++) {
        input.data.set(clientInput.buttons[i].input,
          {
            type: InputType.BUTTON,
            value: clientInput.buttons[i].value,
            lifecycleState: clientInput.buttons[i].lifecycleState
          });
      }
      // Axis 1D input
      for (let i = 0; i < clientInput.axes1d.length; i++)
        input.data.set(clientInput.axes1d[i].input,
          {
            type: InputType.ONEDIM,
            value: clientInput.axes1d[i].value,
            lifecycleState: clientInput.axes1d[i].lifecycleState
          });

      // Axis 2D input
      for (let i = 0; i < clientInput.axes2d.length; i++)
        input.data.set(clientInput.axes2d[i].input,
          {
            type: InputType.TWODIM,
            value: clientInput.axes2d[i].value,
            lifecycleState: clientInput.axes2d[i].lifecycleState
          });

      // Axis 6DOF input
      for (let i = 0; i < clientInput.axes6DOF.length; i++) {
        input.data.set(clientInput.axes6DOF[i].input,
          {
            type: InputType.SIXDOF,
            value: {
              x: clientInput.axes6DOF[i].x,
              y: clientInput.axes6DOF[i].y,
              z: clientInput.axes6DOF[i].z,
              qX: clientInput.axes6DOF[i].qX,
              qY: clientInput.axes6DOF[i].qY,
              qZ: clientInput.axes6DOF[i].qZ,
              qW: clientInput.axes6DOF[i].qW,
            },
            lifecycleState: LifecycleValue.CONTINUED
          });
      }

      handleInputFromNonLocalClients(Network.instance.networkObjects[clientInput.networkId].component.entity, { isLocal: false, isServer: true }, delta);

      clientInput.transforms?.forEach((transform: StateEntity) => {
        const networkObject = Network.instance.networkObjects[transform.networkId];
        if(networkObject && networkObject.ownerId === Network.instance.clients[clientInput.networkId].userId) {
          const collider = getComponent(networkObject.component.entity, ColliderComponent)
          collider.body.updateTransform({
            translation: {
              x: transform.x,
              y: transform.y,
              z: transform.z,
            },
            rotation: {
              x: transform.qX,
              y: transform.qY,
              z: transform.qZ,
              w: transform.qW,
            }
          })
        }
      })
    }

    // Apply input for local user input onto client
    this.queryResults.networkObjectsWithInput.all?.forEach(entity => {
      //  const actor = getMutableComponent(entity, CharacterComponent);
      const input = getMutableComponent(entity, Input);

      input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
        // If the input is a button
        if (value.type === InputType.BUTTON) {
          // If the input exists on the input map (otherwise ignore it)
          if (value.lifecycleState === LifecycleValue.ENDED) {
            input.data.delete(key);
          }
        }
      });

      // Call behaviors associated with input
      //handleInputFromNonLocalClients(entity, { isLocal: false, isServer: true }, delta);
      // addInputToWorldStateOnServer(entity);
      //const input = getMutableComponent(entity, Input);
      // Get input object attached
    });

    // Called when input component is added to entity
    this.queryResults.networkObjectsWithInput.added?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);

      if (this._inputComponent === undefined)
        return console.warn("Tried to execute on a newly added input component, but it was undefined");
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.schema.onAdded?.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args });
      });
    });

    // Called when input component is removed from entity
    this.queryResults.networkObjectsWithInput.removed?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);

      // Call all behaviors in "onRemoved" of input map
      this._inputComponent?.schema?.onRemoved?.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
    });

    this.queryResults.delegatedInputRouting.added?.forEach((entity) => {
      const networkId = getComponent(entity, DelegatedInputReceiver).networkId
      if (Network.instance.networkObjects[networkId]) {
        cancelAllInputs(Network.instance.networkObjects[networkId].component.entity)
      }
      cancelAllInputs(entity)
    })
    this.queryResults.delegatedInputRouting.removed?.forEach((entity) => {
      cancelAllInputs(entity)
    })
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
    }
  }
}
