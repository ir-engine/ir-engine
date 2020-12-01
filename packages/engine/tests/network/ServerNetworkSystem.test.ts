//import * as initializeNetworkObjectModule from "../../src/networking/functions/initializeNetworkObject";
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema, PrefabType } from "../../src/templates/networking/DefaultNetworkSchema";
import { Network } from "../../src/networking/components/Network";
import { Engine } from "../../src/ecs/classes/Engine";
import { Quaternion, Scene, Vector3 } from "three";
import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { PhysicsSystem } from "../../src/physics/systems/PhysicsSystem";
import {
  NetworkInputInterface,
  NetworkTransformsInterface,
  WorldStateInterface
} from "../../src/networking/interfaces/WorldState";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
import { NetworkObject } from "../../src/networking/components/NetworkObject";
import { getComponent, getMutableComponent, hasComponent } from "../../src/ecs/functions/EntityFunctions";
import { TransformComponent } from "../../src/transform/components/TransformComponent";
import { CharacterComponent } from "../../src/templates/character/components/CharacterComponent";
import { ServerNetworkSystem } from "../../src/networking/systems/ServerNetworkSystem";
import { DefaultInput } from "../../src/templates/shared/DefaultInput";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { Entity } from "../../src/ecs/classes/Entity";
import { Server } from "../../src/networking/components/Server";
import * as handleInputOnServerModule from "../../src/networking/functions/handleInputOnServer";
import * as setLocalMovementDirectionModule from "../../src/templates/character/behaviors/setLocalMovementDirection";

//const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');
const handleInputOnServer = jest.spyOn(handleInputOnServerModule, 'handleInputOnServer');
const setLocalMovementDirection = jest.spyOn(setLocalMovementDirectionModule, 'setLocalMovementDirection');

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

  registerSystem(ServerNetworkSystem, { schema: networkSchema });
  registerSystem(PhysicsSystem);
});

beforeEach(() => {
  handleInputOnServer.mockClear();
  setLocalMovementDirection.mockClear();
});

test("move forward changes transforms", () => {
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

  const message: NetworkInputInterface = {
    networkId: String(networkObject.networkId),
    buttons: {},
    axes1d: {},
    axes2d: {},
    viewVector: [1,0,0]
  };

  message.buttons[DefaultInput.FORWARD] = {
    input: DefaultInput.FORWARD,
    lifecycleState: LifecycleValue.CONTINUED,
    value: BinaryValue.ON
  };

  // WorldStateInterface
  Network.instance.incomingMessageQueue.add(message);
  execute(0, 1 / Engine.physicsFrameRate, SystemUpdateType.Fixed);
  expect(Network.instance.incomingMessageQueue.getBufferLength()).toBe(0);

  Network.instance.incomingMessageQueue.add(message);
  execute(0, 1 / Engine.physicsFrameRate, SystemUpdateType.Fixed);

  expect(handleInputOnServer.mock.calls.length).toBe(2);

  const actor: CharacterComponent = getMutableComponent(networkEntity, CharacterComponent);
  expect(actor.localMovementDirection.z).toBe(1);
  //expect(setLocalMovementDirection.mock.calls.length).toBe(1);

  expect(Network.instance.worldState.transforms.length).toBe(1);
  const transform = Network.instance.worldState.transforms[0] as NetworkTransformsInterface;
  expect(transform.networkId).toBe(networkObject.networkId);
  expect(transform.x).toBe(0);
  //expect(transform.y).toBe(0);
  expect(transform.z).not.toBe(0);
})