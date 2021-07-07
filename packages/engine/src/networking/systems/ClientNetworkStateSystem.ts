import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPlayer } from '../../character/prefabs/NetworkPlayerCharacter';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { NetworkObjectUpdateSchema } from '../templates/NetworkObjectUpdateSchema';
import { Network } from '../classes/Network';
import { addSnapshot, createSnapshot } from '../functions/NetworkInterpolationFunctions';
import { TransformStateInterface, WorldStateInterface } from "../interfaces/WorldState";
import { StateEntity, StateEntityIK } from "../types/SnapshotDataTypes";
import { PrefabType } from '../templates/PrefabType';
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
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { Engine } from '../../ecs/classes/Engine';
import { Quaternion, Vector3 } from 'three';
import { applyVectorMatrixXZ } from '../../common/functions/applyVectorMatrixXZ';
import { XRInputSourceComponent } from '../../character/components/XRInputSourceComponent';

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
    uniqueId: args.uniqueId,
    parameters: ''
  };
}

const vector3_0 = new Vector3();
const vector3_1 = new Vector3();
const quat = new Quaternion();
const forwardVector = new Vector3(0, 0, 1);

/** System class for network system of client. */
export class ClientNetworkStateSystem extends System {

  /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
  updateType = SystemUpdateType.Fixed;
  receivedServerWorldState: WorldStateInterface[] = [];
  receivedServerTransformState: TransformStateInterface[] = [];
  static instance: ClientNetworkStateSystem;

  /**
   * Constructs the system. Adds Network Components, initializes transport and initializes server.
   * @param attributes SystemAttributes to be passed to super class constructor.
   */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    ClientNetworkStateSystem.instance = this;

    EngineEvents.instance.once(EngineEvents.EVENTS.CONNECT_TO_WORLD, ({ worldState }) => {
      this.receivedServerWorldState.push(worldState);
    });
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, ({ worldState }) => {
      this.receivedServerWorldState.push(worldState);
    })
    EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.RECEIVE_DATA_RELIABLE, ({ worldState, delta }) => {
      this.receivedServerWorldState.push(worldState);
    })
    EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.RECEIVE_DATA_UNRELIABLE, ({ transformState, delta }) => {
      this.receivedServerTransformState.push(transformState);
    })
  }

  dispose() {
    EngineEvents.instance.removeAllListenersForEvent(ClientNetworkSystem.EVENTS.RECEIVE_DATA_RELIABLE);
    EngineEvents.instance.removeAllListenersForEvent(ClientNetworkSystem.EVENTS.RECEIVE_DATA_UNRELIABLE);
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

    if(this.receivedServerWorldState.length > 0) {
      const receivedWorldState = [...this.receivedServerWorldState];
      this.receivedServerWorldState = [];
      receivedWorldState?.forEach((worldState: WorldStateInterface) => {

        // Handle all clients that connected this frame
        for (const connectingClient in worldState.clientsConnected) {
          // Add them to our client list
          const newClient = worldState.clientsConnected[connectingClient];
          Network.instance.clients[newClient.userId] = {
            userId: newClient.userId,
            avatarDetail: newClient.avatarDetail,
          };
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

          const objectToCreate = worldState.createObjects[objectToCreateKey];
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
            Network.instance.networkObjects[objectToCreate.networkId] = Network.instance.networkObjects[Network.instance.localAvatarNetworkId];
            Network.instance.networkObjects[Network.instance.localAvatarNetworkId] = undefined;
            Network.instance.localAvatarNetworkId = objectToCreate.networkId;
            const newNetworkObjectComponent = Network.instance.networkObjects[objectToCreate.networkId].component;
            newNetworkObjectComponent.networkId = objectToCreate.networkId;
            console.log('*createObjects* same object but in anotherId ' + objectToCreate.networkId);
            continue;
          } else if (isIdFull) {
            console.log('*createObjects* dont have object but Id not empty ' + objectToCreate.networkId);
            syncPhysicsObjects(objectToCreate);
          }

          if (Network.instance.networkObjects[objectToCreate.networkId] === undefined && isPlayerPref) {
            if (objectToCreate.ownerId === Network.instance.userId) {
              if (Network.instance.localAvatarNetworkId === undefined) {
                createNetworkPlayer(objectToCreate);
              }
            } else {
              createNetworkPlayer(objectToCreate);
            }
          } else {
            if(objectToCreate.parameters) {
              // we have parameters, so we should spawn the object in the world via the prefab type
              Network.instance.schema.prefabs[objectToCreate.prefabType].initialize(objectToCreate);
            } else {
              // otherwise this is for an object loaded via the scene,
              // so we just create a skeleton network object while we wait for the scene to load
              createEmptyNetworkObjectBeforeSceneLoad(objectToCreate);
            }
          }
        }
        syncNetworkObjectsTest(worldState.createObjects)

        worldState.editObjects?.forEach((editObject) => {
          NetworkObjectUpdateSchema[editObject.type]?.forEach((element) => {
            element.behavior(editObject);
          })
        });

        // Game Manager Messages, must be after create object functions
        if (worldState.gameState && worldState.gameState.length > 0) {
          worldState.gameState.forEach((stateMessage: GameStateUpdateMessage) => {
            if (Network.instance.userId === stateMessage.ownerId) {
              console.log('get message', stateMessage);
              applyStateToClient(stateMessage);
            }
          });
        }
        if (worldState.gameStateActions && worldState.gameStateActions.length > 0) {
          worldState.gameStateActions.forEach((actionMessage: GameStateActionMessage) => applyActionComponent(actionMessage));
        }

        // Handle all network objects destroyed this frame
        worldState.destroyObjects?.forEach(({ networkId }) => {
          console.log("Destroying ", networkId);
          if (Network.instance.networkObjects[networkId] === undefined)
            return console.warn("Can't destroy object as it doesn't appear to exist");
          // console.log("Destroying network object ", Network.instance.networkObjects[networkId].component.networkId);
          // get network object

          if (Network.instance.localAvatarNetworkId === networkId) {
            console.warn('Can not remove owner...')
            return;
          }
          const entity = Network.instance.networkObjects[networkId].component.entity;
          if (hasComponent(entity, Object3DComponent)) {
            Engine.scene.remove( Engine.scene.getObjectByName(getComponent(entity, Object3DComponent).value.name) );
          }
          // Remove the entity and all of it's components
          removeEntity(entity);
          // Remove network object from list
          delete Network.instance.networkObjects[networkId];
        })
      });
    }


    if(this.receivedServerTransformState.length > 0) {
      const receivedTransformState = [...this.receivedServerTransformState];
      this.receivedServerTransformState = [];
      receivedTransformState?.forEach((transformState: TransformStateInterface) => {
        if (Network.instance.tick < transformState.tick - 1) {
          // we dropped packets
          // Check how many
          // If our queue empty? Request immediately
          // Is our queue not empty? Inspect tick numbers
          // Did they fall in our range?
          // Send a request for the ones that didn't
        }

        Network.instance.tick = transformState.tick;

        if (transformState.transforms.length) {
          // do our reverse manipulations back from network
          // TODO: minimise quaternions to 3 components
          transformState.transforms.forEach((transform: StateEntity) => {
            const networkObject = Network.instance.networkObjects[transform.networkId]
            // for character entities, we are sending the view vector, so we have to apply it and retrieve the rotation
            if(networkObject && networkObject.component && hasComponent(networkObject.component.entity, CharacterComponent)) {
              vector3_0.set(transform.qX, transform.qY, transform.qZ);
              vector3_1.copy(vector3_0).setY(0).normalize();
              quat.setFromUnitVectors(forwardVector, applyVectorMatrixXZ(vector3_1, forwardVector).setY(0));
              // we don't want to override our own avatar
              if(networkObject.component.entity !== Network.instance.localClientEntity) {
                const actor = getMutableComponent(networkObject.component.entity, CharacterComponent);
                actor.viewVector.copy(vector3_0);
              }
              // put the transform rotation on the transform to deal with later
              transform.qX = quat.x;
              transform.qY = quat.y;
              transform.qZ = quat.z;
              transform.qW = quat.w;
            }
          });

          const myPlayerTime = transformState.transforms.find(v => v.networkId == Network.instance.localAvatarNetworkId);
          const newServerSnapshot = createSnapshot(transformState.transforms);
          // server correction, time when client send inputs
          newServerSnapshot.timeCorrection = myPlayerTime ? (myPlayerTime.snapShotTime + Network.instance.timeSnaphotCorrection) : 0;
          // interpolation, time when server send transforms
          newServerSnapshot.time = transformState.time;
          Network.instance.snapshot = newServerSnapshot;
          addSnapshot(newServerSnapshot);
        }

        transformState.ikTransforms?.forEach((ikTransform: StateEntityIK) => {
          if (!Network.instance.networkObjects[ikTransform.networkId]) return;
          const entity = Network.instance.networkObjects[ikTransform.networkId].component.entity;
          // ignore our own transform
          if(entity === Network.instance.localClientEntity) return;
          if(!hasComponent(entity, XRInputSourceComponent)) {
            addComponent(entity, XRInputSourceComponent);
          }
          const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent);
          const { hmd, left, right } = ikTransform;
          xrInputSourceComponent.head.position.set(hmd.x, hmd.y, hmd.z);
          xrInputSourceComponent.head.quaternion.set(hmd.qX, hmd.qY, hmd.qZ, hmd.qW);
          xrInputSourceComponent.controllerLeft.position.set(left.x, left.y, left.z);
          xrInputSourceComponent.controllerLeft.quaternion.set(left.qX, left.qY, left.qZ, left.qW);
          xrInputSourceComponent.controllerRight.position.set(right.x, right.y, right.z);
          xrInputSourceComponent.controllerRight.quaternion.set(right.qX, right.qY, right.qZ, right.qW);
        })
      });
    }

    function getClientGameActions() {
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
          viewVector: Network.instance.clientInputState.viewVector,
          clientGameAction: getClientGameActions(),// Network.instance.clientGameAction,
          commands: [],
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
