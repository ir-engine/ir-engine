import { getComponent, getMutableComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { handleInputOnClient } from '../../input/behaviors/handleInputOnClient';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { InputType } from '../../input/enums/InputType';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { Vault } from '../components/Vault';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { Interactor } from '../../interaction/components/Interactor';
import { Network } from '../components/Network';
import { initializeNetworkObject } from './initializeNetworkObject';
import { calculateInterpolation, addSnapshot } from '../functions/NetworkInterpolationFunctions';
import { WorldStateInterface } from "../interfaces/WorldState";
import { Quaternion, Vector3 } from "three";

export function applyNetworkStateToClient(worldStateBuffer:WorldStateInterface, delta = 0.033):void {
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
  for (const objectToCreateKey in worldState.createObjects) {
    // If we already have a network object with this network id, throw a warning and ignore this update
    if (Network.instance.networkObjects[worldState.createObjects[objectToCreateKey].networkId] !== undefined)
      console.warn("Not creating object because it already exists");
    else {
      const objectToCreate = worldState.createObjects[objectToCreateKey];
      let position = null;
      let rotation = null;
      if (
        typeof objectToCreate.x === 'number' ||
        typeof objectToCreate.y === 'number' ||
        typeof objectToCreate.z === 'number'
      ) {
        position = new Vector3( objectToCreate.x, objectToCreate.y, objectToCreate.z );
      }

      if (
        typeof objectToCreate.qX === 'number' ||
        typeof objectToCreate.qY === 'number' ||
        typeof objectToCreate.qZ === 'number' ||
        typeof objectToCreate.qW === 'number'
      ) {
        rotation = new Quaternion( objectToCreate.qX, objectToCreate.qY, objectToCreate.qZ, objectToCreate.qW );
      }

      initializeNetworkObject(
        String(objectToCreate.ownerId),
        parseInt(objectToCreate.networkId),
        objectToCreate.prefabType,
        position,
        rotation,
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
    console.warn("Entity is removed, but character imight not be");
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


  if(worldState.snapshot === undefined || worldState.snapshot.length < 1)
    return console.warn("Worldstate snapshot is null");

  addSnapshot(worldState.snapshot);


  const interpolationSnapshot = calculateInterpolation('x y z quat')

  if(interpolationSnapshot === undefined)
    return console.warn("interpolationSnapshot is null");

  // Update transforms

  interpolationSnapshot.state?.forEach((interpolationData, i) => {
    if(!Network.instance.networkObjects[interpolationData.networkId]){
      return console.warn("Network object not found in list: ", interpolationData.networkId);
    }

    // Get network component from data
    const networkComponent = Network.instance.networkObjects[interpolationData.networkId].component;
    const transform = getMutableComponent(networkComponent.entity, TransformComponent);

    if (hasComponent(networkComponent.entity, CharacterComponent)) {
      const actor = getMutableComponent<CharacterComponent>(networkComponent.entity, CharacterComponent as any);

      if (hasComponent(networkComponent.entity, Interactor)) {
        let offsetX = 0, offsetY = 0, offsetZ = 0;

        const playerSnapshot = Vault.instance.get(worldState.snapshot.time, true);
        if (playerSnapshot && playerSnapshot.older) {
          /*
          console.warn('serverTime');
          console.warn(worldState.snapshot.time);
          console.warn('playerSnapshot');
          console.warn(playerSnapshot.older.time);
*/
          offsetX = playerSnapshot.older.state[0].x - worldState.snapshot.state[i].x
          offsetY = playerSnapshot.older.state[0].y - worldState.snapshot.state[i].y
          offsetZ = playerSnapshot.older.state[0].z - worldState.snapshot.state[i].z
        }
        // we correct the position faster if the player moves
        const correction = 30
        // apply a step by step correction of the player's position
        actor.actorCapsule.body.position.set(
          actor.actorCapsule.body.position.x - (offsetX / correction),
          actor.actorCapsule.body.position.y - (offsetY / correction),
          actor.actorCapsule.body.position.z - (offsetZ / correction)
        )

      } else {
        // apply the interpolated values to you game objects
        actor.actorCapsule.body.position.set(
          interpolationData.x,
          interpolationData.y,
          interpolationData.z
        );
      }
    } else {
      transform.position.set(
        interpolationData.x,
        interpolationData.y,
        interpolationData.z
      );
    }
    // Apply rot to object
    transform.rotation.set(
      interpolationData.qX,
      interpolationData.qY,
      interpolationData.qZ,
      interpolationData.qW
    );

  });

}
