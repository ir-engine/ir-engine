// spawnPose is temporary - just so portals work for now - will be removed in favor of gameserver-gameserver communication
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState, EngineActions } from '../../ecs/classes/EngineService'
import { AvatarProps } from '../interfaces/WorldState'
import { NetworkWorldAction } from './NetworkWorldAction'

export type JoinWorldProps = {
  tick: number
  clients: Array<{ userId: UserId; name: string; index: number }>
  cachedActions: Action[]
  avatarDetail: AvatarProps
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
}

export const receiveJoinWorld = (props: JoinWorldProps) => {
  if (!props) {
    dispatchAction(Engine.store, EngineActions.connectToWorldTimeout(true))
    return
  }
  const { tick, clients, cachedActions, avatarDetail, avatarSpawnPose } = props
  console.log('RECEIVED JOIN WORLD RESPONSE', tick, clients, cachedActions, avatarDetail, avatarSpawnPose)
  dispatchAction(Engine.store, EngineActions.joinedWorld())
  const world = Engine.currentWorld
  world.fixedTick = tick

  const engineState = accessEngineState()

  const spawnPose = engineState.isTeleporting.value
    ? {
        position: world.activePortal.remoteSpawnPosition,
        rotation: world.activePortal.remoteSpawnRotation
      }
    : avatarSpawnPose

  for (const client of clients)
    Engine.currentWorld.store.actions.incoming.push(
      NetworkWorldAction.createClient({ $from: client.userId, name: client.name, index: client.index })
    )

  for (const action of cachedActions)
    Engine.currentWorld.store.actions.incoming.push({ $fromCache: true, ...action } as any)

  dispatchAction(
    world.store,
    NetworkWorldAction.spawnAvatar({
      parameters: { ...spawnPose }
    })
  )

  dispatchAction(world.store, NetworkWorldAction.avatarDetails({ avatarDetail }))
}
