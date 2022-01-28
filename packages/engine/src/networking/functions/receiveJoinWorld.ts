// spawnPose is temporary - just so portals work for now - will be removed in favor of gameserver-gameserver communication

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Quaternion, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState, EngineActions } from '../../ecs/classes/EngineService'
import { Action } from '../../ecs/functions/Action'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { AvatarProps } from '../interfaces/WorldState'
import { dispatchFrom, dispatchLocal } from './dispatchFrom'
import { NetworkWorldAction } from './NetworkWorldAction'

export type JoinWorldProps = {
  tick: number
  clients: Array<{ userId: UserId; name: string; index: number }>
  cachedActions: Action[]
  avatarDetail: AvatarProps
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
}

export const receiveJoinWorld = (props: JoinWorldProps) => {
  const { tick, clients, cachedActions, avatarDetail, avatarSpawnPose } = props
  console.log('RECEIVED JOIN WORLD RESPONSE', tick, clients, cachedActions, avatarDetail, avatarSpawnPose)
  dispatchLocal(EngineActions.joinedWorld(true) as any)
  const world = useWorld()
  world.fixedTick = tick

  const engineState = accessEngineState()

  const spawnPose = engineState.isTeleporting.value
    ? {
        position: engineState.isTeleporting.value.remoteSpawnPosition,
        rotation: engineState.isTeleporting.value.remoteSpawnRotation
      }
    : avatarSpawnPose

  for (const client of clients)
    Engine.currentWorld.incomingActions.add(
      NetworkWorldAction.createClient({ $from: client.userId, name: client.name, index: client.index })
    )

  for (const action of cachedActions) Engine.currentWorld.incomingActions.add({ $fromCache: true, ...action } as any)

  dispatchFrom(Engine.userId, () =>
    NetworkWorldAction.spawnAvatar({
      ownerIndex: clients.find((client) => client.userId === Engine.userId)!.index,
      parameters: { ...spawnPose }
    })
  ).cache()

  dispatchFrom(Engine.userId, () => NetworkWorldAction.avatarDetails({ avatarDetail })).cache({
    removePrevious: true
  })
}
