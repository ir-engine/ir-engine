import { useEffect } from 'react'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState } from '@etherealengine/hyperflux'

import { LocationInstanceState, useWorldInstance } from '../../common/services/LocationInstanceConnectionService'

export const useRoomCodeURLParam = (roomCode = true, instanceId = true) => {
  const locationInstance = getMutableState(LocationInstanceState)
  const worldNetwork = Engine.instance.worldNetwork
  const instance = useWorldInstance()

  useEffect(() => {
    if (instance?.connected?.value) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams
      roomCode && query.set('roomCode', instance.roomCode.value)
      instanceId && query.set('instanceId', worldNetwork.hostId)
      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
  }, [locationInstance.instances, instance])
}
