// TODO: Remove / move to NullableNumericalType
export type Value = number | string | Quat | undefined

// TODO: Conslidate me
export interface StateEntity {
  networkId: number;
  x: number;
  y: number;
  z: number;
  qX: number;
  qY: number;
  qZ: number;
  qW: number;
  snapShotTime: number;
}
export interface StateInterEntity {
  networkId: number;
  x: number;
  y: number;
  z: number;
  qX: number;
  qY: number;
  qZ: number;
  qW: number;
  vX: number;
  vY: number;
  vZ: number;
  speed: number;
  snapShotTime: number;
}

export interface StateClientEntity {
  networkId: number;
  x: number;
  y: number;
  z: number;
  qX: number;
  qY: number;
  qZ: number;
  qW: number;
}

export type ID = string
export type Time = number
export type StateEntityGroup = StateEntity[]
export type StateEntityInterGroup = StateInterEntity[]
export type StateEntityClientGroup = StateClientEntity[]

export interface Snapshot {
  id: ID;
  time: Time;
  state: StateEntityInterGroup; //| { [key: string]: StateEntityGroup };
  timeCorrection: number;
}

export interface InterpolatedSnapshot {
  state: StateEntityInterGroup;
  percentage: number;
  older: ID;
  newer: ID;
}

// TODO: Remove / move
export interface Quat { x: number; y: number; z: number; w: number }
