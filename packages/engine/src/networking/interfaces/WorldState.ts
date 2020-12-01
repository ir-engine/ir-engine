import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { PrefabAlias } from "../../common/types/PrefabAlias";
import { InputAlias } from "../../input/types/InputAlias";
import { NumericalType } from "../../common/types/NumericalTypes";

export interface NetworkInputInterface {
  networkId: string
  buttons: {
    [key: string]: {
      input: InputAlias,
      value: NumericalType,
      lifecycleState: LifecycleValue
    }
  }
  axes1d: {
    [key: string]: {
      input: InputAlias,
      value: NumericalType,
      lifecycleState: LifecycleValue
    }
  }
  axes2d: {
    [key: string]: {
      input: InputAlias,
      valueX: number,
      valueY: number,
      lifecycleState: LifecycleValue
    }
  }
  viewVector: number[]
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
