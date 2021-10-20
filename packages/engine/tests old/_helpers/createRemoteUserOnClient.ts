export {}

// import { Network } from "../../src/networking/classes/Network";
// import {
//   NetworkObjectCreateInterface,
//   WorldStateInterface
// } from "../../src/networking/interfaces/WorldState";
// import { Engine } from "../../src/ecs/classes/Engine";
// import { WorldStateModel } from "../../src/networking/schema/worldStateSchema";
// import { execute } from "../../src/ecs/functions/EngineFunctions";
// import { SystemUpdateType } from "../../src/ecs/functions/SystemUpdateType";
// import { NetworkObject } from "../../src/networking/components/NetworkObject";
// import { PrefabType } from "../../src/networking/templates/PrefabType";

// export function createRemoteUserOnClient(options:{
//   initializeNetworkObjectMocked:  any,
//   position?:{ x: number, y: number, z: number},
//   rotation?:{ qX: number, qY: number, qZ: number, qW: number},
// }): {
//   createMessage: NetworkObjectCreateInterface,
//   networkObject: NetworkObject
// } {
//   const networkId = Network.getNetworkId();
//   const position = {
//     x: 1, y: 2, z: 3, ...options.position
//   };
//   const rotation = {
//     qX: 4, qY: 5, qZ: 6, qW: 7, ...options.rotation
//   };

//   const message: WorldStateInterface = {
//     clientsConnected: [],
//     clientsDisconnected: [],
//     time: 0,
//     ikTransforms: [],
//     editObjects: [],
//     createObjects: [
//       {
//         networkId,
//         ownerId: Math.random().toString(),
//         uniqueId: "asd123",
//         prefabType: PrefabType.Player,
//         ...position,
//         ...rotation
//       }
//     ],
//     destroyObjects: [],
//     inputs: [],
//     tick: Engine.tick,
//     transforms: [
//       {
//         networkId,
//         ...position,
//         ...rotation,
//         snapShotTime: 0
//       }
//     ]
//   };

//   // WorldStateInterface
//   Network.instance.incomingMessageQueue.add(WorldStateModel.toBuffer(message, "Unreliable"));
//   execute(1, 1 / Engine.physicsFrameRate, SystemUpdateType.FIXED);

//   return {
//     createMessage: message.createObjects[0],
//     networkObject: options.initializeNetworkObjectMocked.mock.results[options.initializeNetworkObjectMocked.mock.results.length - 1].value  as NetworkObject
//   };
// }
