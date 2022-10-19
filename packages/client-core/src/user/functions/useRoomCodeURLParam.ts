import { useEffect } from 'react'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getState } from '@xrengine/hyperflux'

import { LocationInstanceState } from '../../common/services/LocationInstanceConnectionService'

/** @todo use room code instead of instance id */
export const useRoomCodeURLParam = (roomCode = true, instanceId = true) => {
  const locationInstance = getState(LocationInstanceState)
  const worldNetwork = Engine.instance.currentWorld.worldNetwork
  const instance = locationInstance.instances[worldNetwork?.hostId]?.ornull

  useEffect(() => {
    if (worldNetwork) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams
      instanceId && query.set('roomCode', instance.roomCode.value)
      roomCode && query.set('instanceId', worldNetwork.hostId)
      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
  }, [locationInstance.instances, instance])
}
