import { createNetworkRigidBody } from '../../interaction/prefabs/NetworkRigidBody';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { createNetworkPlayer } from '../../templates/character/prefabs/NetworkPlayerCharacter';
import { createNetworkVehicle } from '../../templates/vehicle/prefabs/NetworkVehicle';
import { IKComponent } from "../../character/components/IKComponent";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { NetworkObjectUpdateSchema } from '../../templates/networking/NetworkObjectUpdateSchema';
import { initiateIK } from "../../xr/functions/IKFunctions";
import { Network } from '../classes/Network';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { WorldStateInterface } from "../interfaces/WorldState";
import { StateEntityIK } from "../types/SnapshotDataTypes";
import { PrefabType } from '../../templates/networking/PrefabType';
import { GameStateActionMessage, GameStateUpdateMessage } from '../../game/types/GameMessage';
import { applyActionComponent } from '../../game/functions/functionsActions';
import { applyStateToClient } from '../../game/functions/functionsState';

/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

function searchSameInAnotherId( objectToCreate ) {
  if (objectToCreate.prefabType === PrefabType.Player) {
    return Object.keys(Network.instance.networkObjects).map(Number).some( key => Network.instance.networkObjects[key]?.ownerId === objectToCreate.ownerId);
  } else {
    return Object.keys(Network.instance.networkObjects).map(Number).some( key => Network.instance.networkObjects[key]?.uniqueId === objectToCreate.uniqueId);
  }
}

function syncNetworkObjectsTest( createObjects ) {
  createObjects?.forEach((objectToCreate) => {
    if(!Network.instance.networkObjects[objectToCreate.networkId]) return;
    if (objectToCreate.uniqueId === Network.instance.networkObjects[objectToCreate.networkId]?.uniqueId &&
        objectToCreate.ownerId === Network.instance.networkObjects[objectToCreate.networkId]?.ownerId ) return;

    Object.keys(Network.instance.networkObjects).map(Number).forEach( key => {
      if (Network.instance.networkObjects[key].component == null) {
        console.warn('TRY RESTART SERVER, MAYBE ON SERVER DONT CREATE THIS LOCATION');
      }
      if(Network.instance.networkObjects[key].component.uniqueId === objectToCreate.uniqueId && Network.instance.networkObjects[key].component.ownerId === objectToCreate.ownerId) {
        console.warn('*createObjects* Correctiong networkObjects as a server id: '+objectToCreate.networkId+' and we now have id: '+key);
        const tempCorrect = Network.instance.networkObjects[key];
        const tempMistake = Network.instance.networkObjects[objectToCreate.networkId];
        Network.instance.networkObjects[key] = tempMistake;
        Network.instance.networkObjects[objectToCreate.networkId] = tempCorrect;
        getMutableComponent(Network.instance.networkObjects[key].component.entity, NetworkObject).networkId = key;
        getMutableComponent(Network.instance.networkObjects[objectToCreate.networkId].component.entity, NetworkObject).networkId = objectToCreate.networkId;
      }
    })
  })
}

function syncPhysicsObjects( objectToCreate ) {
  if(Object.keys(Network.instance.networkObjects).map(Number).every( key => Network.instance.networkObjects[key].ownerId != objectToCreate.ownerId)) {
    Object.keys(Network.instance.networkObjects).map(Number).forEach( key => {
      if(key === Number(objectToCreate.networkId)) {
        const tempCorrect = Network.instance.networkObjects[key];
        Network.instance.networkObjects[key] = undefined;
        const newId = Network.getNetworkId();
        Network.instance.networkObjects[newId] = tempCorrect;
        getMutableComponent(Network.instance.networkObjects[newId].component.entity, NetworkObject).networkId = newId;
      }
    })
  }
}

export function applyNetworkStateToClient(worldStateBuffer: WorldStateInterface, delta = 0.033): void {

    if (Network.tick < worldStateBuffer.tick - 1) {
        // we dropped packets
        // Check how many
        // If our queue empty? Request immediately
        // Is our queue not empty? Inspect tick numbers
        // Did they fall in our range?
        // Send a request for the ones that didn't
    }

    if (worldStateBuffer.transforms.length) {
      Network.tick = worldStateBuffer.tick
      Network.instance.worldState = worldStateBuffer
    }

    // Handle all clients that connected this frame
    for (const connectingClient in worldStateBuffer.clientsConnected) {
        // Add them to our client list
        const newClient = worldStateBuffer.clientsConnected[connectingClient];
        Network.instance.clients[newClient.userId] = {
            userId: newClient.userId,
            avatarDetail: newClient.avatarDetail,
        };
    }

    // Handle all clients that disconnected this frame
    for (const disconnectingClient in worldStateBuffer.clientsDisconnected) {
        if (worldStateBuffer.clientsConnected[disconnectingClient] !== undefined) {
            // Remove them from our client list
            console.log(worldStateBuffer.clientsConnected[disconnectingClient].userId, " disconnected");
            delete Network.instance.clients[worldStateBuffer.clientsConnected[disconnectingClient].userId];
        } else {
            console.warn("Client disconnected but was not found in our client list");
        }
    }
    // Game Manager Messages
    if (worldStateBuffer.gameState && worldStateBuffer.gameState.length > 0) {
      worldStateBuffer.gameState.forEach((stateMessage: GameStateUpdateMessage) => {
        if (Network.instance.userId === stateMessage.ownerId) { // DOTO: test, with and without
          console.warn('get message', stateMessage);
          applyStateToClient(stateMessage);
        }
      });
    }

    if (worldStateBuffer.gameStateActions && worldStateBuffer.gameStateActions.length > 0) {
      worldStateBuffer.gameStateActions.forEach((actionMessage: GameStateActionMessage) => applyActionComponent(actionMessage));
    }

    // Handle all network objects created this frame
    for (const objectToCreateKey in worldStateBuffer.createObjects) {
      const objectToCreate = worldStateBuffer.createObjects[objectToCreateKey];

      const isIdEmpty = Network.instance.networkObjects[objectToCreate.networkId] === undefined;
      const isIdFull = Network.instance.networkObjects[objectToCreate.networkId] != undefined;
      const isPlayerPref = objectToCreate.prefabType === PrefabType.Player;
      const isOtherPref = objectToCreate.prefabType != PrefabType.Player;
      const isSameOwnerId = isIdFull && Network.instance.networkObjects[objectToCreate.networkId].component.ownerId === objectToCreate.ownerId;
      const isSameUniqueId = isIdFull && Network.instance.networkObjects[objectToCreate.networkId].component.uniqueId === objectToCreate.uniqueId;

      if (( isPlayerPref && isSameOwnerId) || ( isOtherPref && isSameUniqueId)){
        console.warn('*createObjects* same object'+objectToCreate.networkId);
        continue;
      } else if(searchSameInAnotherId(objectToCreate)) {
        console.warn('*createObjects* same object but in anotherId '+objectToCreate.networkId);
        continue;
      } else if (isIdFull) {
        console.warn('*createObjects* dont have object but Id not empty '+objectToCreate.networkId);
        syncPhysicsObjects(objectToCreate);
      }

      if ( Network.instance.networkObjects[objectToCreate.networkId] === undefined && isPlayerPref ) {
        if ( objectToCreate.ownerId === Network.instance.userId && Network.instance.localAvatarNetworkId === undefined ) {
          createNetworkPlayer( objectToCreate );
        } else if (objectToCreate.ownerId != Network.instance.userId) {
          createNetworkPlayer( objectToCreate );
        }
      } else if (objectToCreate.prefabType === PrefabType.Vehicle ) {
        console.warn('*createObjects* creating space in networkObjects for futured object at id: '+objectToCreate.networkId);
        createNetworkVehicle({ networkId: objectToCreate.networkId, uniqueId: objectToCreate.uniqueId });
      } else if (objectToCreate.prefabType === PrefabType.RigidBody) {
        console.warn('*createObjects* creating space in networkObjects for futured object at id: '+objectToCreate.networkId);
        createNetworkRigidBody({ networkId: objectToCreate.networkId, uniqueId: objectToCreate.uniqueId });
      }
    }
    syncNetworkObjectsTest(worldStateBuffer.createObjects)


    //  it looks like if there is one player, we get 2 times a package with a transform.
    if (worldStateBuffer.transforms.length) {
      const myPlayerTime = worldStateBuffer.transforms.find(v => v.networkId == Network.instance.localAvatarNetworkId);
      const newServerSnapshot = createSnapshot(worldStateBuffer.transforms)
      // server correction, time when client send inputs
      newServerSnapshot.timeCorrection = myPlayerTime ? (myPlayerTime.snapShotTime + Network.instance.timeSnaphotCorrection) : 0;
      // interpolation, time when server send transforms
      newServerSnapshot.time = worldStateBuffer.time;
      Network.instance.snapshot = newServerSnapshot;
      addSnapshot(newServerSnapshot);
    }

    worldStateBuffer.ikTransforms?.forEach((ikTransform: StateEntityIK) => {
      if(!Network.instance.networkObjects[ikTransform.networkId]) return;
      const entity = Network.instance.networkObjects[ikTransform.networkId].component.entity;
      if(!hasComponent(entity, IKComponent)) {
        addComponent(entity, IKComponent);
      }
      const actor = getComponent(entity, CharacterComponent);
      const ikComponent = getMutableComponent(entity, IKComponent);
      if(!ikComponent.avatarIKRig && actor.modelContainer.children.length)  {
        initiateIK(entity)
      }
      if(ikComponent.avatarIKRig) {
        const { hmd, left, right } = ikTransform;
        ikComponent.avatarIKRig.inputs.hmd.position.set(hmd.x, hmd.y, hmd.z);
        ikComponent.avatarIKRig.inputs.hmd.quaternion.set(hmd.qX, hmd.qY, hmd.qZ, hmd.qW);
        ikComponent.avatarIKRig.inputs.leftGamepad.position.set(left.x, left.y, left.z);
        ikComponent.avatarIKRig.inputs.leftGamepad.quaternion.set(left.qX, left.qY, left.qZ, left.qW);
        ikComponent.avatarIKRig.inputs.rightGamepad.position.set(right.x, right.y, right.z);
        ikComponent.avatarIKRig.inputs.rightGamepad.quaternion.set(right.qX, right.qY, right.qZ, right.qW);
      }
    })

    worldStateBuffer.editObjects?.forEach((editObject) => {
      NetworkObjectUpdateSchema[editObject.type]?.forEach((element) => {
        element.behavior(editObject);
      })
    });

    // Handle all network objects destroyed this frame
    worldStateBuffer.destroyObjects?.forEach(({ networkId }) => {
      console.log("Destroying ", networkId);
      if (Network.instance.networkObjects[networkId] === undefined)
          return console.warn("Can't destroy object as it doesn't appear to exist");
      console.log("Destroying network object ", Network.instance.networkObjects[networkId].component.networkId);
      // get network object
      const entity = Network.instance.networkObjects[networkId].component.entity;
      // Remove the entity and all of it's components
      removeEntity(entity);
      console.warn("Entity is removed, but character imight not be");
      // Remove network object from list
      delete Network.instance.networkObjects[networkId];
    })

    worldStateBuffer.inputs?.forEach(inputData => {
      // Ignore input applied to local user input object that the client is currently controlling
      if (
        Network.instance.localAvatarNetworkId == null ||
        Network.instance.localAvatarNetworkId == inputData.networkId ||
        Network.instance.networkObjects[inputData.networkId] === undefined ||
        Network.instance.networkObjects[inputData.networkId].ownerId === 'server'
      ) return;
      // Get network object with networkId
      const networkComponent = Network.instance.networkObjects[inputData.networkId].component;
      //console.warn(inputData.networkId, Network.instance.networkObjects[inputData.networkId].ownerId);
      // Ignore input applied to local user input object that the client is currently controlling
      //if (networkComponent.ownerId === Network.instance.userId && hasComponent(networkComponent.entity, LocalInputReceiver)) return; //

      // set view vector
      const actor = getMutableComponent(networkComponent.entity, CharacterComponent);
      actor.viewVector.set(
          inputData.viewVector.x,
          inputData.viewVector.y,
          inputData.viewVector.z,
      );
      /*
      // Get input object attached
      const input = getComponent(networkComponent.entity, Input);
      const isWalking = (input.data.get(BaseInput.WALK)?.value) === BinaryValue.ON;
      actor.moveSpeed = isWalking ? WALK_SPEED : RUN_SPEED;

      // Clear current data
      input.data.clear();

      // Apply new input
      for (let i = 0; i < inputData.buttons.length; i++) {
          input.data.set(inputData.buttons[i].input,
              {
                  type: InputType.BUTTON,
                  value: inputData.buttons[i].value,
                  lifecycleState: inputData.buttons[i].lifecycleState
              });
      }

      // Axis 1D input
      for (let i = 0; i < inputData.axes1d.length; i++)
          input.data.set(inputData.axes1d[i].input,
              {
                  type: InputType.ONEDIM,
                  value: inputData.axes1d[i].value,
                  lifecycleState: inputData.axes1d[i].lifecycleState
              });

      // Axis 2D input
      for (let i = 0; i < inputData.axes2d.length; i++)
          input.data.set(inputData.axes2d[i].input,
              {
                  type: InputType.TWODIM,
                  value: inputData.axes2d[i].value,
                  lifecycleState: inputData.axes2d[i].lifecycleState
              });

      // handle inputs
      handleInputFromNonLocalClients(networkComponent.entity, {isLocal:false, isServer: false}, delta);
      */
    });
}
