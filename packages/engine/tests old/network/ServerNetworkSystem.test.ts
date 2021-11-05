//import * as initializeNetworkObjectModule from "../../src/networking/functions/initializeNetworkObject";
import { initializeNetworkObject } from '@xrengine/engine/src/networking/functions/initializeNetworkObject';
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema } from "../../src/networking/templates/DefaultNetworkSchema";
import { Network } from "../../src/networking//classes/Network";
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
import { getMutableComponent, hasComponent, removeEntity } from "../../src/ecs/functions/ComponentFunctions";
import { CharacterComponent } from "../../src/avatar/components/CharacterComponent";
import { ServerNetworkIncomingSystem } from "../../src/networking/systems/ServerNetworkIncomingSystem";
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput';
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { Entity } from "../../src/ecs/classes/Entity";
import { Server } from "../../src/networking/components/Server";
import * as handleInputOnServerModule from "../../src/networking/functions/handleInputOnServer";
import * as setLocalMovementDirectionModule from "../../src/avatar/functions/setLocalMovementDirection";
import { System } from "../../src/ecs/classes/System";
import { now } from "../../src/common/functions/now";
import { PhysicsSystem } from "../../src/physics/systems/PhysicsSystem";
import { RaycastResult } from "collision/RaycastResult";
import { Body } from 'cannon-es';
import { StateSystem } from "../../src/services/systems/StateSystem";
import { InputAlias } from "../../src/input/types/InputAlias";
import { ClientInputModel } from "../../src/networking/schema/networkSchema";
import { ServerNetworkOutgoingSystem } from "../../src/networking/systems/ServerNetworkOutgoingSystem";
import { expect } from "@jest/globals";
import { WorldStateModel } from "../../src/networking/schema/worldStateSchema";
import {StateEntity} from "../../src/networking/types/SnapshotDataTypes";

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
  PhysXInstance.instance.raycastClosest = jest.fn((start, end, rayCastOptions, rayResult:RaycastResult) => {
    rayResult.body = new Body({mass:0});
    rayResult.hasHit = true;
    rayResult.hitPointWorld.set(0,0,0);
    rayResult.hitNormalWorld.set(0,1,0);
    return true;
  });
  // physicsWorldRaycastClosest = jest.spyOn(PhysXInstance.instance, 'raycastClosest');

  registerSystem(StateSystem);
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

  handleInputFromNonLocalClients.mockClear();

  if (setLocalMovementDirection) {
    setLocalMovementDirection.mockClear();
  }

  if (fixedExecuteOnServer) {
    fixedExecuteOnServer.mockClear();
  }

  PhysicsSystem.frame = 0;
});

const oneFixedRunTimeSpan = 1 / Engine.physicsFrameRate;
let localTime = now();
function runFixed() {
  execute(oneFixedRunTimeSpan, localTime, SystemUpdateType.FIXED);
  localTime += oneFixedRunTimeSpan;
}

test("continuous move forward changes transforms z", () => {
  // TODO: mock initializeNetworkObject
  Network.instance.userId = userId;
  const networkId = 13;
  const networkObject = initializeNetworkObject(userId, networkId, Network.instance.schema.defaultClientPrefab);

  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: networkObject
  };

  const networkEntity = networkObject.entity as Entity;
  expect(hasComponent(networkEntity, Server)).toBe(true);

  const message = createButtonServerMessage(networkObject.networkId, BaseInput.FORWARD, BinaryValue.ON);

  const runsCount = 4; // in my case it needs at least 4 frames to accumulate z transform
  for (let i = 0; i < runsCount; i++) {
    if (Network.instance.packetCompression) {
      Network.instance.incomingMessageQueue.add(ClientInputModel.toBuffer(message));
    } else {
      Network.instance.incomingMessageQueue.add(message);
    }
    runFixed();
    // expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);
  }

  // check that physics updated same
  expect(PhysicsSystem.frame).toBe(runsCount);
  expect(fixedExecuteOnServer.mock.calls.length).toBe(runsCount);
  expect(handleInputFromNonLocalClients.mock.calls.length).toBe(runsCount);

  const actor: CharacterComponent = getMutableComponent(networkEntity, CharacterComponent);
  expect(actor.localMovementDirection.z).toBe(1);
  expect(actor.velocityTarget.z).toBe(1);
  expect(actor.velocity.z).toBeGreaterThan(0);

  expect(Network.instance.worldState.transforms.length).toBe(1);
  const transform = Network.instance.worldState.transforms[0] as StateEntity;
  expect(transform.networkId).toBe(networkObject.networkId);
  expect(transform.x).toBe(0);
  // expect(transform.y).toBe(0); // why it's greater than zero??
  expect(transform.z).toBeGreaterThan(0);
});

test("continuous move forward and then stop", () => {
  expect(handleInputFromNonLocalClients.mock.calls.length).toBe(0);

  Network.instance.userId = userId;
  const networkId = 13;
  const networkObject = initializeNetworkObject(userId, networkId, Network.instance.schema.defaultClientPrefab);

  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: networkObject
  };

  const networkEntity = networkObject.entity as Entity;
  expect(hasComponent(networkEntity, Server)).toBe(true);
  const actor: CharacterComponent = getMutableComponent(networkEntity, CharacterComponent);

  const messagePressing = createButtonServerMessage(networkObject.networkId, BaseInput.FORWARD, BinaryValue.ON);
  const messageStopped = createButtonServerMessage(networkObject.networkId, BaseInput.FORWARD, BinaryValue.OFF, LifecycleValue.Ended);
  const messageEmpty:NetworkClientInputInterface = {
    axes1d: [], axes2d: [], buttons: [],
    networkId: networkObject.networkId,
    viewVector: { x:0, y:0, z:1 },
    snapShotTime: 0
  };
  const messagePressingToQueue = !Network.instance.packetCompression? messagePressing : ClientInputModel.toBuffer(messagePressing);
  const messageStoppedToQueue = !Network.instance.packetCompression? messageStopped : ClientInputModel.toBuffer(messageStopped);
  const messageEmptyToQueue = !Network.instance.packetCompression? messageEmpty : ClientInputModel.toBuffer(messageEmpty);

  const runsCount = 4; // in my case it needs at least 4 frames to accumulate z transform
  for (let i = 0; i < runsCount; i++) {
    Network.instance.incomingMessageQueue.add(messagePressingToQueue);
    runFixed();
    // expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);
  }
  expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);

  const movingVelocityZ = actor.velocity.z;

  console.log('STOP!');
  Network.instance.incomingMessageQueue.add(messageStoppedToQueue);
  runFixed();

  const emptyRunsCount = 20; // we need some time for speed falloff
  for (let i = 0; i < emptyRunsCount; i++) {
    Network.instance.incomingMessageQueue.add(messageEmptyToQueue);
    runFixed();
  }

  // check that physics updated same
  expect(PhysicsSystem.frame).toBe(runsCount + 1 + emptyRunsCount);
  expect(fixedExecuteOnServer.mock.calls.length).toBe(runsCount + 1 + emptyRunsCount);
  expect(handleInputFromNonLocalClients.mock.calls.length).toBe(runsCount + 1 + emptyRunsCount);

  expect(actor.localMovementDirection.z).toBe(0);
  expect(actor.velocityTarget.z).toBe(0);
  expect(actor.velocity.z).toBeLessThan(movingVelocityZ);

  expect(Network.instance.worldState.transforms.length).toBe(1);
  const transform = Network.instance.worldState.transforms[0] as StateEntity;
  expect(transform.networkId).toBe(networkObject.networkId);
});

test("move forward, then 2 messages stop + empty in one execution", () => {
  expect(handleInputFromNonLocalClients.mock.calls.length).toBe(0);

  Network.instance.userId = userId;
  const networkId = 13;
  const networkObject = initializeNetworkObject(userId, networkId, Network.instance.schema.defaultClientPrefab);

  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: networkObject
  };

  const networkEntity = networkObject.entity as Entity;
  expect(hasComponent(networkEntity, Server)).toBe(true);
  const actor: CharacterComponent = getMutableComponent(networkEntity, CharacterComponent);

  const messagePressing = createButtonServerMessage(networkObject.networkId, BaseInput.FORWARD, BinaryValue.ON);
  const messageStopped = createButtonServerMessage(networkObject.networkId, BaseInput.FORWARD, BinaryValue.OFF, LifecycleValue.Ended);
  const messageEmpty:NetworkClientInputInterface = {
    axes1d: [], axes2d: [], buttons: [],
    networkId: networkObject.networkId,
    viewVector: { x:0, y:0, z:1 },
    snapShotTime: 0
  };
  const messagePressingToQueue = !Network.instance.packetCompression? messagePressing : ClientInputModel.toBuffer(messagePressing);
  const messageStoppedToQueue = !Network.instance.packetCompression? messageStopped : ClientInputModel.toBuffer(messageStopped);
  const messageEmptyToQueue = !Network.instance.packetCompression? messageEmpty : ClientInputModel.toBuffer(messageEmpty);

  const runsCount = 4; // in my case it needs at least 4 frames to accumulate z transform
  for (let i = 0; i < runsCount; i++) {
    Network.instance.incomingMessageQueue.add(messagePressingToQueue);
    runFixed();
    // expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);
  }
  expect(actor.localMovementDirection.z).toBe(1);

  const movingVelocityZ = actor.velocity.z;

  console.log('STOP!');
  Network.instance.incomingMessageQueue.add(messageStoppedToQueue);
  Network.instance.incomingMessageQueue.add(messageEmptyToQueue);
  runFixed();

  expect(actor.localMovementDirection.z).toBe(0);
  expect(actor.velocityTarget.z).toBe(0);

  console.log('empty runs...');
  const emptyRunsCount = 20; // we need some time for speed falloff
  for (let i = 0; i < emptyRunsCount; i++) {
    Network.instance.incomingMessageQueue.add(messageEmptyToQueue);
    runFixed();
  }

  // expect(fixedExecuteOnServer.mock.calls.length).toBe(runsCount + 1 + emptyRunsCount);
  // expect(handleInputOnServer.mock.calls.length).toBe(runsCount + 2 + emptyRunsCount);
  expect(actor.velocity.z).toBeLessThan(movingVelocityZ);
});

test("2 buttons states in one execution propagate back to client", () => {
  /**
   * when we receive two inputs states in one execution, for example button-end, and nothing
   * back to users we sending only last one,
   * so they will loose button-end, or whatever else state change that could be important.
   */
  expect(handleInputFromNonLocalClients.mock.calls.length).toBe(0);

  Network.instance.userId = userId;
  const networkId = 13;
  const networkObject = initializeNetworkObject(userId, networkId, Network.instance.schema.defaultClientPrefab);

  Network.instance.networkObjects[networkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: networkObject
  };

  const networkEntity = networkObject.entity as Entity;
  expect(hasComponent(networkEntity, Server)).toBe(true);

  const message1: NetworkClientInputInterface = {
    "axes1d": [
      {
        input: BaseInput.CROUCH,
        lifecycleState: LifecycleValue.Changed,
        value: 0.2
      }
    ],
    "axes2d": [
      {
        input: BaseInput.SCREENXY,
        lifecycleState: LifecycleValue.Changed,
        value: [ 0.1, 240 ]
      }
    ],
    "buttons": [
      {
        "input": BaseInput.FORWARD,
        "lifecycleState": LifecycleValue.Continued,
        "value": BinaryValue.ON,
      }
    ],
    "networkId": 13,
    "viewVector": {
      "x": 0,
      "y": 0,
      "z": 1,
    },
    snapShotTime: 1
  };
  const message2: NetworkClientInputInterface = {
    "axes1d": [
      {
        input: BaseInput.CROUCH,
        lifecycleState: LifecycleValue.Changed,
        value: 0.9
      }
    ],
    "axes2d": [
      {
        input: BaseInput.SCREENXY,
        lifecycleState: LifecycleValue.Changed,
        value: [ 50, 21 ]
      }
    ],
    "buttons": [
      {
        "input": BaseInput.FORWARD,
        "lifecycleState": LifecycleValue.Ended,
        "value": BinaryValue.OFF,
      }
    ],
    "networkId": 13,
    "viewVector": {
      "x": 0,
      "y": 0,
      "z": 1,
    },
    snapShotTime: 2
  };
  const message3:NetworkClientInputInterface = {
    axes1d: [], axes2d: [], buttons: [],
    networkId: networkObject.networkId,
    viewVector: { x:0, y:0, z:1 },
    snapShotTime: 3
  };
  const message1ToQueue = !Network.instance.packetCompression? message1 : ClientInputModel.toBuffer(message1);
  const message2ToQueue = !Network.instance.packetCompression? message2 : ClientInputModel.toBuffer(message2);
  const message3ToQueue = !Network.instance.packetCompression? message3 : ClientInputModel.toBuffer(message3);

  Network.instance.incomingMessageQueue.add(message1ToQueue);
  Network.instance.incomingMessageQueue.add(message2ToQueue);
  Network.instance.incomingMessageQueue.add(message3ToQueue);
  runFixed();

  const sentData = (Network.instance.transport as TestTransport).sentData[0] as WorldStateInterface;
  const lastSentMessage = !Network.instance.packetCompression? sentData : WorldStateModel.fromBuffer(sentData);

  const { snapShotTime:sn1, ...expectedMessages1 } = message1;
  const { snapShotTime:sn2, ...expectedMessages2 } = message2;
  expect(lastSentMessage.inputs).toMatchObject([
      expectedMessages1,
      expectedMessages2,
  ] as any);
});

test("incoming input propagates to network", () => {
  // Network.instance.userId = userId;
  const playerOneNetworkId = 1;
  const playerTwoNetworkId = 2;

  // create player one
  const p1position = new Vector3();
  const p1viewVector = new Vector3(0,0,1);
  const p1NetworkObject = initializeNetworkObject(playerOneUserId, playerOneNetworkId, Network.instance.schema.defaultClientPrefab, p1position);
  Network.instance.networkObjects[p1NetworkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: p1NetworkObject
  };
  // const p1NetworkEntity = p1NetworkObject.entity as Entity;

  // create player two
  const p2rotation = new Quaternion();
  p2rotation.setFromAxisAngle(new Vector3(0,1,0), Math.PI);
  const p2position = new Vector3();
  const p2viewVector = new Vector3(0,0,-1);
  const p2NetworkObject = initializeNetworkObject(playerTwoUserId, playerTwoNetworkId, Network.instance.schema.defaultClientPrefab, p2position, p2rotation);
  Network.instance.networkObjects[p2NetworkObject.networkId] = {
    ownerId: userId, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: p2NetworkObject
  };
  // const p2NetworkEntity = p2NetworkObject.entity as Entity;

  // handle creation, update transforms, etc.
  runFixed();

  // get input messages from both players
  //const p1message = createButtonServerMessage(p1NetworkObject.networkId, BaseInput.FORWARD, BinaryValue.ON, null, p1viewVector);
  const p1message: NetworkClientInputInterface = {
    networkId: p1NetworkObject.networkId,
    buttons: [
    {
      input: BaseInput.FORWARD,
      lifecycleState: LifecycleValue.Started,
      value: BinaryValue.ON
    }
  ],
    axes1d: [
      {
        input: BaseInput.JUMP,
        value: 0.3,
        lifecycleState: LifecycleValue.Changed
      }
    ],
    axes2d: [
      {
        input: BaseInput.SCREENXY,
        value: [ 0.1, 0.7 ],
        lifecycleState: LifecycleValue.Changed
      }
    ],
    viewVector: {
      x: p1viewVector.x,
      y: p1viewVector.y,
      z: p1viewVector.z
    },
    snapShotTime: 1
  };

  // const p2message = createButtonServerMessage(p2NetworkObject.networkId, BaseInput.FORWARD, BinaryValue.ON, null, p2viewVector);
  const p2message: NetworkClientInputInterface = {
    networkId: p2NetworkObject.networkId,
    buttons: [
      {
        input: BaseInput.FORWARD,
        lifecycleState: LifecycleValue.Started,
        value: BinaryValue.ON
      }
    ],
    axes1d: [
      {
        input: BaseInput.CROUCH,
        value: 0.6,
        lifecycleState: LifecycleValue.Changed
      }
    ],
    axes2d: [
      {
        input: BaseInput.SCREENXY,
        value: [ 0.4, 0.9 ],
        lifecycleState: LifecycleValue.Changed
      }
    ],
    viewVector: {
      x: p2viewVector.x,
      y: p2viewVector.y,
      z: p2viewVector.z
    },
    snapShotTime: 2
  };

  // const runsCount = 4; // in my case it needs at least 4 frames to accumulate z transform
  // for (let i = 0; i < runsCount; i++) {
    if (Network.instance.packetCompression) {
      Network.instance.incomingMessageQueue.add(ClientInputModel.toBuffer(p1message));
      Network.instance.incomingMessageQueue.add(ClientInputModel.toBuffer(p2message));
    } else {
      Network.instance.incomingMessageQueue.add(p1message);
      Network.instance.incomingMessageQueue.add(p2message);
    }
    runFixed();
  // }
  expect(Network.instance.worldState.transforms.length).toBe(2);

  // const actor1: CharacterComponent = getMutableComponent(p1NetworkEntity, CharacterComponent);
  // const actor2: CharacterComponent = getMutableComponent(p2NetworkEntity, CharacterComponent);
  //
  // expect(actor1.localMovementDirection.z).toBe(1);
  // expect(actor1.velocityTarget.z).toBe(1);
  // expect(actor1.velocity.z).toBeGreaterThan(0);
  //
  //
  // expect(actor2.localMovementDirection.z).toBe(-1);
  // expect(actor2.velocityTarget.z).toBe(-1);
  // expect(actor2.velocity.z).toBeLessThan(0);
  //
  //
  // const p1transform = Network.instance.worldState.transforms.find(t => t.networkId === p1NetworkObject.networkId);
  // expect(p1transform).toBeTruthy();
  // expect(p1transform.networkId).toBe(p1NetworkObject.networkId);
  // expect(p1transform.x).toBe(0);
  // // expect(transform.y).toBe(0); // why it's greater than zero??
  // expect(p1transform.z).toBeGreaterThan(0);
  //
  //
  // const p2transform = Network.instance.worldState.transforms.find(t => t.networkId === p2NetworkObject.networkId);
  // expect(p2transform).toBeTruthy();
  // expect(p2transform.networkId).toBe(p2NetworkObject.networkId);
  // expect(p2transform.x).toBe(0);
  // // expect(transform.y).toBe(0); // why it's greater than zero??
  // expect(p2transform.z).toBeGreaterThan(0);

  // TODO: check input
  const { snapShotTime, ...expectedP2Input } = p2message;
  const p2input = Network.instance.worldState.inputs.find(t => t.networkId === p2NetworkObject.networkId);
  expect(p2input).toMatchObject(expectedP2Input as any);

  const sentData = (Network.instance.transport as TestTransport).sentData;
  const lastSent = sentData[sentData.length - 1];

  // if (Network.instance.packetCompression) {
  const message = !Network.instance.packetCompression? lastSent : WorldStateModel.fromBuffer(lastSent);
  const p2inputsFromSentData = message.inputs.find(t => t.networkId === p2NetworkObject.networkId);
  expect(p2inputsFromSentData).toMatchObject(expectedP2Input as any);
});

function createButtonServerMessage(networkId:number, button:InputAlias, value:BinaryValue, lifecycle:LifecycleValue = null, viewVector:{x:number,y:number,z:number} = null):NetworkClientInputInterface {
  const lifecycleState = lifecycle ?? ( value === BinaryValue.OFF? LifecycleValue.Ended : LifecycleValue.Continued );
  const _viewVector = viewVector ?? { x:0, y:0, z:1 };
  return {
    networkId: networkId,
    snapShotTime: 0,
    buttons: [
      {
        input: button,
        lifecycleState,
        value
      }
    ],
    axes1d: [],
    axes2d: [],
    viewVector: {
      x: _viewVector.x,
      y: _viewVector.y,
      z: _viewVector.z
    }
  };
}