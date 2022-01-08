// spawnPose is temporary - just so portals work for now - will be removed in favor of gameserver-gameserver communication
import { SpawnPoints } from '../../avatar/AvatarSpawnSystem'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, accessEngineState } from '../../ecs/classes/EngineService'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkWorldAction } from './NetworkWorldAction'
import { dispatchFrom, dispatchLocal } from './dispatchFrom'

export const receiveJoinWorld = ({ tick, clients, cachedActions, avatarDetail }) => {
  console.log('RECEIVED JOIN WORLD RESPONSE', tick, clients, cachedActions, avatarDetail)
  dispatchLocal(EngineActions.joinedWorld(true) as any)
  useWorld().fixedTick = tick

  const engineState = accessEngineState()

  const spawnPose = engineState.isTeleporting.value
    ? {
        position: engineState.isTeleporting.value.remoteSpawnPosition,
        rotation: engineState.isTeleporting.value.remoteSpawnRotation
      }
    : SpawnPoints.instance.getRandomSpawnPoint()

  for (const client of clients)
    Engine.currentWorld.incomingActions.add(
      NetworkWorldAction.createClient({ $from: client.userId, name: client.name })
    )

  for (const action of cachedActions) Engine.currentWorld.incomingActions.add({ $fromCache: true, ...action })

  dispatchFrom(Engine.userId, () =>
    NetworkWorldAction.spawnAvatar({
      parameters: { ...spawnPose }
    })
  ).cache()

  dispatchFrom(Engine.userId, () => NetworkWorldAction.avatarDetails({ avatarDetail })).cache({
    removePrevious: true
  })
}
