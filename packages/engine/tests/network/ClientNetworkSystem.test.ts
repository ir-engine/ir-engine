import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { ClientNetworkSystem } from "../../src/networking/systems/ClientNetworkSystem";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema, PrefabType } from "../../src/templates/networking/DefaultNetworkSchema";
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { Network } from "../../src/networking/components/Network";
import { WorldStateInterface } from "../../src/networking/interfaces/WorldState";
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

const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');

class TestTransport implements NetworkTransport {
  isServer: boolean;

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
  // TODO: mock initializeNetworkObject

  const message: WorldStateInterface = {
    snapshot: undefined,
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: [],
    inputs: [],
    states: [],
    tick: 0,
    transforms: []
  };

  const createMessage = {
    networkId: "3",
    ownerId: "oid",
    prefabType: PrefabType.Player,
    x: 1, y: 2, z: 3,
    qX: 4, qY: 5, qZ: 6, qW: 7
  };
  message.createObjects.push(createMessage);

  const expected = {
    position: new Vector3(createMessage.x,createMessage.y,createMessage.z),
    rotation: new Quaternion(createMessage.qX,createMessage.qY,createMessage.qZ, createMessage.qW)
  }

  // WorldStateInterface
  Network.instance.incomingMessageQueue.add(message);
  execute(0, 1 / Engine.physicsFrameRate, SystemUpdateType.Fixed);

  expect(initializeNetworkObject.mock.calls.length).toBe(1);

  const newNetworkObject = initializeNetworkObject.mock.results[0].value as NetworkObject;
  expect(String(newNetworkObject.networkId)).toBe(createMessage.networkId)
  expect(newNetworkObject.ownerId).toBe(createMessage.ownerId)

  const entity = newNetworkObject.entity;
  const transform = getComponent(entity, TransformComponent);
  expect(transform.rotation).toMatchObject(expected.rotation);
  expect(transform.position).toMatchObject(expected.position);

  expect(hasComponent(entity, CharacterComponent)).toBeTruthy();
  // expect(hasComponent(entity, LocalInputReceiver)).toBeTruthy();
})