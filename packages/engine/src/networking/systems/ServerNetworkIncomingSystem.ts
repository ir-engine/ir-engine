import { isServer } from '../../common/functions/isServer';
import { System } from '../../ecs/classes/System';
import { addComponent, createEntity, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { cleanupInput } from '../../input/behaviors/cleanupInput';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Client } from '../components/Client';
import { Network } from '../components/Network';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { NetworkObject } from '../components/NetworkObject';
import { Server } from '../components/Server';
import { applyNetworkStateToClient } from '../functions/applyNetworkStateToClient';
import { handleInputFromNonLocalClients } from '../functions/handleInputOnServer';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { InputType } from '../../input/enums/InputType';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import _ from 'lodash';
import { NetworkClientInputInterface, NetworkInputInterface } from "../interfaces/WorldState";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { ClientInputModel } from '../schema/clientInputSchema';

/** Checks whether client object of NetworkInputInterface or not. */
const isClientNetworkInputInterface = (p: unknown): p is NetworkClientInputInterface => {
  return p.hasOwnProperty('networkId')
  && p.hasOwnProperty('snapShotTime')
  && p.hasOwnProperty('buttons')
  && p.hasOwnProperty('axes1d')
  && p.hasOwnProperty('axes2d')
  && p.hasOwnProperty('viewVector');
};

/** 
 * Handle client updates.
 * @param buffer Client input interface buffer.
 */
function handleUpdatesFromClients(buffer:NetworkClientInputInterface|Iterable<number>): void {
  let clientInput: NetworkClientInputInterface;

  if (isClientNetworkInputInterface(buffer)) {
    clientInput = buffer;
  } else {
    clientInput = ClientInputModel.fromBuffer(new Uint8Array(buffer).buffer);
  }

  if (Network.instance.networkObjects[clientInput.networkId] === undefined) {
    console.error('Network object not found for networkId', clientInput.networkId);
    return;
  }

  const actor = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, CharacterComponent);
  actor.viewVector.set(
    clientInput.viewVector.x,
    clientInput.viewVector.y,
    clientInput.viewVector.z
  );
  //console.warn(clientInput.snapShotTime);
  const networkObject = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, NetworkObject);
  networkObject.snapShotTime = clientInput.snapShotTime;
  // Get input component
  const input = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, Input);
  if (!input) {
    return;
  }

  // Clear current data
  input.data.clear();

  // Apply button input
  for (let i = 0; i < clientInput.buttons.length; i++)
    input.data.set(clientInput.buttons[i].input,
      {
        type: InputType.BUTTON,
        value: clientInput.buttons[i].value,
        lifecycleState: clientInput.buttons[i].lifecycleState
      });

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

}

/**
 * Add input of an entity to world.
 * @param entity Entity from which inputs will be taken.
 */
const addInputToWorldStateOnServer: Behavior = (entity: Entity) => {
  const input = getComponent(entity, Input);
  const networkId = getComponent(entity, NetworkObject).networkId;
  // If there's no input, don't send the frame, unless the last frame had input
  if (input.data.size < 1 && _.isEqual(input.data, input.lastData))
    return;

  const actor = getComponent(entity, CharacterComponent);

  // Create a schema for input to send
  const inputs:NetworkInputInterface = {
    networkId: networkId,
    buttons: [],
    axes1d: [],
    axes2d: [],
    viewVector: {
      x: actor.viewVector.x,
      y: actor.viewVector.y,
      z: actor.viewVector.z
    }
  };

  let numInputs;

  // Add all values in input component to schema
  input.data.forEach((value, key) => {
    switch (value.type) {
      case InputType.BUTTON:
        inputs.buttons.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
        numInputs++;
        break;
      case InputType.ONEDIM:
        if (value.lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes1d.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
          numInputs++;
        }
        break;
      case InputType.TWODIM:
        if (value.lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes2d.push({ input: key, value: value.value, lifecycleState: value.lifecycleState });
          numInputs++;
        }
        break;
      default:
        console.error("Input type has no network handler (maybe we should add one?)");
    }
  });

  // Add inputs to world state
  Network.instance.worldState.inputs.push(inputs);
};

/** System class to handle incoming messages. */
export class ServerNetworkIncomingSystem extends System {
  /** Input component of the system. */
  private _inputComponent: Input

  /** Update type of this system. **Default** to 
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;

  /** Indication of whether the system is on server or on client. */
  isServer;

  /**
   * Constructs the system.
   * @param attributes Attributes to be passed to super class constructor.
   */
  constructor(attributes: { schema: NetworkSchema, app:any }) {
    super(attributes);
    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);

    const { schema, app } = attributes;
    Network.instance.schema = schema;
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport(app);
    // Buffer model for worldState
  //  Network.instance.snapshotModel = new Model(snapshotSchema)

    this.isServer = Network.instance.transport.isServer;

    // Add a component so we can filter server and client queries
    addComponent(networkEntity, this.isServer ? Server : Client);

    // Initialize the server automatically - client is initialized in connectToServer
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
    }
  }

  /** Call execution on server */
  fixedExecuteOnServer = (delta: number): void => {
    // Create a new worldstate frame for next tick
    Network.tick++;
    Network.instance.worldState = {
      tick: Network.tick,
      transforms: [],
      inputs: [],
      states: [],
      clientsConnected: Network.instance.clientsConnected,
      clientsDisconnected: Network.instance.clientsDisconnected,
      createObjects: Network.instance.createObjects,
      destroyObjects: Network.instance.destroyObjects
    };

    if(Network.instance.createObjects.length >0){
      // console.log("Network.instance.createObjects is ", Network.instance.createObjects);
    }

    if(Network.instance.destroyObjects.length >0){
      // console.log("Network.instance.destroyObjects is ", Network.instance.destroyObjects);
    }

    Network.instance.clientsConnected = [];
    Network.instance.clientsDisconnected = [];
    Network.instance.createObjects = [];
    Network.instance.destroyObjects = [];
    // Set input values on server to values sent from clients
    // Parse incoming message queue
    while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
      const buffer = Network.instance.incomingMessageQueue.pop() as any;
      handleUpdatesFromClients(buffer);
      // Apply input for local user input onto client
      this.queryResults.inputOnServer.all?.forEach(entity => {
        // Call behaviors associated with input
        handleInputFromNonLocalClients(entity, {isLocal: false, isServer: true}, delta);
        addInputToWorldStateOnServer(entity);
        cleanupInput(entity);
      });
    }

    // Called when input component is added to entity
    this.queryResults.inputOnServer.added?.forEach(entity => {
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
    this.queryResults.inputOnServer.removed?.forEach(entity => {
      // Get component reference
      this._inputComponent = getComponent(entity, Input);

      // Call all behaviors in "onRemoved" of input map
      this._inputComponent?.schema?.onRemoved?.forEach(behavior => {
        behavior.behavior(entity, behavior.args);
      });
    });
  }

  /** Call execution on client */
  fixedExecuteOnClient = (delta: number): void => {
    if (Network.instance == null) return;
    // Client logic
    const queue = Network.instance.incomingMessageQueue;
    // For each message, handle and process
    while (queue.getBufferLength() > 0)
      applyNetworkStateToClient(queue.pop(), delta);
  }

  /** Call logic based on whether system is on the server or on the client. */
  execute = isServer ? this.fixedExecuteOnServer :
    this.fixedExecuteOnClient;

  /** Queries of the system. */
  static queries: any = {
    inputOnServer: {
      components: [NetworkObject, Input, Server],
      listen: {
        added: true,
        removed: true
      }
    },
    networkServer: {
      components: [Network, Server]
    },
    networkClient: {
      components: [Network, Client]
    },
    localClientNetworkInputReceivers: {
      components: [NetworkObject, Input, LocalInputReceiver]
    },
    serverNetworkStates: {
      components: [NetworkObject, State, Server]
    },
    serverNetworkTransforms: {
      components: [NetworkObject, TransformComponent, Server]
    },
    serverNetworkObjects: {
      components: [NetworkObject, Server]
    },
    serverNetworkInputs: {
      components: [NetworkObject, Input, Server]
    }
  }
}
