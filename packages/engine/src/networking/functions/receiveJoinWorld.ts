// spawnPose is temporary - just so portals work for now - will be removed in favor of gameserver-gameserver communication
import { Quaternion, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState, EngineActions } from '../../ecs/classes/EngineService'
import { AvatarProps } from '../interfaces/WorldState'
import { NetworkWorldAction } from './NetworkWorldAction'

export type JoinWorldProps = {
  elapsedTime: number
  clockTime: number
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
  const { elapsedTime, clockTime, client, cachedActions, avatarDetail, avatarSpawnPose } = props
  console.log(
    'RECEIVED JOIN WORLD RESPONSE',
    elapsedTime,
    clockTime,
    client,
    cachedActions,
    avatarDetail,
    avatarSpawnPose
  )
  dispatchAction(Engine.instance.store, EngineActions.joinedWorld())
  const world = Engine.instance.currentWorld

  world.elapsedTime = elapsedTime + (Date.now() - clockTime) / 1000
  world.fixedTick = Math.floor(world.elapsedTime / world.fixedDelta)
  world.fixedElapsedTime = world.fixedTick * world.fixedDelta

  const engineState = accessEngineState()

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
