import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { InputAlias } from "../../input/types/InputAlias";
import { Snapshot, StateEntityGroup, StateEntityClientGroup } from "../types/SnapshotDataTypes";

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
}

export interface NetworkClientInputInterface extends NetworkInputInterface {
  snapShotTime: number
}

export interface PacketNetworkClientInputInterface extends PacketNetworkInputInterface {
  snapShotTime: number
}

export interface NetworkClientDataInterface {
  userId: string
}

export interface NetworkTransformsInterface {
  networkId: number,
  snapShotTime: number,
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
  time: number,
  id: string,
  state: any[]
}

export interface WorldStateInterface {
  tick: number
  transforms: StateEntityGroup
  //snapshot: Snapshot
  inputs: NetworkInputInterface[]
  states: any[]
  clientsConnected: NetworkClientDataInterface[]
  clientsDisconnected: NetworkClientDataInterface[]
  createObjects: NetworkObjectCreateInterface[]
  destroyObjects: NetworkObjectRemoveInterface[]
}

export interface PacketWorldState {
  tick: number
  transforms: NetworkTransformsInterface[]
  //snapshot: WorldStateSnapshot
  inputs: PacketNetworkInputInterface[]
  states: any[],
  clientsConnected: NetworkClientDataInterface[]
  clientsDisconnected: NetworkClientDataInterface[]
  createObjects: NetworkObjectCreateInterface[]
  destroyObjects: NetworkObjectRemoveInterface[]
}

export interface PacketNetworkInputInterface {
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
