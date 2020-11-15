import { getComponent, getMutableComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { handleInputOnClient } from '../../input/behaviors/handleInputOnClient';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { InputType } from '../../input/enums/InputType';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { initializeNetworkObject } from './initializeNetworkObject';

export function applyNetworkStateToClient(worldStateBuffer, delta = 0.033) {
  const worldState = worldStateBuffer; // worldStateModel.fromBuffer(worldStateBuffer);

  if (Network.tick < worldState.tick - 1) {
    // we dropped packets
    // Check how many
    // If our queue empty? Request immediately
    // Is our queue not empty? Inspect tick numbers
    // Did they fall in our range?
    // Send a request for the ones that didn't
  }

  Network.tick = worldState.tick;

  Network.instance.worldState = worldState;

  // Handle all clients that connected this frame
  for (const connectingClient in worldState.clientsConnected) {
    // Add them to our client list
    Network.instance.clients[worldState.clientsConnected[connectingClient].userId] = {
      userId: worldState.clientsConnected[connectingClient].userId
    };
    console.log(worldState.clientsConnected[connectingClient].userId, " connected");
  }

  // Handle all clients that disconnected this frame
  for (const disconnectingClient in worldState.clientsDisconnected) {
    if (worldState.clientsConnected[disconnectingClient] !== undefined) {
      // Remove them from our client list
      console.log(worldState.clientsConnected[disconnectingClient].userId, " disconnected");
      delete Network.instance.clients[worldState.clientsConnected[disconnectingClient].userId];
    } else {
      console.warn("Client disconnected but was not found in our client list");
    }
  }

  // Handle all network objects created this frame
  for (const objectToCreate in worldState.createObjects) {
    const networkId = Network.instance.networkObjects[worldState.createObjects[objectToCreate].networkId];
    // If we already have a network object with this network id, throw a warning and ignore this update
    if (networkId !== undefined) {
      console.warn("WARNING: Object with networkId", networkId, "already exists, but received create command in this frame");
    } else {
      initializeNetworkObject(
        worldState.createObjects[objectToCreate].ownerId,
        worldState.createObjects[objectToCreate].networkId,
        worldState.createObjects[objectToCreate].prefabType
      );
    }
  }

  // TODO: Re-enable for snapshot interpolation
  // if (worldState.transforms !== undefined && worldState.transforms.length > 0) {
  //   // Add world state to our snapshot vault
  //   addSnapshot(createSnapshot(worldState.transforms));
  //   // Interpolate it
  //   const snapshot = calculateInterpolation('x y z q(quat)');
  //   const { state } = snapshot;
  //   Network.instance.worldState.transforms = state;
  // }

  // Handle all network objects destroyed this frame
  for (const objectToDestroy in worldState.destroyObjects) {
    const networkId = worldState.destroyObjects[objectToDestroy].networkId;
    console.log("Destroying ", networkId)
    if (Network.instance.networkObjects[networkId] === undefined)
      return console.warn("Can't destroy object as it doesn't appear to exist")
    console.log("Destroying network object ", Network.instance.networkObjects[networkId].component.networkId);
    // get network object
    const entity = Network.instance.networkObjects[networkId].component.entity;
    // Remove the entity and all of it's components
    removeEntity(entity);
    console.warn("Entity is removed, but character might not be");
    // Remove network object from list
    delete Network.instance.networkObjects[networkId];
  }

  worldState.inputs?.forEach(inputData => {
    if (Network.instance === undefined)
    return console.warn("Network.instance undefined");

    if(Network.instance.networkObjects[inputData.networkId] === undefined)
      return console.warn("network object undefined, but inputs not");
    // Get network object with networkId
    const networkComponent = Network.instance.networkObjects[inputData.networkId].component;

    // Ignore input applied to local user input object that the client is currently controlling
    if(networkComponent.ownerId === Network.instance.userId) return; //  && hasComponent(networkComponent.entity, LocalInputReceiver)


    // Get input object attached
    const input = getComponent(networkComponent.entity, Input);

    // Clear current data
    input.data.clear();

    // Apply new input
    for (const button in inputData.buttons)
      input.data.set(inputData.buttons[button].input,
        {
          type: InputType.BUTTON,
          value: inputData.buttons[button].value,
          lifecycleState: inputData.buttons[button].lifecycleState
        });

    // Axis 1D input
    for (const axis in inputData.axes1d)
      input.data.set(inputData.axes1d[axis].input,
        {
          type: InputType.BUTTON,
          value: inputData.axes1d[axis].value,
          lifecycleState: inputData.axes1d[axis].lifecycleState
        });

    // Axis 2D input
    for (const axis in inputData.axes2d)
      input.data.set(inputData.axes2d[axis].input,
        {
          type: InputType.BUTTON,
          value: inputData.axes2d[axis].value,
          lifecycleState: inputData.axes2d[axis].lifecycleState
        });
  });

  // worldState.states?.forEach(stateData => {
  //   if (Network.instance.networkObjects[stateData.networkId] === undefined)
  //   return console.warn("network object undefined, but state is not not");
  // // Get network object with networkId
  // const networkComponent = Network.instance.networkObjects[stateData.networkId].component;

  // // Ignore state applied to local user input object that the client is currently controlling
  // if(networkComponent.ownerId === Network.instance.userId && hasComponent(networkComponent.entity, LocalInputReceiver))
  //   return;

  //   const state = getComponent(networkComponent.entity, State);

  //   console.warn("Setting state to ", stateData.states);
  //   stateData.data.set(stateData.states);
  //   console.log("stateData.data is now: ", stateData.states);
  // });

  if(worldState.transforms === undefined || worldState.transforms.length < 1)
    return console.warn("Worldstate transforms is null");

  // Update transforms
  worldState.transforms?.forEach(transformData => {
    if(!Network.instance.networkObjects[transformData.networkId]){
      return console.warn("Network object not found in list: ", transformData.networkId);
    }

    // Get network component from data
    const networkComponent = Network.instance.networkObjects[transformData.networkId].component;
    const transform = getMutableComponent(networkComponent.entity, TransformComponent);
    // Apply pos to object
    transform.position.set(
      transformData.x,
      transformData.y,
      transformData.z
    );
    // Apply rot to object
    transform.rotation.set(
      transformData.qX,
      transformData.qY,
      transformData.qZ,
      transformData.qW
    );
  });
}
