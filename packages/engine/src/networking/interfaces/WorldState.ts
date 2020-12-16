import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { PrefabAlias } from "../../common/types/PrefabAlias";
import { InputAlias } from "../../input/types/InputAlias";
import { NumericalType } from "../../common/types/NumericalTypes";
import { Snapshot, StateEntityGroup } from "../types/SnapshotDataTypes";

// export interface NetworkInputInterface {
//   networkId: number
//   buttons: {
//     [key: string]: {
//       input: InputAlias,
//       value: NumericalType,
//       lifecycleState: LifecycleValue
//     }
//   }
//   axes1d: {
//     [key: string]: {
//       input: InputAlias,
//       value: NumericalType,
//       lifecycleState: LifecycleValue
//     }
//   }
//   axes2d: {
//     [key: string]: {
//       input: InputAlias,
//       valueX: number,
//       valueY: number,
//       lifecycleState: LifecycleValue
//     }
//   }
//   viewVector: number[]
// }

export interface NetworkClientDataInterface {
  userId: string
}

export interface NetworkTransformsInterface {
  networkId: number
  x: number
  y: number
  z: number
  qX: number
  qY: number
  qZ: number
  qW: number
}

export interface NetworkObjectRemoveInterface {
  networkId: number
}

export interface NetworkObjectCreateInterface {
  networkId: number,
  ownerId: string,
  prefabType: PrefabAlias,
  x: number,
  y: number,
  z: number,
  qX: number,
  qY: number,
  qZ: number,
  qW: number
}

export interface WorldStateSnapshot {
  time: BigInt,
  id: string,
  state: any[]
}

export interface WorldStateInterface {
  tick: number
  transforms: StateEntityGroup
  snapshot: Snapshot
  inputs: NetworkInputInterface[]
  states: any[]
  clientsConnected: NetworkClientDataInterface[]
  clientsDisconnected: NetworkClientDataInterface[]
  createObjects: NetworkObjectCreateInterface[]
  destroyObjects: NetworkObjectRemoveInterface[]
}

export interface PacketReadyWorldState {
  tick: BigInt
  transforms: StateEntityGroup
  snapshot: WorldStateSnapshot
  inputs: PacketReadyNetworkInputInterface[]
  states: any[],
  clientsConnected: NetworkClientDataInterface[]
  clientsDisconnected: NetworkClientDataInterface[]
  createObjects: NetworkObjectCreateInterface[]
  destroyObjects: NetworkObjectRemoveInterface[]
}

export interface PacketReadyNetworkInputInterface {
  networkId: number
  buttons: Array<{
      input: InputAlias,
      value: NumericalType,
      lifecycleState: LifecycleValue
    }>
  axes1d: Array<{
      input: InputAlias,
      value: NumericalType,
      lifecycleState: LifecycleValue
    }>
  axes2d: Array<{
      input: InputAlias,
      value: NumericalType,
      lifecycleState: LifecycleValue
    }>
  viewVector: {  x: number, y: number, z: number  }
}

export interface NetworkInputInterface extends PacketReadyNetworkInputInterface {}