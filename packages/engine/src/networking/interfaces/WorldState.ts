import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { InputValue } from '../../input/interfaces/InputValue'
import { InputAlias } from '../../input/types/InputAlias'
import { StateEntityClientMovingGroup, StateEntityGroup, StateEntityIKGroup } from '../types/SnapshotDataTypes'

export interface AvatarProps {
  avatarURL?: string
  thumbnailURL?: string
  avatarId?: string
}

export type CommandType = {
  type: number
  args: string
}

export type TransformPose = {
  x: number
  y: number
  z: number
  qX: number
  qY: number
  qZ: number
  qW: number
}

/** Interface for handling network input. */
export interface NetworkInputInterface {
  /** network ID of user. */
  networkId: number
  /** Viewport vector of the client. */
  headPose: TransformPose
  handPose: TransformPose[]
  snapShotTime: number
  commands: CommandType[]
  transforms: StateEntityClientMovingGroup
}

/** Interface for handling client network input. */
export interface NetworkClientInputInterface extends NetworkInputInterface {
  /** Time of the snapshot. */
  snapShotTime: number
}

/** Interface for Client Data. */
export interface NetworkClientDataInterface {
  /** Id of the user. */
  userId: string
  avatarDetail?: AvatarProps
}

/** Interface to remove network object. */
export interface NetworkObjectRemoveInterface {
  /** Id of the network. */
  networkId: number
}

/** Interface for creation of network object. */
export interface NetworkObjectEditInterface {
  /** Id of the network. */
  networkId: number
  /* NetworkObjectUpdateType */
  updateType: number
  values: number[]
  data: string[]
}

/** Interface for creation of network object. */
export interface NetworkObjectCreateInterface {
  /** Id of the network. */
  networkId: number
  /** Entity unique Id from editor scene. */
  uniqueId: string
  /** Type of prefab used to create this object. */
  prefabType: string
  /** Parameters to initialze the prefab with. */
  parameters: any
}

/** Interface for world state snapshot. */
export interface WorldStateSnapshot {
  /** Time of the snapshot. */
  time: number
  /** ID of the snapshot. */
  id: string
  /** State of the world while this snapshot is taken. */
  state: any[]
}

/** Interface for world state. */
export interface TransformStateInterface {
  /** Current world tick. */
  tick: number
  /** For interpolation. */
  time: number
  /** transform of world. */
  transforms: StateEntityGroup
  /** transform of ik avatars. */
  ikTransforms: StateEntityIKGroup
}
