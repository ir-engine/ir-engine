// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getSearchParamFromURL } from '@xrengine/common/src/utils/getSearchParamFromURL'
import { dispatchAction, getState } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { NetworkTopics } from '../classes/Network'
import { AvatarProps, WorldState } from '../interfaces/WorldState'
import { WorldNetworkAction } from './WorldNetworkAction'

export type JoinWorldRequestData = {
  inviteCode?: string
}

export type JoinWorldProps = {
  highResTimeOrigin: number
  worldStartTime: number
  cachedActions: Required<Action>[]
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
  const worldState = getState(WorldState)
  worldState.userNames[Engine.instance.userId].set(name)
  worldState.userAvatarDetails[Engine.instance.userId].set(avatarDetail)
  dispatchAction(WorldNetworkAction.spawnAvatar(avatarSpawnPose))
  dispatchAction(WorldNetworkAction.avatarDetails({ avatarDetail }))
}

export const receiveJoinWorld = (props: JoinWorldProps) => {
  if (!props) return
  const { highResTimeOrigin, worldStartTime, cachedActions } = props
  console.log('RECEIVED JOIN WORLD RESPONSE', highResTimeOrigin, worldStartTime, cachedActions)

  for (const action of cachedActions) Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true })

  const spectateUserId = getSearchParamFromURL('spectate')
  if (spectateUserId) {
    dispatchAction(EngineActions.spectateUser({ user: spectateUserId }))
  }

  dispatchAction(EngineActions.joinedWorld({}))

  Engine.instance.store.actions.outgoing[NetworkTopics.world].queue.push(
    ...Engine.instance.store.actions.outgoing[NetworkTopics.world].history
  )
}
