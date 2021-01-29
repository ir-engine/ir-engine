import {Quaternion, Vector3} from "three";
import {getComponent, hasComponent, removeEntity} from '../../ecs/functions/EntityFunctions';
import {Input} from '../../input/components/Input';
import {LocalInputReceiver} from '../../input/components/LocalInputReceiver';
import {InputType} from '../../input/enums/InputType';
import {Network} from '../components/Network';
import {addSnapshot, createSnapshot} from '../functions/NetworkInterpolationFunctions';
import {WorldStateInterface} from "../interfaces/WorldState";
import {initializeNetworkObject} from './initializeNetworkObject';
import {CharacterComponent} from "../../templates/character/components/CharacterComponent";
import {handleInputFromNonLocalClients} from "./handleInputOnServer";
import { PrefabType } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";

let NetworkIdMyPlayer = null;

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

          //  if (objectToCreate.prefabType === PrefabType.worldObject) {

            initializeNetworkObject(
                String(objectToCreate.ownerId),
                objectToCreate.networkId,
                objectToCreate.prefabType,
                position,
                rotation,
            );

            if (objectToCreate.ownerId === Network.instance.userId) {
              NetworkIdMyPlayer = objectToCreate.networkId;
            };
        }
    }

    if (worldStateBuffer.transforms.length > 0) {
      const myPlayerTime = worldStateBuffer.transforms.find(v => v.networkId == NetworkIdMyPlayer);
      const newServerSnapshot = createSnapshot(worldStateBuffer.transforms)
      newServerSnapshot.time = myPlayerTime ? Number(myPlayerTime.snapShotTime): 0;
      Network.instance.snapshot = newServerSnapshot;
      addSnapshot(newServerSnapshot);
    }


    // Handle all network objects destroyed this frame
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
        if (Network.instance === undefined)
            return console.warn("Network.instance undefined");

        if (Network.instance.networkObjects[inputData.networkId] === undefined)
            return console.warn("network object undefined, but inputs not");
        // Get network object with networkId
        const networkComponent = Network.instance.networkObjects[inputData.networkId].component;

        // Ignore input applied to local user input object that the client is currently controlling
        if (networkComponent.ownerId === Network.instance.userId && hasComponent(networkComponent.entity, LocalInputReceiver)) return; //

        // set view vector
        const actor = getComponent(networkComponent.entity, CharacterComponent);
        actor.viewVector.set(
            inputData.viewVector.x,
            inputData.viewVector.y,
            inputData.viewVector.z,
        );

        // Get input object attached
        const input = getComponent(networkComponent.entity, Input);

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
                    type: InputType.BUTTON,
                    value: inputData.axes1d[i].value,
                    lifecycleState: inputData.axes1d[i].lifecycleState
                });

        // Axis 2D input
        for (let i = 0; i < inputData.axes2d.length; i++)
            input.data.set(inputData.axes2d[i].input,
                {
                    type: InputType.BUTTON,
                    value: inputData.axes2d[i].value,
                    lifecycleState: inputData.axes2d[i].lifecycleState
                });

        // handle inputs
        handleInputFromNonLocalClients(networkComponent.entity, {isLocal:false, isServer: false}, delta);
    });


    if (worldStateBuffer.transforms === undefined || worldStateBuffer.transforms.length < 1)
        return;// console.warn("Worldstate transforms is null");
}
