import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { PrefabAlias } from "../../common/types/PrefabAlias";

export interface NetworkInputInterface {
  networkId: string
  buttons: {
    input: string,
    value: BinaryValue,
    lifecycleState: LifecycleValue
  }
  axes1d: {
    input: string,
    value: number,
    lifecycleState: LifecycleValue
  }
  axes2d: {
    input: string,
    valueX: number,
    valueY: number,
    lifecycleState: LifecycleValue
  }
}

export interface NetworkClientDataInterface {
  userId: string
}

export interface NetworkTransformsInterface {
  networkId: string
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
  networkId: string,
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

export interface WorldStateInterface {
  tick: number
  transforms: NetworkTransformsInterface[]
  snapshot: any
  inputs: NetworkInputInterface[]
  states: any[],
  clientsConnected: NetworkClientDataInterface[]
  clientsDisconnected: NetworkClientDataInterface[]
  createObjects: NetworkObjectCreateInterface[]
  destroyObjects: NetworkObjectRemoveInterface[]
}
