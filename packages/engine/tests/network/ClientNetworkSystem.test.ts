import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { ClientNetworkSystem } from "../../src/networking/systems/ClientNetworkSystem";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema, PrefabType } from "../../src/templates/networking/DefaultNetworkSchema";
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { Network } from "../../src/networking/components/Network";
import { PacketWorldState, WorldStateInterface } from "../../src/networking/interfaces/WorldState";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
import { Engine } from "../../src/ecs/classes/Engine";
import { Quaternion, Scene, Vector3 } from "three";
import { PhysicsSystem } from "../../src/physics/systems/PhysicsSystem";
import * as initializeNetworkObjectModule from "../../src/networking/functions/initializeNetworkObject";
import { NetworkObject } from "../../src/networking/components/NetworkObject";
import { TransformComponent } from "../../src/transform/components/TransformComponent";
import { getComponent, hasComponent } from "../../src/ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../src/templates/character/components/CharacterComponent";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { WorldStateModel } from "../../src/networking/schema/worldStateSchema";
import { addSnapshot, createSnapshot } from "../../src/networking/functions/NetworkInterpolationFunctions";
import {PhysicsManager} from "../../src/physics/components/PhysicsManager";

const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');

class TestTransport implements NetworkTransport {
  isServer = false;

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

  registerSystem(ClientNetworkSystem, { schema: networkSchema });
  registerSystem(PhysicsSystem);
});

test("create", () => {
  const simulatePhysics = PhysicsManager.instance.simulate;
  PhysicsManager.instance.simulate = false;

  // TODO: mock initializeNetworkObject
  const networkId = 3;
  const ownerId = "oid";
  const position = new Vector3(1,2,3);
  const rotation = new Quaternion(4,5,6,7);

  const message: WorldStateInterface = {
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [
      {
        networkId,
        ownerId,
        prefabType: PrefabType.Player,
        x: 1, y: 2, z: 3,
        qX: 4, qY: 5, qZ: 6, qW: 7
      }
    ],
    destroyObjects: [],
    inputs: [
      {
        networkId,
        axes1d: [],
        axes2d: [],
        buttons: [],
        viewVector: { x: 0, y: 0, z: 1 }
      }
    ],
    states: [],
    tick: 0,
    transforms: [
      {
        networkId,
        x: position.x,
        y: position.y,
        z: position.z,
        qX: rotation.x,
        qY: rotation.y,
        qZ: rotation.z,
        qW: rotation.w,
        snapShotTime: 0
      }
    ]
  };

  const expected = {
    position,
    rotation
  };

  // WorldStateInterface
  Network.instance.incomingMessageQueue.add(WorldStateModel.toBuffer(message));
  execute(0, 1 / Engine.physicsFrameRate, SystemUpdateType.Fixed);

  expect(initializeNetworkObject.mock.calls.length).toBe(1);

  const newNetworkObject = initializeNetworkObject.mock.results[0].value as NetworkObject;
  expect(newNetworkObject.networkId).toBe(networkId);
  expect(newNetworkObject.ownerId).toBe(ownerId);

  const entity = newNetworkObject.entity;
  const transform = getComponent(entity, TransformComponent);
  expect(transform.rotation).toMatchObject(expected.rotation);
  expect(transform.position.x).toBe(expected.position.x);
  expect(transform.position.y).toBe(expected.position.y);
  // expect(expected.position.y - transform.position.y).toBeLessThan(0.01); // affected by gravity
  expect(transform.position.z).toBe(expected.position.z);

  expect(hasComponent(entity, CharacterComponent)).toBeTruthy();
  // expect(hasComponent(entity, LocalInputReceiver)).toBeTruthy();

  PhysicsManager.instance.simulate = simulatePhysics;
});
