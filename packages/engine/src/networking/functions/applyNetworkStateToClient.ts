import { getComponent, getMutableComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { handleInput } from '../../input/behaviors/handleInput';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { InputType } from '../../input/enums/InputType';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { initializeNetworkObject } from './initializeNetworkObject';

export function applyNetworkStateToClient(worldStateBuffer, delta = 0.033) {
  const worldState = worldStateBuffer; // worldStateModel.fromBuffer(worldStateBuffer);
  if(worldState.clientsConnected.length > 0) {
    console.log("worldState.clientsConnected");
    console.log(worldState.clientsConnected);
  }

  // if(worldState.createObjects.length > 0) {
  //   console.log("worldState.networkObjects");
  //   console.log(worldState.createObjects);
  // }
  // // TODO: Validate if we've missed important frames
  // console.log("Old tick is",
  //   (NetworkInterpolation.instance.vault[NetworkInterpolation.instance.vaultSize].state as any).tick,
  //   " | new tick is ", worldState.tick);

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
    const objectKey = worldState.destroyObjects[objectToDestroy].networkId;
    if (Network.instance.networkObjects[objectKey] === undefined)
      return console.warn("Can't destroy object as it doesn't appear to exist")
    console.log("Destroying network object ", Network.instance.networkObjects[objectKey].component.networkId);
    // get network object
    const entity = Network.instance.networkObjects[objectKey].component.entity;
    // Remove the entity and all of it's components
    removeEntity(entity);
    // Remove network object from list
    delete Network.instance.networkObjects[objectKey];
  }

  worldState.inputs?.forEach(stateData => {
    if (Network.instance.networkObjects[stateData.networkId] === undefined)
      return console.warn("network object undefined, but inputs not");
    // Get network object with networkId
    const networkComponent = Network.instance.networkObjects[stateData.networkId].component;

    // Ignore input applied to local user input object that the client is currently controlling
    if(networkComponent.ownerId === Network.instance.userId && hasComponent(networkComponent.entity, LocalInputReceiver)) return;

    console.log("Setting input on ", networkComponent.ownerId)

    // Get input object attached
    const input = getComponent(networkComponent.entity, Input);

    // Clear current data
    input.data.clear();

    // Apply new input
    for (const button in stateData.buttons)
      input.data.set(stateData.buttons[button].input,
        {
          type: InputType.BUTTON,
          value: stateData.buttons[button].value,
          lifecycleState: stateData.buttons[button].lifeCycleState
        });

    // Axis 1D input
    for (const axis in stateData.axes1d)
      input.data.set(stateData.axes1d[axis].input,
        {
          type: InputType.BUTTON,
          value: stateData.axes1d[axis].value,
          lifecycleState: stateData.axes1d[axis].lifeCycleState
        });

    // Axis 2D input
    for (const axis in stateData.axes2d)
      input.data.set(stateData.axes2d[axis].input,
        {
          type: InputType.BUTTON,
          value: stateData.axes2d[axis].value,
          lifecycleState: stateData.axes2d[axis].lifeCycleState
        });

    // Call behaviors on map
    handleInput(networkComponent.entity, {}, delta);
  });

  if(Network.instance.worldState.transforms.length < 1)
    return

  // Update transforms
  Network.instance.worldState.transforms?.forEach(transformData => {
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
    console.log("Updated transform on ", transformData.networkId);
    console.log([transformData.x, transformData.y, transformData.z]);
  });
}
