import React from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { HostUserId } from '@xrengine/common/src/interfaces/UserId'
import { useHookedEffect } from '@xrengine/common/src/utils/useHookedEffect'
import { SpawnPoints } from '@xrengine/engine/src/avatar/AvatarSpawnSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'

import { client } from '../../feathers'
import GameServerWarnings from './GameServerWarnings'

export const OfflineLocation = () => {
  const engineState = useEngineState()
  const authState = useAuthState()

  /** OFFLINE */
  useHookedEffect(async () => {
    if (engineState.sceneLoaded.value) {
      const world = Engine.currentWorld
      const userId = authState.authUser.identityProvider.userId.value
      Engine.userId = userId
      world.hostId = Engine.userId as HostUserId

      const index = 1
      world.userIdToUserIndex.set(userId, index)
      world.userIndexToUserId.set(index, userId)
      world.clients.set(userId, {
        userId: userId,
        userIndex: index,
        name: authState.user.name.value,
        subscribedChatUpdates: []
      })

      const user = await client.service('user').get(Engine.userId)
      const avatarDetails = await client.service('avatar').get(user.avatarId!)

      const avatarSpawnPose = SpawnPoints.instance.getRandomSpawnPoint()
      receiveJoinWorld({
        tick: 0,
        clients: [
          {
            userId,
            index: 1,
            name: authState.user.name.value
          }
        ],
        cachedActions: [],
        avatarDetail: {
          avatarURL: avatarDetails.avatarURL,
          thumbnailURL: avatarDetails.thumbnailURL!
        },
        avatarSpawnPose
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  return <GameServerWarnings />
}

export default OfflineLocation
