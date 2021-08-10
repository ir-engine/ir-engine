import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType, SIXDOFType } from '../../common/types/NumericalTypes'
import { GameStateActionMessage, GameStateUpdateMessage, ClientGameActionMessage } from '../../game/types/GameMessage'
import { InputAlias } from '../../input/types/InputAlias'
import { StateEntityClientGroup, StateEntityGroup, StateEntityIKGroup } from '../types/SnapshotDataTypes'

export interface AvatarProps {
  avatarURL?: string
  thumbnailURL?: string
  avatarId?: string
}

export type CommandType = {
  type: number
  args: string
}

/** Interface for handling network input. */
export interface NetworkInputInterface {
  /** network ID of user. */
  networkId: number
  /** Button input received over the network. */
  buttons: Array<{
    input: InputAlias
    value: NumericalType
    lifecycleState: LifecycleValue
  }>
  /** Axes 1D input received over the network. */
  axes1d: Array<{
    input: InputAlias
    value: NumericalType
    lifecycleState: LifecycleValue
  }>
  /** Axes 2D input received over the network. */
  axes2d: Array<{
    input: InputAlias
    value: NumericalType
    lifecycleState: LifecycleValue
  }>
  /** Axes 2D input received over the network. */
  axes6DOF: Array<{
    input: InputAlias
    value: SIXDOFType
  }>
  /** Viewport vector of the client. */
  viewVector: { x: number; y: number; z: number }
  snapShotTime: number
  clientGameAction: ClientGameActionMessage[]
  commands: CommandType[]
  transforms: StateEntityClientGroup
}

/** Interface for handling client network input. */
export interface NetworkClientInputInterface extends NetworkInputInterface {
  /** Time of the snapshot. */
  snapShotTime: number
}

/** Interface for network client input packet. */
export interface PacketNetworkClientInputInterface extends PacketNetworkInputInterface {
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
  /** Id of the owner. */
  ownerId: string
  /* NetworkObjectUpdateType */
  type: number
  values: number[]
  data: string[]
  // state: number,
  // currentId: number,
  // value: number,
  // whoIsItFor: string
}

/** Interface for creation of network object. */
export interface NetworkObjectCreateInterface {
  /** Id of the network. */
  networkId: number
  /** Id of the owner. */
  ownerId: string
  /** Entity unique Id from editor scene. */
  uniqueId: string
  /** Type of prefab used to create this object. */
  prefabType: number
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
export interface WorldStateInterface {
  /** List of connected clients. */
  clientsConnected: NetworkClientDataInterface[]
  /** List of disconnected clients. */
  clientsDisconnected: NetworkClientDataInterface[]
  /** List of created objects. */
  createObjects: NetworkObjectCreateInterface[]
  /** List of created objects. */
  editObjects: NetworkObjectEditInterface[]
  /** List of destroyed objects. */
  destroyObjects: NetworkObjectRemoveInterface[]
  gameState: GameStateUpdateMessage[]
  gameStateActions: GameStateActionMessage[]
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
/** Interface for handling packet network input. */
export interface PacketNetworkInputInterface {
  /** ID of the network. */
  networkId: number
  /** Button input received over the network. */
  buttons: Array<{
    input: InputAlias
    value: NumericalType
    lifecycleState: LifecycleValue
  }>
  /** Axes 1D input received over the network. */
  axes1d: Array<{
    input: InputAlias
    value: NumericalType
    lifecycleState: LifecycleValue
  }>
  /** Axes 2D input received over the network. */
  axes2d: Array<{
    input: InputAlias
    value: NumericalType
    lifecycleState: LifecycleValue
  }>
  /** Axes 2D input received over the network. */
  axes6DOF: Array<{
    input: InputAlias
    x: number
    y: number
    z: number
    qX: number
    qY: number
    qZ: number
    qW: number
  }>
  /** Viewport vector of the client. */
  viewVector: { x: number; y: number; z: number }
}
