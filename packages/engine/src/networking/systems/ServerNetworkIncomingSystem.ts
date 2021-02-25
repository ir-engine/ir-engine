import _ from 'lodash';
import { BinaryValue } from '../../common/enums/BinaryValue';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { Input } from '../../input/components/Input';
import { BaseInput } from '../../input/enums/BaseInput';
import { InputType } from '../../input/enums/InputType';
import { InputValue } from '../../input/interfaces/InputValue';
import { InputAlias } from '../../input/types/InputAlias';
import { PlayerInCar } from '../../physics/components/PlayerInCar';
import { VehicleBody } from '../../physics/components/VehicleBody';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from "../../templates/character/components/CharacterComponent";
import { Network } from '../classes/Network';
import { NetworkObject } from '../components/NetworkObject';
import { handleInputFromNonLocalClients } from '../functions/handleInputOnServer';
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { NetworkClientInputInterface, NetworkInputInterface } from "../interfaces/WorldState";
import { ClientInputModel } from '../schema/clientInputSchema';

function switchInputs( clientInput ) {
  if (hasComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar)) {
    return getComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar).networkCarId;
  } else {
    return clientInput.networkId;
  }
}

/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

export function clearFreezeInputs( clientInput ) {

  let clearId = null;
  if (hasComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar)) {
    clearId = clientInput.networkId;
  } else {
    clearId = clientInput.switchInputs;
  }

  const input = getMutableComponent(Network.instance.networkObjects[clearId].component.entity, Input);
  // Clear current data
  input.data.clear();
  // Apply LifecycleValue.ENDED
  for (let i = 0; i < clientInput.buttons.length; i++)
    input.data.set(clientInput.buttons[i].input,
      {
        type: InputType.BUTTON,
        value: clientInput.buttons[i].value,
        lifecycleState: LifecycleValue.ENDED
      });

  // Axis 1D input
  for (let i = 0; i < clientInput.axes1d.length; i++)
    input.data.set(clientInput.axes1d[i].input,
      {
        type: InputType.ONEDIM,
        value: clientInput.axes1d[i].value,
        lifecycleState: LifecycleValue.ENDED
      });

  // Axis 2D input
  for (let i = 0; i < clientInput.axes2d.length; i++)
    input.data.set(clientInput.axes2d[i].input,
      {
        type: InputType.TWODIM,
        value: clientInput.axes2d[i].value,
        lifecycleState: LifecycleValue.ENDED
      });
}

const vehicleInputCheck = (clientInput): void => {
  const entity = Network.instance.networkObjects[clientInput.networkId].component.entity;
  if(!hasComponent(entity, PlayerInCar)) return;
  const playerInCar = getComponent(entity, PlayerInCar);
  const entityCar = Network.instance.networkObjects[playerInCar.networkCarId].component.entity;
  if(!hasComponent(entityCar, VehicleBody)) return;
  // its warns the car that a passenger or driver wants to get out
  for (let i = 0; i < clientInput.buttons.length; i++) {
    if (clientInput.buttons[i].input == 8) { // TO DO get interact button for every device
      const vehicle = getMutableComponent(entityCar, VehicleBody);
      for (let li = 0; li < vehicle.seatPlane.length; li++) {
        const driverId = vehicle[vehicle.seatPlane[li]];
        if (driverId == clientInput.networkId) {
          vehicle.wantsExit = [null, null];
          vehicle.wantsExit[li] = clientInput.networkId;
        }
      }
    }
  }
  const vehicle = getComponent(entityCar, VehicleBody);
  // its does not allow the passenger to drive the car
  if (vehicle.passenger == clientInput.networkId) {
    clientInput.buttons = clientInput.buttons.filter(buttons => buttons.input == 8); // TO DO get interact button for every device
  }

};

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

  const viewVector = { x: 0, y: 0, z: 0};
  const actor = getComponent(entity, CharacterComponent);
  if (actor) {
    viewVector.x = actor.viewVector.x
    viewVector.y = actor.viewVector.y
    viewVector.z = actor.viewVector.z
  }
  // Create a schema for input to send
  const inputs: NetworkInputInterface = {
    networkId: networkId,
    buttons: [],
    axes1d: [],
    axes2d: [],
    viewVector: {
      x: viewVector.x,
      y: viewVector.y,
      z: viewVector.z
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
  constructor(attributes: { schema: NetworkSchema, app: any }) {
    super(attributes);

    const { schema, app } = attributes;
    Network.instance.schema = schema;
    // Instantiate the provided transport (SocketWebRTCClientTransport / SocketWebRTCServerTransport by default)
    Network.instance.transport = new schema.transport(app);
    // Buffer model for worldState
    //  Network.instance.snapshotModel = new Model(snapshotSchema)

    this.isServer = Network.instance.transport.isServer;

    // Initialize the server automatically - client is initialized in connectToServer
    if (process.env.SERVER_MODE !== undefined && (process.env.SERVER_MODE === 'realtime' || process.env.SERVER_MODE === 'local')) {
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
    }
  }

  /** Call execution on server */
  execute = (delta: number): void => {
    // Create a new worldstate frame for next tick
    Network.tick++;
    Network.instance.worldState = {
      tick: Network.tick,
      time: 0,
      transforms: [],
      inputs: [],
      states: [],
      clientsConnected: Network.instance.clientsConnected,
      clientsDisconnected: Network.instance.clientsDisconnected,
      createObjects: Network.instance.createObjects,
      editObjects: Network.instance.editObjects,
      destroyObjects: Network.instance.destroyObjects
    };

    Network.instance.clientsConnected = [];
    Network.instance.clientsDisconnected = [];
    Network.instance.createObjects = [];
    Network.instance.editObjects = [];
    Network.instance.destroyObjects = [];
    // Set input values on server to values sent from clients
    // Parse incoming message queue
    while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
      const buffer = Network.instance.incomingMessageQueue.pop() as any;
      const clientInput: NetworkClientInputInterface = ClientInputModel.fromBuffer(buffer);

      if (Network.instance.networkObjects[clientInput.networkId] === undefined) {
        console.error('Network object not found for networkId', clientInput.networkId);
        return;
      }

      const actor = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, CharacterComponent);
      if (actor) {
        actor.viewVector.set(
          clientInput.viewVector.x,
          clientInput.viewVector.y,
          clientInput.viewVector.z
        );
      }
      // its warns the car that a passenger or driver wants to get out
      // and does not allow the passenger to drive the car
      vehicleInputCheck(clientInput);
      // this function change network id to which the inputs will be applied
      clientInput.switchInputs ? console.warn('switchInputs: '+ clientInput.switchInputs):'';
      clientInput.switchInputs ? clearFreezeInputs( clientInput ):'';

      const networkObject = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, NetworkObject);
      networkObject.snapShotTime = clientInput.snapShotTime;

      clientInput.networkId = switchInputs( clientInput );
      // this snapShotTime which will be sent bac k to the client, so that he knows exactly what inputs led to the change and when it was.

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

      // Apply input for local user input onto client
      this.queryResults.networkObjectsWithInput.all?.forEach(entity => {
        // Call behaviors associated with input
        handleInputFromNonLocalClients(entity, { isLocal: false, isServer: true }, delta);
        addInputToWorldStateOnServer(entity);
        const input = getMutableComponent(entity, Input);
        // Get input object attached
        const isWalking = (input.data.get(BaseInput.WALK)?.value) === BinaryValue.ON;
        actor.moveSpeed = isWalking ? WALK_SPEED : RUN_SPEED;

        // clean processed LifecycleValue.ENDED inputs
        input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
          if (value.type === InputType.BUTTON) {
            if (value.lifecycleState === LifecycleValue.ENDED) {
              input.data.delete(key);
            }
          }
        });
      });
    }

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
  }

  /** Queries of the system. */
  static queries: any = {
    networkObjectsWithInput: {
      components: [NetworkObject, Input],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
