import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { ClientNetworkStateSystem } from "../../src/networking/systems/ClientNetworkStateSystem";
import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
import { DefaultNetworkSchema, PrefabType } from "../../src/networking/templates/DefaultNetworkSchema";
import { NetworkTransport } from "../../src/networking/interfaces/NetworkTransport";
import { Network } from "../../src/networking//classes/Network";
import { WorldStateInterface } from "../../src/networking/interfaces/WorldState";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
import { Engine } from "../../src/ecs/classes/Engine";
import { Quaternion, Scene, Vector3 } from "three";
import { PhysicsSystem } from "../../src/physics/systems/PhysicsSystem";
import * as initializeNetworkObjectModule from "../../src/networking/functions/initializeNetworkObject";
import { NetworkObject } from "../../src/networking/components/NetworkObject";
import { TransformComponent } from "../../src/transform/components/TransformComponent";
import { getComponent, hasComponent } from "../../src/ecs/functions/ComponentFunctions";
import { CharacterComponent } from "../../src/avatar/components/CharacterComponent";
import { WorldStateModel } from "../../src/networking/schema/worldStateSchema";
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput';
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { createRemoteUserOnClient } from "../_helpers/createRemoteUserOnClient";
import { Input } from "../../src/input/components/Input";
import { Entity } from "../../src/ecs/classes/Entity";
import { NumericalType } from "../../src/common/types/NumericalTypes";

const initializeNetworkObject = jest.spyOn(initializeNetworkObjectModule, 'initializeNetworkObject');

PhysXInstance.instance.gravity.set(0, 0, 0);

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

  registerSystem(ClientNetworkStateSystem, { schema: networkSchema });
  registerSystem(PhysicsSystem);
});

test("create", () => {
  // TODO: mock initializeNetworkObject
  const networkId = 3;
  const ownerId = "oid";
  const position = new Vector3(1, 2, 3);
  const rotation = new Quaternion(4, 5, 6, 7);

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
  execute(1, 1 / Engine.physicsFrameRate, SystemUpdateType.FIXED);

  expect(initializeNetworkObject.mock.calls.length).toBe(1);

  const newNetworkObject = initializeNetworkObject.mock.results[0].value as NetworkObject;
  expect(newNetworkObject.networkId).toBe(networkId);
  expect(newNetworkObject.ownerId).toBe(ownerId);

  const entity = newNetworkObject.entity;
  const transform = getComponent(entity, TransformComponent);
  expect(transform.rotation).toMatchObject(expected.rotation);
  expect(transform.position.x).toBe(expected.position.x);
  expect(transform.position.y).toBe(expected.position.y);
  expect(transform.position.z).toBe(expected.position.z);

  expect(hasComponent(entity, CharacterComponent)).toBeTruthy();
  // expect(hasComponent(entity, LocalInputReceiver)).toBeTruthy();
});

test("two inputs messages", () => {
  const { createMessage, networkObject } = createRemoteUserOnClient({ initializeNetworkObjectMocked: initializeNetworkObject });
  const buttonCalls: Array<[Entity, LifecycleValue, NumericalType]> = [];
  const axis1dCalls: Array<[Entity, LifecycleValue, NumericalType]> = [];
  const axis2dCalls: Array<[Entity, LifecycleValue, NumericalType]> = [];

  const input = getComponent(networkObject.entity, Input);
  if (typeof input.schema.inputButtonBehaviors[BaseInput.FORWARD] === "undefined") {
    input.schema.inputButtonBehaviors[BaseInput.FORWARD] = {
      started: [],
      ended: []
    };
  }
  input.schema.inputButtonBehaviors[BaseInput.FORWARD].started.push({
    behavior: e => buttonCalls.push([e, LifecycleValue.Started, null])
  });
  input.schema.inputButtonBehaviors[BaseInput.FORWARD].ended.push({
    behavior: e => buttonCalls.push([e, LifecycleValue.Ended, null])
  });

  const messageWorldState: WorldStateInterface = {
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: [],
    inputs: [
      {
        "networkId": networkObject.networkId,
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
            value: [0.1, 240]
          }
        ],
        "buttons": [
          {
            "input": BaseInput.FORWARD,
            "lifecycleState": LifecycleValue.Started,
            "value": BinaryValue.ON,
          }
        ],
        "viewVector": {
          "x": 0,
          "y": 0,
          "z": 1,
        }
      },
      {
        "networkId": networkObject.networkId,
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
            value: [50, 21]
          }
        ],
        "buttons": [
          {
            "input": BaseInput.FORWARD,
            "lifecycleState": LifecycleValue.Ended,
            "value": BinaryValue.OFF,
          }
        ],
        "viewVector": {
          "x": 0,
          "y": 0,
          "z": 1,
        }
      }
    ],
    states: [],
    tick: 0,
    transforms: []
  };

  const messageToQueue = !Network.instance.packetCompression ? messageWorldState : WorldStateModel.toBuffer(messageWorldState);
  Network.instance.incomingMessageQueue.add(messageToQueue);

  execute(0, 1 / Engine.physicsFrameRate, SystemUpdateType.FIXED);

  expect(buttonCalls.length).toBe(2);

});
