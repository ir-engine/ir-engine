import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { addSnapshot, calculateInterpolation } from '../functions/NetworkInterpolationFunctions';
import { worldStateModel } from '../schema/worldStateSchema';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Input } from '../../input/components/Input';
import { handleInput } from '../../input/behaviors/handleInput';
import { InputType } from '../../input/enums/InputType';
import { createNetworkPrefab } from '../functions/createNetworkPrefab';
import { destroyNetworkObject } from '../functions/destroyNetworkObject';
import { NetworkInterpolation } from '../components/NetworkInterpolation';

export function applyWorldState(worldStateBuffer, delta = 0.000001, interpolate = true) {
  const worldState = worldStateModel.fromBuffer(worldStateBuffer);

  // // TODO: Validate if we've missed important frames
  // console.log("Old tick is",
  //   (NetworkInterpolation.instance.vault[NetworkInterpolation.instance.vaultSize].state as any).tick,
  //   " | new tick is ", worldState.tick);

  if(Network.tick < worldState.tick - 1){
    // we dropped packets
    // Check how many
    // If our queue empty? Request immediately
    // Is our queue not empty? Inspect tick numbers
    // Did they fall in our range?
    // Send a request for the ones that didn't
  }

  Network.tick = worldState.tick
  // Add world state to our snapshot vault
  addSnapshot(worldState);

  console.log("Adding network transforms to Network.instance");
  Network.instance.worldState = worldState;
  // Interpolate it
  if(interpolate) {
    const snapshot = calculateInterpolation('x y z q(quat)', 'transforms');
    console.log(snapshot)
    const { state } = snapshot
    Network.instance.worldState.transforms = state;
    }

  // Handle all clients that connected this frame
  for (const connectingClient in Network.instance.worldState.clientsConnected) {
    // Add them to our client list
    Network.instance.clients[worldState.clientsConnected[connectingClient].clientId] = {
      userId: worldState.clientsConnected[connectingClient].userId
    };
    console.log(worldState.clientsConnected[connectingClient].userId, " connected");
  }

  // Handle all clients that disconnected this frame
  for (const disconnectingClient in worldState.clientsDisconnected) {
    // Remove them from our client list
    console.log(worldState.clientsConnected[disconnectingClient].userId, " disconnected");
    delete Network.instance.clients[worldState.clientsConnected[disconnectingClient].clientId];
  }

  // Handle all network objects created this frame
  for (const objectToCreate in worldState.createObjects) {
    createNetworkPrefab(
      worldState.createObjects[objectToCreate].prefabType,
      worldState.createObjects[objectToCreate].ownerId,
      worldState.createObjects[objectToCreate].networkId
    );
    console.log("Created network prefab for " + worldState.createObjects[objectToCreate].ownerId);
  }

  // Handle all network objects destroyed this frame
  for (const objectToDestroy in worldState.destroyObjects)
    destroyNetworkObject(worldState.createObjects[objectToDestroy].networkId);

  worldState.inputs?.forEach(stateData => {

    // Get network object with networkId
    const networkComponent = Network.instance.networkObjects[stateData.networkId].component;
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

  // Update transforms
  Network.instance.worldState.transforms?.forEach(transformData => {
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
      transformData.q.x,
      transformData.q.y,
      transformData.q.z,
      transformData.q.w
    );
    console.log("Updated transform on ", transformData.networkId);
  });
}
