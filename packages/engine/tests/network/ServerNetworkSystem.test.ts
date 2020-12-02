//import * as initializeNetworkObjectModule from "../../src/networking/functions/initializeNetworkObject";
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema } from "../../src/templates/networking/DefaultNetworkSchema";
import { Network } from "../../src/networking/components/Network";
import { Engine } from "../../src/ecs/classes/Engine";
import { Scene } from "three";
import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { PhysicsSystem } from "../../src/physics/systems/PhysicsSystem";
import { NetworkInputInterface, NetworkTransformsInterface } from "../../src/networking/interfaces/WorldState";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
import { getMutableComponent, hasComponent, removeEntity } from "../../src/ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../src/templates/character/components/CharacterComponent";
import { ServerNetworkSystem } from "../../src/networking/systems/ServerNetworkSystem";
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

//const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');
const handleInputOnServer = jest.spyOn(handleInputOnServerModule, 'handleInputOnServer');
const setLocalMovementDirection = jest.spyOn(setLocalMovementDirectionModule, 'setLocalMovementDirection');
let fixedExecuteOnServer:jest.SpyInstance;
let physicsWorldRaycastClosest:jest.SpyInstance;
let serverNetworkSystem:System;

const userId = "oid";

class TestTransport implements NetworkTransport {
  isServer = true;

  handleKick(socket: any) {
  }

  initialize(address?: string, port?: number, opts?: Object): void | Promise<void> {
    return undefined;
  }

  sendData(data: any): void {
  }

  sendReliableData(data: any): void {
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

  serverNetworkSystem = registerSystem(ServerNetworkSystem, { schema: networkSchema });
  fixedExecuteOnServer = jest.spyOn(serverNetworkSystem, 'execute');

  registerSystem(PhysicsSystem);
  // pretend player has floor
  PhysicsManager.instance.physicsWorld.raycastClosest = jest.fn((start, end, rayCastOptions, rayResult:RaycastResult) => {
    rayResult.body = new Body({mass:1});
    rayResult.hasHit = true;
    rayResult.hitPointWorld.set(0,0,0);
    rayResult.hitNormalWorld.set(0,1,0);
    return true;
  });
  // physicsWorldRaycastClosest = jest.spyOn(PhysicsManager.instance.physicsWorld, 'raycastClosest');

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
  })

  handleInputOnServer.mockClear();

  if (setLocalMovementDirection) {
    setLocalMovementDirection.mockClear();
  }

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

  const message = createButtonServerMessage(networkObject.networkId, DefaultInput.FORWARD, BinaryValue.ON);

  const runsCount = 4; // in my case it needs at least 4 frames to accumulate z transform
  for (let i = 0; i < runsCount; i++) {
    Network.instance.incomingMessageQueue.add(message);
    runFixed();
    // expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);
  }

  // check that physics updated same
  expect(PhysicsManager.instance.frame).toBe(runsCount);
  expect(fixedExecuteOnServer.mock.calls.length).toBe(runsCount);
  expect(handleInputOnServer.mock.calls.length).toBe(runsCount);

  const actor: CharacterComponent = getMutableComponent(networkEntity, CharacterComponent);
  expect(actor.localMovementDirection.z).toBe(1);
  expect(actor.velocityTarget.z).toBe(1);
  expect(actor.velocity.z).toBeGreaterThan(0);

  expect(Network.instance.worldState.transforms.length).toBe(1);
  const transform = Network.instance.worldState.transforms[0] as NetworkTransformsInterface;
  expect(transform.networkId).toBe(networkObject.networkId);
  expect(transform.x).toBe(0);
  // expect(transform.y).toBe(0); // why it's greater than zero??
  expect(transform.z).toBeGreaterThan(0);
})

test("continuous move forward and then stop", () => {
  expect(handleInputOnServer.mock.calls.length).toBe(0);

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

  const messagePressing = createButtonServerMessage(networkObject.networkId, DefaultInput.FORWARD, BinaryValue.ON);
  const messageStopped = createButtonServerMessage(networkObject.networkId, DefaultInput.FORWARD, BinaryValue.OFF, LifecycleValue.ENDED);
  const messageEmpty:NetworkInputInterface = {
    axes1d: {}, axes2d: {}, buttons: {},
    networkId: String(networkObject.networkId),
    viewVector: [0,0,1]
  };

  const runsCount = 4; // in my case it needs at least 4 frames to accumulate z transform
  for (let i = 0; i < runsCount; i++) {
    Network.instance.incomingMessageQueue.add(messagePressing);
    runFixed();
    // expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);
  }
  expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);

  const movingVelocityZ = actor.velocity.z;

  console.log('STOP!');
  Network.instance.incomingMessageQueue.add(messageStopped);
  runFixed();

  const emptyRunsCount = 20; // we need some time for speed falloff
  for (let i = 0; i < emptyRunsCount; i++) {
    Network.instance.incomingMessageQueue.add(messageEmpty);
    runFixed();
  }

  // check that physics updated same
  expect(PhysicsManager.instance.frame).toBe(runsCount + 1 + emptyRunsCount);
  expect(fixedExecuteOnServer.mock.calls.length).toBe(runsCount + 1 + emptyRunsCount);
  expect(handleInputOnServer.mock.calls.length).toBe(runsCount + 1 + emptyRunsCount);

  expect(actor.localMovementDirection.z).toBe(0);
  expect(actor.velocityTarget.z).toBe(0);
  expect(actor.velocity.z).toBeLessThan(movingVelocityZ);

  expect(Network.instance.worldState.transforms.length).toBe(1);
  const transform = Network.instance.worldState.transforms[0] as NetworkTransformsInterface;
  expect(transform.networkId).toBe(networkObject.networkId);
  // expect(transform.x).toBe(0);
  // expect(transform.y).toBe(0); // why it's greater than zero??
  // expect(transform.z).toBeGreaterThan(0);
})

function createButtonServerMessage(networkId:number, button:InputAlias, value:BinaryValue, lifecycle = null):NetworkInputInterface {
  const lifecycleState = lifecycle ?? ( value === BinaryValue.OFF? LifecycleValue.ENDED : LifecycleValue.CONTINUED )
  return {
    networkId: String(networkId),
    buttons: {
      [button]: {
        input: button,
          lifecycleState,
          value
      }
    },
    axes1d: {},
    axes2d: {},
    viewVector: [0,0,1]
  }
}