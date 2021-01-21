//import * as initializeNetworkObjectModule from "../../src/networking/functions/initializeNetworkObject";
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema } from "../../src/templates/networking/DefaultNetworkSchema";
import { Network } from "../../src/networking/components/Network";
import { Engine } from "../../src/ecs/classes/Engine";
import { Quaternion, Scene, Vector3 } from "three";
import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { PhysicsSystem } from "../../src/physics/systems/PhysicsSystem";
import {
  NetworkClientInputInterface,
  NetworkInputInterface,
  NetworkTransformsInterface, WorldStateInterface
} from "../../src/networking/interfaces/WorldState";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
import {
  addComponent,
  createEntity, getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity
} from "../../src/ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../src/templates/character/components/CharacterComponent";
import { ServerNetworkIncomingSystem } from "../../src/networking/systems/ServerNetworkIncomingSystem";
import { DefaultInput } from "../../src/templates/shared/DefaultInput";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { Entity } from "../../src/ecs/classes/Entity";
import { Server } from "../../src/networking/components/Server";
import * as handleInputOnServerModule from "../../src/networking/functions/handleInputOnServer";
import * as setLocalMovementDirectionModule from "../../src/templates/character/behaviors/setLocalMovementDirection";
import { System } from "../../src/ecs/classes/System";
import { now } from "../../src/common/functions/now";
import { PhysicsManager } from "../../src/physics/components/PhysicsManager";
import { RaycastResult } from "collision/RaycastResult";
import { Body } from 'cannon-es';
import { StateSystem } from "../../src/state/systems/StateSystem";
import { InputAlias } from "../../src/input/types/InputAlias";
import { ClientInputModel } from "../../src/networking/schema/clientInputSchema";
import { ServerNetworkOutgoingSystem } from "../../src/networking/systems/ServerNetworkOutgoingSystem";
import { expect } from "@jest/globals";
import { WorldStateModel } from "../../src/networking/schema/worldStateSchema";
import {StateEntity} from "../../src/networking/types/SnapshotDataTypes";
import { ServerSpawnSystem } from "../../src/scene/systems/SpawnSystem";
import { TransformSystem } from "../../src/transform/systems/TransformSystem";
import SpawnPointComponent from "../../src/scene/components/SpawnPointComponent";
import { TransformComponent } from "../../src/transform/components/TransformComponent";

//const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');
const handleInputFromNonLocalClients = jest.spyOn(handleInputOnServerModule, 'handleInputFromNonLocalClients');
const setLocalMovementDirection = jest.spyOn(setLocalMovementDirectionModule, 'setLocalMovementDirection');
let fixedExecuteOnServer:jest.SpyInstance;
//let physicsWorldRaycastClosest:jest.SpyInstance;
let serverNetworkSystemIn:System;
let serverNetworkSystemOut:System;

const userId = "oid";
const playerOneUserId = "oidOne";
const playerTwoUserId = "oidTwo";

class TestTransport implements NetworkTransport {
  isServer = true;
  sentData = [];

  handleKick(socket: any) {
  }

  initialize(address?: string, port?: number, opts?: Object): void | Promise<void> {
    return undefined;
  }

  sendData(data: any): void {
  }

  sendReliableData(data: any): void {
    this.sentData.push(data);
  }

}

beforeAll(() => {
  const networkSchema: NetworkSchema = {
    ...DefaultNetworkSchema,
    transport: TestTransport,
  };
  //
  // const InitializationOptions = {
  //   ...DefaultInitializationOptions,
  //   networking: {
  //     schema: networkSchema,
  //   }
  // };
  new Network();

  Engine.scene = new Scene();

  serverNetworkSystemIn = registerSystem(ServerNetworkIncomingSystem, { schema: networkSchema, priority: -1 });
  serverNetworkSystemOut = registerSystem(ServerNetworkOutgoingSystem, { schema: networkSchema, priority: 10000 });
  fixedExecuteOnServer = jest.spyOn(serverNetworkSystemIn, 'execute');
  Network.instance.packetCompression = true;

  registerSystem(PhysicsSystem);
  // pretend player has floor
  PhysicsManager.instance.physicsWorld.raycastClosest = jest.fn((start, end, rayCastOptions, rayResult:RaycastResult) => {
    rayResult.body = new Body({mass:0});
    rayResult.hasHit = true;
    rayResult.hitPointWorld.set(0,0,0);
    rayResult.hitNormalWorld.set(0,1,0);
    return true;
  });
  PhysicsManager.instance.physicsWorld.gravity.set(0,0,0);
  // physicsWorldRaycastClosest = jest.spyOn(PhysicsManager.instance.physicsWorld, 'raycastClosest');

  registerSystem(StateSystem);

  registerSystem(ServerSpawnSystem, { priority: 899 });

  registerSystem(TransformSystem, { priority: 900 });
});

afterEach(() => {
  // TODO: clear all network objects!!!
  Object.keys(Network.instance.networkObjects).forEach(key => {
    // get network object
    const entity = Network.instance.networkObjects[key].component.entity;
    // Remove the entity and all of it's components
    removeEntity(entity);
    // Remove network object from list
    delete Network.instance.networkObjects[key];
  });

  if (fixedExecuteOnServer) {
    fixedExecuteOnServer.mockClear();
  }

  PhysicsManager.instance.frame = 0;
});

const oneFixedRunTimeSpan = 1 / Engine.physicsFrameRate;
let localTime = now();
function runFixed() {
  execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.Fixed);
  localTime += oneFixedRunTimeSpan;
}

test("create at spawn point", () => {
  const spawnPointPosition = new Vector3(11,22,33);
  const spawnPointRotation = new Quaternion(44,55,66,77);

  // add spawn point
  const spawnPointEntity = createEntity();
  addComponent(spawnPointEntity, TransformComponent, { position: spawnPointPosition, rotation: spawnPointRotation });
  const spawnPointTransform = getComponent(spawnPointEntity, TransformComponent);
  addComponent(spawnPointEntity, SpawnPointComponent);

  runFixed();

  // TODO: mock initializeNetworkObject
  Network.instance.userId = userId;
  const networkId = 13;
  const networkObject = initializeNetworkObject(userId, networkId, Network.instance.schema.defaultClientPrefab);
  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: networkObject
  };
  Network.instance.createObjects.push({
    networkId: networkObject.networkId,
    ownerId: userId,
    prefabType: Network.instance.schema.defaultClientPrefab,
    x: 0,
    y: 0,
    z: 0,
    qX: 0,
    qY: 0,
    qZ: 0,
    qW: 0
  });
  const networkEntity = networkObject.entity as Entity;
  expect(hasComponent(networkEntity, Server)).toBe(true);

  runFixed();

  const actor: CharacterComponent = getMutableComponent(networkEntity, CharacterComponent);
  expect(Network.instance.worldState.createObjects.length).toBe(1);
  const createObject = Network.instance.worldState.createObjects[0];
  expect(createObject.networkId).toBe(networkObject.networkId);
  expect([ createObject.x, createObject.y, createObject.z ]).toBe(spawnPointPosition.toArray());
  expect([ createObject.qX, createObject.qY, createObject.qZ, createObject.qW ]).toBe(spawnPointRotation.toArray());

  expect(Network.instance.worldState.transforms.length).toBe(1);
  const transform = Network.instance.worldState.transforms[0] as StateEntity;
  expect(transform.networkId).toBe(networkObject.networkId);
  expect([ transform.x, transform.y, transform.z ]).toBe(spawnPointPosition.toArray());
  expect([ transform.qX, transform.qY, transform.qZ, transform.qW ]).toBe(spawnPointRotation.toArray());
});
