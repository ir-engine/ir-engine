// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { AvatarProps } from '../interfaces/WorldState'
import { WorldNetworkAction } from './WorldNetworkAction'

export type JoinWorldRequestData = {
  inviteCode?: string
  spectateUserId?: UserId | 'none'
}

export type JoinWorldProps = {
  highResTimeOrigin: number
  worldStartTime: number
  client: { name: string; index: number }
  cachedActions: Required<Action>[]
  avatarDetail: AvatarProps
  avatarSpawnPose?: { position: Vector3; rotation: Quaternion }
  spectateUserId?: UserId | 'none'
}

export const receiveJoinWorld = (props: JoinWorldProps) => {
  if (!props) return
  const { highResTimeOrigin, worldStartTime, client, cachedActions, avatarDetail, avatarSpawnPose, spectateUserId } =
    props
  console.log(
    'RECEIVED JOIN WORLD RESPONSE',
    highResTimeOrigin,
    worldStartTime,
    client,
    cachedActions,
    avatarDetail,
    avatarSpawnPose,
    spectateUserId
  )
  dispatchAction(EngineActions.joinedWorld())
  const world = Engine.instance.currentWorld

  const engineState = getEngineState()

  const spawnPose = engineState.isTeleporting.value
    ? {
        position: world.activePortal.remoteSpawnPosition,
        rotation: world.activePortal.remoteSpawnRotation
      }
    : avatarSpawnPose

  for (const action of cachedActions) Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true })

  dispatchAction(WorldNetworkAction.createPeer(client), world.worldNetwork.hostId)

  if (spectateUserId) {
    if (spectateUserId !== 'none') dispatchAction(EngineActions.spectateUser({ user: spectateUserId }))
  } else if (spawnPose) {
    dispatchAction(WorldNetworkAction.spawnAvatar({ parameters: spawnPose }), world.worldNetwork.hostId)
    dispatchAction(WorldNetworkAction.avatarDetails({ avatarDetail }), world.worldNetwork.hostId)
  }
}
