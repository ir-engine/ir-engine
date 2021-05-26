import { createNetworkRigidBody } from '../../interaction/prefabs/NetworkRigidBody';
import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPlayer } from '../../character/prefabs/NetworkPlayerCharacter';
import { createNetworkVehicle } from '../../vehicle/prefabs/NetworkVehicle';
import { IKComponent } from '../../character/components/IKComponent';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { NetworkObjectUpdateSchema } from '../../networking/templates/NetworkObjectUpdateSchema';
import { initiateIK } from "../../xr/functions/IKFunctions";
import { Network } from '../classes/Network';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { WorldStateInterface } from "../interfaces/WorldState";
import { StateEntityIK } from "../types/SnapshotDataTypes";
import { PrefabType } from '../../networking/templates/PrefabType';
import { GameStateActionMessage, GameStateUpdateMessage } from '../../game/types/GameMessage';
import { applyActionComponent } from '../../game/functions/functionsActions';
import { applyStateToClient } from '../../game/functions/functionsState';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { System, SystemAttributes } from '../../ecs/classes/System';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { ClientNetworkSystem } from './ClientNetworkSystem';
import { ClientInputModel } from '../schema/clientInputSchema';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { Vault } from '../classes/Vault';

/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

function searchSameInAnotherId(objectToCreate) {
  if (objectToCreate.prefabType === PrefabType.Player) {
    return Object.keys(Network.instance.networkObjects).map(Number).some(key => Network.instance.networkObjects[key]?.ownerId === objectToCreate.ownerId);
  } else {
    return Object.keys(Network.instance.networkObjects).map(Number).some(key => Network.instance.networkObjects[key]?.uniqueId === objectToCreate.uniqueId);
  }
}

function syncNetworkObjectsTest(createObjects) {
  createObjects?.forEach((objectToCreate) => {
    if (!Network.instance.networkObjects[objectToCreate.networkId]) return;
    if (objectToCreate.uniqueId === Network.instance.networkObjects[objectToCreate.networkId]?.uniqueId &&
      objectToCreate.ownerId === Network.instance.networkObjects[objectToCreate.networkId]?.ownerId) return;

    Object.keys(Network.instance.networkObjects).map(Number).forEach(key => {
      if (Network.instance.networkObjects[key].component == null) {
        console.warn('TRY RESTART SERVER, MAYBE ON SERVER DONT CREATE THIS LOCATION');
      }
      if (Network.instance.networkObjects[key].component.uniqueId === objectToCreate.uniqueId && Network.instance.networkObjects[key].component.ownerId === objectToCreate.ownerId) {
        console.warn('*createObjects* Correctiong networkObjects as a server id: ' + objectToCreate.networkId + ' and we now have id: ' + key);
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

function syncPhysicsObjects(objectToCreate) {
  if (Object.keys(Network.instance.networkObjects).map(Number).every(key => Network.instance.networkObjects[key].ownerId != objectToCreate.ownerId)) {
    Object.keys(Network.instance.networkObjects).map(Number).forEach(key => {
      if (key === Number(objectToCreate.networkId)) {
        const tempCorrect = Network.instance.networkObjects[key];
        Network.instance.networkObjects[key] = undefined;
        const newId = Network.getNetworkId();
        Network.instance.networkObjects[newId] = tempCorrect;
        getMutableComponent(Network.instance.networkObjects[newId].component.entity, NetworkObject).networkId = newId;
      }
    })
  }
}

function createEmptyNetworkObjectBeforeSceneLoad(args: { networkId: number, prefabType: number, uniqueId: string }) {
  Network.instance.networkObjects[args.networkId] = {
    ownerId: 'server',
    prefabType: args.prefabType,
    component: null,
    uniqueId: args.uniqueId
  };
}


/** System class for network system of client. */
export class ClientNetworkStateSystem extends System {

  /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;
  receivedServerState = [];
  instance: ClientNetworkStateSystem;

  /**
   * Constructs the system. Adds Network Components, initializes transport and initializes server.
   * @param attributes SystemAttributes to be passed to super class constructor.
   */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    ClientNetworkStateSystem.instance = this;

    EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, ({ worldState }) => {
      this.receivedServerState.push(worldState);
    });
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, ({ worldState }) => {
      this.receivedServerState.push(worldState);
    })
    EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.RECEIVE_DATA, ({ unbufferedState, delta }) => {
      this.receivedServerState.push(unbufferedState);
    })
  }

  dispose() {
    EngineEvents.instance.removeAllListenersForEvent(ClientNetworkSystem.EVENTS.RECEIVE_DATA);
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.CONNECT_TO_WORLD);
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.JOINED_WORLD);
  }

  /**
   * Executes the system.
   * Call logic based on whether system is on the server or on the client.
   *
   * @param delta Time since last frame.
   */
  execute = (delta: number): void => {
    const receivedClientInput = [...this.receivedServerState];
    this.receivedServerState = [];
    receivedClientInput?.forEach((worldStateBuffer: WorldStateInterface) => {
      if (Network.instance.tick < worldStateBuffer.tick - 1) {
        // we dropped packets
        // Check how many
        // If our queue empty? Request immediately
        // Is our queue not empty? Inspect tick numbers
        // Did they fall in our range?
        // Send a request for the ones that didn't
      }

      if (worldStateBuffer.transforms.length) {
        Network.instance.tick = worldStateBuffer.tick
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
            console.log('get message', stateMessage);
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
        if(!Network.instance.schema.prefabs[objectToCreate.prefabType]) {
          console.log('prefabType not found', objectToCreate.prefabType)
          continue;
        }

        const isIdEmpty = Network.instance.networkObjects[objectToCreate.networkId] === undefined;
        const isIdFull = Network.instance.networkObjects[objectToCreate.networkId] != undefined;
        const isPlayerPref = objectToCreate.prefabType === PrefabType.Player;
        const isOtherPref = objectToCreate.prefabType != PrefabType.Player;
        const isSameOwnerId = isIdFull && Network.instance.networkObjects[objectToCreate.networkId].component.ownerId === objectToCreate.ownerId;
        const isSameUniqueId = isIdFull && Network.instance.networkObjects[objectToCreate.networkId].component.uniqueId === objectToCreate.uniqueId;

        if ((isPlayerPref && isSameOwnerId) || (isOtherPref && isSameUniqueId)) {
          console.log('*createObjects* same object' + objectToCreate.networkId);
          continue;
        } else if (searchSameInAnotherId(objectToCreate)) {
          console.log('*createObjects* same object but in anotherId ' + objectToCreate.networkId);
          continue;
        } else if (isIdFull) {
          console.log('*createObjects* dont have object but Id not empty ' + objectToCreate.networkId);
          syncPhysicsObjects(objectToCreate);
        }

        if (Network.instance.networkObjects[objectToCreate.networkId] === undefined && isPlayerPref) {
          if (objectToCreate.ownerId === Network.instance.userId && Network.instance.localAvatarNetworkId === undefined) {
            createNetworkPlayer(objectToCreate);
          } else if (objectToCreate.ownerId != Network.instance.userId) {
            createNetworkPlayer(objectToCreate);
          }
        } else {
          let parameters;
          try {
            parameters = JSON.parse(objectToCreate.parameters.replace(/'/g, '"'));
          } catch (e) { }
          if(parameters) {
            // we have parameters, so we should spawn the object in the world via the prefab type
            Network.instance.schema.prefabs[objectToCreate.prefabType].initialize({ ...objectToCreate, parameters });
          } else {
            // otherwise this is for an object loaded via the scene,
            // so we just create a skeleton network object while we wait for the scene to load
            createEmptyNetworkObjectBeforeSceneLoad(objectToCreate);
          }
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
        if (!Network.instance.networkObjects[ikTransform.networkId]) return;
        const entity = Network.instance.networkObjects[ikTransform.networkId].component.entity;
        if (!hasComponent(entity, IKComponent)) {
          addComponent(entity, IKComponent);
        }
        const actor = getComponent(entity, CharacterComponent);
        const ikComponent = getMutableComponent(entity, IKComponent);
        if (!ikComponent.avatarIKRig && actor.modelContainer.children.length) {
          initiateIK(entity)
        }
        if (ikComponent.avatarIKRig) {
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
        // console.log("Destroying ", networkId);
        if (Network.instance.networkObjects[networkId] === undefined)
          return console.warn("Can't destroy object as it doesn't appear to exist");
        // console.log("Destroying network object ", Network.instance.networkObjects[networkId].component.networkId);
        // get network object
        const entity = Network.instance.networkObjects[networkId].component.entity;
        // Remove the entity and all of it's components
        removeEntity(entity);
        // Remove network object from list
        delete Network.instance.networkObjects[networkId];
      })
    });

    function sendOnes() {
      let copy = [];
      if (Network.instance.clientGameAction.length > 0) {
        copy = Network.instance.clientGameAction;
        Network.instance.clientGameAction = [];
      }
      return copy;
    }

    const inputSnapshot = Vault.instance?.get();
    if (inputSnapshot !== undefined) {
      this.queryResults.localClientInput.all?.forEach((entity) => {
        const buffer = ClientInputModel.toBuffer(Network.instance.clientInputState);
        EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.SEND_DATA, buffer }, false, [buffer]);
        Network.instance.clientInputState = {
          networkId: Network.instance.localAvatarNetworkId,
          snapShotTime: inputSnapshot.time - Network.instance.timeSnaphotCorrection ?? 0,
          buttons: [],
          axes1d: [],
          axes2d: [],
          axes6DOF: [],
          viewVector: {
            x: 0, y: 0, z: 0
          },
          characterState: hasComponent(entity, CharacterComponent) ? getComponent(entity, CharacterComponent).state : 0,
          clientGameAction: sendOnes(),// Network.instance.clientGameAction,
          transforms: []
        }
      });
    }
  }


  /** Queries for the system. */
  static queries: any = {
    localClientInput: {
      components: [Input, LocalInputReceiver, CharacterComponent],
      listen: {
        added: true,
        removed: true
      }
    },
  }
}
