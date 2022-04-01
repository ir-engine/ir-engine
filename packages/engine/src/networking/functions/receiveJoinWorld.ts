// spawnPose is temporary - just so portals work for now - will be removed in favor of gameserver-gameserver communication
import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState, EngineActions } from '../../ecs/classes/EngineService'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { dispatchAction, dispatchLocalAction } from '../../hyperflux'
import { Action } from '../../hyperflux/functions/ActionFunctions'
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
    dispatchLocalAction(EngineActions.connectToWorldTimeout(true))
    return
  }
  const { tick, clients, cachedActions, avatarDetail, avatarSpawnPose } = props
  console.log('RECEIVED JOIN WORLD RESPONSE', tick, clients, cachedActions, avatarDetail, avatarSpawnPose)
  dispatchLocalAction(EngineActions.joinedWorld())
  const world = useWorld()
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
    NetworkWorldAction.spawnAvatar({
      ownerIndex: clients.find((client) => client.userId === Engine.userId)!.index,
      parameters: { ...spawnPose }
    })
  ).cache()

  dispatchAction(NetworkWorldAction.avatarDetails({ avatarDetail })).cache({
    removePrevious: true
  })
}
