import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { InputAlias } from "../../input/types/InputAlias";
import { Snapshot, StateEntityGroup } from "../types/SnapshotDataTypes";

export interface NetworkInputInterface {
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
  viewVector: {  x: number, y: number, z: number  },
  snapShotTime: BigInt
}

export interface NetworkClientDataInterface {
  userId: string
}

export interface NetworkTransformsInterface {
  networkId: number,
  snapShotTime: BigInt,
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
  prefabType: string | number,
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


//export interface NetworkInputInterface extends PacketReadyNetworkInputInterface {}
