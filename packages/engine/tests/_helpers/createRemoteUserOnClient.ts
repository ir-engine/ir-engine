import { Network } from "../../src/networking/components/Network";
import {
  NetworkObjectCreateInterface,
  PacketWorldState,
  WorldStateInterface
} from "../../src/networking/interfaces/WorldState";
import { PrefabType } from "../../src/templates/networking/DefaultNetworkSchema";
import { Engine } from "../../src/ecs/classes/Engine";
import { WorldStateModel } from "../../src/networking/schema/worldStateSchema";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
import { NetworkObject } from "../../src/networking/components/NetworkObject";

export function createRemoteUserOnClient(options:{
  initializeNetworkObjectMocked:  jest.SpyInstance,
  position?:{ x: number, y: number, z: number},
  rotation?:{ qX: number, qY: number, qZ: number, qW: number},
}): {
  createMessage: NetworkObjectCreateInterface,
  networkObject: NetworkObject
} {
  const networkId = Network.getNetworkId();
  const position = {
    x: 1, y: 2, z: 3, ...options.position
  };
  const rotation = {
    qX: 4, qY: 5, qZ: 6, qW: 7, ...options.rotation
  };

  const message: WorldStateInterface = {
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [
      {
        networkId,
        ownerId: Math.random().toString(),
        prefabType: PrefabType.Player,
        ...position,
        ...rotation
      }
    ],
    destroyObjects: [],
    inputs: [],
    states: [],
    tick: Engine.tick,
    transforms: [
      {
        networkId,
        ...position,
        ...rotation,
        snapShotTime: 0
      }
    ]
  };

  // WorldStateInterface
  Network.instance.incomingMessageQueue.add(WorldStateModel.toBuffer(message));
  execute(1, 1 / Engine.physicsFrameRate, SystemUpdateType.Fixed);

  return {
    createMessage: message.createObjects[0],
    networkObject: options.initializeNetworkObjectMocked.mock.results[options.initializeNetworkObjectMocked.mock.results.length - 1].value  as NetworkObject
  };
}