import {Quaternion, Vector3} from "three";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import {getComponent, removeComponent, addComponent, hasComponent, removeEntity, getMutableComponent} from '../../ecs/functions/EntityFunctions';
import {Input} from '../../input/components/Input';
import {LocalInputReceiver} from '../../input/components/LocalInputReceiver';
import {InputType} from '../../input/enums/InputType';
import {Network} from '../classes/Network';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import {addSnapshot, createSnapshot} from '../functions/NetworkInterpolationFunctions';
import {WorldStateInterface} from "../interfaces/WorldState";
import {initializeNetworkObject} from './initializeNetworkObject';
import {CharacterComponent, RUN_SPEED, WALK_SPEED} from "../../templates/character/components/CharacterComponent";
import {handleInputFromNonLocalClients} from "./handleInputOnServer";
import { PrefabType } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { AssetLoader } from '@xr3ngine/engine/src/assets/components/AssetLoader';
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { setState } from "@xr3ngine/engine/src/state/behaviors/setState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { BaseInput } from "../../input/enums/BaseInput";
/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

function syncPhysicsObjects( objectToCreate ) {
  for (let i = 0; i < Engine.entities.length; i++) {
    const entity = Engine.entities[i];
    if (hasComponent(entity, AssetLoader) && getComponent(entity, AssetLoader).entityIdFromScenaLoader && hasComponent(entity, NetworkObject)) {
      const localModelUniqueId = getComponent(entity, AssetLoader).entityIdFromScenaLoader.entityId;
      if (localModelUniqueId === objectToCreate.uniqueId) {
        if (getComponent(entity, NetworkObject).networkId !== objectToCreate.networkId) {
          getMutableComponent(entity, NetworkObject).networkId = objectToCreate.networkId
        }
      }
    }
  }

  for (let i = 0; i < Engine.entities.length; i++) {
    const entity = Engine.entities[i];
    if (hasComponent(entity, AssetLoader) && hasComponent(entity, NetworkObject)) {
      const id = getComponent(entity, NetworkObject).networkId;
      if (!Network.instance.networkObjects[id]) {
        if (objectToCreate.ownerId == 'server') {

          Network.instance.networkObjects[objectToCreate.networkId] = {
              ownerId: 'server',
              prefabType: PrefabType.worldObject, // All network objects need to be a registered prefab
              component: getComponent(entity, NetworkObject),
              uniqueId: objectToCreate.uniqueId
          };

        }
      }
    }
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

    Network.tick = worldStateBuffer.tick;

    Network.instance.worldState = worldStateBuffer;

    // Handle all clients that connected this frame
    for (const connectingClient in worldStateBuffer.clientsConnected) {
        // Add them to our client list
        Network.instance.clients[worldStateBuffer.clientsConnected[connectingClient].userId] = {
            userId: worldStateBuffer.clientsConnected[connectingClient].userId
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

    // Handle all network objects created this frame
    for (const objectToCreateKey in worldStateBuffer.createObjects) {
        // If we already have a network object with this network id, throw a warning and ignore this update
        if (Network.instance.networkObjects[worldStateBuffer.createObjects[objectToCreateKey].networkId] !== undefined)
            console.warn("Not creating object because it already exists");
        else {
            const objectToCreate = worldStateBuffer.createObjects[objectToCreateKey];
            let position = null;
            let rotation = null;
            if (
                typeof objectToCreate.x === 'number' ||
                typeof objectToCreate.y === 'number' ||
                typeof objectToCreate.z === 'number'
            ) {
                position = new Vector3(objectToCreate.x, objectToCreate.y, objectToCreate.z);
            }

            if (
                typeof objectToCreate.qX === 'number' ||
                typeof objectToCreate.qY === 'number' ||
                typeof objectToCreate.qZ === 'number' ||
                typeof objectToCreate.qW === 'number'
            ) {
                rotation = new Quaternion(objectToCreate.qX, objectToCreate.qY, objectToCreate.qZ, objectToCreate.qW);
            }

            if (objectToCreate.prefabType === PrefabType.worldObject) {
              // sync Physics Objects with server network id
              syncPhysicsObjects(objectToCreate)
            } else {
              initializeNetworkObject(
                  String(objectToCreate.ownerId),
                  objectToCreate.networkId,
                  objectToCreate.prefabType,
                  position,
                  rotation,
              );
              if (objectToCreate.ownerId === Network.instance.userId) {
                Network.instance.userNetworkId = objectToCreate.networkId;
              }
            }
            // for now, its for optimization

        }
    }

    if (worldStateBuffer.transforms.length > 0) {
      const myPlayerTime = worldStateBuffer.transforms.find(v => v.networkId == Network.instance.userNetworkId);
      const newServerSnapshot = createSnapshot(worldStateBuffer.transforms)
      newServerSnapshot.timeCorrection = myPlayerTime ? (myPlayerTime.snapShotTime + Network.instance.timeSnaphotCorrection) : 0;
      Network.instance.snapshot = newServerSnapshot;
      addSnapshot(newServerSnapshot);
    }


    // Handle all network objects destroyed this frame

    for (const editObjects in worldStateBuffer.editObjects) {
      const networkId = worldStateBuffer.editObjects[editObjects].networkId;
      const whoIsItFor = worldStateBuffer.editObjects[editObjects].whoIsItFor;
      if (Network.instance.userNetworkId != networkId || whoIsItFor == 'all') {
        if (Network.instance.networkObjects[networkId] === undefined)
            return console.warn("Can't Edit object, as it doesn't appear to exist");
        //console.log("Destroying network object ", Network.instance.networkObjects[networkId].component.networkId);
        // get network object

        const component = worldStateBuffer.editObjects[editObjects].component
        const state = worldStateBuffer.editObjects[editObjects].state
        const currentId = worldStateBuffer.editObjects[editObjects].currentId;
        const value = worldStateBuffer.editObjects[editObjects].value

        const entity = Network.instance.networkObjects[networkId].component.entity;

        if (state == 'onAddedEnding') {
          if (whoIsItFor == 'all' && Network.instance.userNetworkId == networkId) {
            removeComponent(entity, LocalInputReceiver);
            removeComponent(entity, FollowCameraComponent);
          }
          if (!hasComponent(entity, PlayerInCar)) {
            addComponent(entity, PlayerInCar, {
                state: state,
                networkCarId: currentId,
                currentFocusedPart: value
            });
          }
        }
        if (state == 'onStartRemove') {
          if (hasComponent(entity, PlayerInCar)) {
            getMutableComponent(entity, PlayerInCar).state = state;
          } else {
            console.warn(Network.instance.userNetworkId+' '+networkId+' hasNot PlayerInCar component');
          }
        }
      }
    }





    for (const objectToDestroy in worldStateBuffer.destroyObjects) {
        const networkId = worldStateBuffer.destroyObjects[objectToDestroy].networkId;
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
    }






    worldStateBuffer.inputs?.forEach(inputData => {
  //    console.warn(inputData);
/*
        if (Network.instance === undefined)
            return console.warn("Network.instance undefined");

        if (Network.instance.networkObjects[inputData.networkId] === undefined)
            return console.warn("network object undefined, but inputs not");
*/
        // Ignore input applied to local user input object that the client is currently controlling
        if (
          Network.instance.userNetworkId == null ||
          Network.instance.userNetworkId == inputData.networkId ||
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
    });

/*
    if (worldStateBuffer.transforms === undefined || worldStateBuffer.transforms.length < 1)
        return;// console.warn("Worldstate transforms is null");
        */
}
