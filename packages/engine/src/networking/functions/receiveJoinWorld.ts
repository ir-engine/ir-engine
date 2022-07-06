// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { NetworkTopics } from '../classes/Network'
import { NetworkPeer } from '../interfaces/NetworkPeer'
import { AvatarProps } from '../interfaces/WorldState'
import { NetworkPeerFunctions } from './NetworkPeerFunctions'
import { WorldNetworkAction } from './WorldNetworkAction'

export type JoinWorldRequestData = {
  inviteCode?: string
  spectateUserId?: UserId | 'none'
}

export type JoinWorldProps = {
  highResTimeOrigin: number
  worldStartTime: number
  cachedActions: Required<Action>[]
  avatarSpawnPose?: { position: Vector3; rotation: Quaternion }
  spectateUserId?: UserId | 'none'
}

export type SpawnInWorldProps = {
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
  avatarDetail: AvatarProps
  name: string
}

export const spawnLocalAvatarInWorld = (props: SpawnInWorldProps) => {
  const { avatarSpawnPose, avatarDetail, name } = props
  console.log('SPAWN IN WORLD', avatarSpawnPose, avatarDetail, name)
  Engine.instance.currentWorld.users.set(Engine.instance.userId, {
    userId: Engine.instance.userId,
    name
  })
  dispatchAction(WorldNetworkAction.spawnAvatar({ parameters: avatarSpawnPose }), NetworkTopics.world)
  dispatchAction(WorldNetworkAction.avatarDetails({ avatarDetail }), NetworkTopics.world)
  dispatchAction(EngineActions.joinedWorld())
}

export const receiveJoinWorld = (props: JoinWorldProps) => {
  if (!props) return
  const { highResTimeOrigin, worldStartTime, cachedActions, avatarSpawnPose, spectateUserId } = props
  console.log(
    'RECEIVED JOIN WORLD RESPONSE',
    highResTimeOrigin,
    worldStartTime,
    cachedActions,
    avatarSpawnPose,
    spectateUserId
  )
  // const world = Engine.instance.currentWorld

  // const engineState = getEngineState()

  // const spawnPose = engineState.isTeleporting.value
  //   ? {
  //       position: world.activePortal.remoteSpawnPosition,
  //       rotation: world.activePortal.remoteSpawnRotation
  //     }
  //   : avatarSpawnPose

  for (const action of cachedActions) Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true })

  if (spectateUserId) {
    if (spectateUserId !== 'none') dispatchAction(EngineActions.spectateUser({ user: spectateUserId }))
  }
  //  else if (spawnPose) {}

  Engine.instance.store.actions.outgoing[NetworkTopics.world].queue.push(
    ...Engine.instance.store.actions.outgoing[NetworkTopics.world].history
  )
}
