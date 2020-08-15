// TODO: Remove / move to NullableNumericalType
export type Value = number | string | Quat | undefined

// TODO: Conslidate me
export interface StateEntity {
  id: string
  [key: string]: Value
}

export type ID = string
export type Time = number
export type State = StateEntity[]

export interface Snapshot {
  id: ID
  time: Time
  state: State | { [key: string]: State }
}

export interface InterpolatedSnapshot {
  state: State
  percentage: number
  older: ID
  newer: ID
}

// TODO: Remove / move
export type Quat = { x: number; y: number; z: number; w: number }
