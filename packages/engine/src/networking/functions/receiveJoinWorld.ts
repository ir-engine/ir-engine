// spawnPose is temporary - just so portals work for now - will be removed in favor of gameserver-gameserver communication
import { Quaternion, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { performance } from '../../common/functions/performance'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { AvatarProps } from '../interfaces/WorldState'
import { NetworkWorldAction } from './NetworkWorldAction'

export type JoinWorldProps = {
  highResTimeOrigin: number
  worldStartTime: number
  client: { name: string; index: number }
  cachedActions: Required<Action<any>>[]
  avatarDetail: AvatarProps
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
}

export const receiveJoinWorld = (props: JoinWorldProps) => {
  if (!props) {
    dispatchAction(Engine.instance.store, EngineActions.connectToWorldTimeout({ instance: true }))
    return
  }
  const { highResTimeOrigin, worldStartTime, client, cachedActions, avatarDetail, avatarSpawnPose } = props
  console.log(
    'RECEIVED JOIN WORLD RESPONSE',
    highResTimeOrigin,
    worldStartTime,
    client,
    cachedActions,
    avatarDetail,
    avatarSpawnPose
  )
  dispatchAction(Engine.instance.store, EngineActions.joinedWorld())
  const world = Engine.instance.currentWorld

  world.startTime = highResTimeOrigin - performance.timeOrigin + worldStartTime

  const engineState = getEngineState()

  const spawnPose = engineState.isTeleporting.value
    ? {
        position: world.activePortal.remoteSpawnPosition,
        rotation: world.activePortal.remoteSpawnRotation
      }
    : avatarSpawnPose

  for (const action of cachedActions)
    Engine.instance.currentWorld.store.actions.incoming.push({ ...action, $fromCache: true })

  dispatchAction(world.store, NetworkWorldAction.createClient(client))
  dispatchAction(world.store, NetworkWorldAction.spawnAvatar({ parameters: spawnPose }))
  dispatchAction(world.store, NetworkWorldAction.avatarDetails({ avatarDetail }))
}
