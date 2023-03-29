import React, { useEffect } from 'react'

import {
  LocationInstanceConnectionService,
  useWorldInstance
} from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { DataChannels } from '@etherealengine/client-core/src/components/World/ProducersAndConsumers'
import { PeerMedia } from '@etherealengine/client-core/src/media/PeerMedia'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

export const EditorNetworkInstanceProvisioning = () => {
  const engineState = useEngineState()
  const worldHostID = useHookstate(getMutableState(NetworkState).hostIds.world).value

  const currentLocationInstanceConnection = useWorldInstance()

  useEffect(() => {
    if (
      engineState.isEngineInitialized.value &&
      currentLocationInstanceConnection?.value &&
      !currentLocationInstanceConnection.connected.value &&
      currentLocationInstanceConnection.provisioned.value &&
      !currentLocationInstanceConnection.connecting.value
    )
      LocationInstanceConnectionService.connectToServer(worldHostID!)
  }, [
    engineState.isEngineInitialized,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.connecting,
    currentLocationInstanceConnection?.provisioned
  ])

  return (
    <>
      <DataChannels />
      <PeerMedia />
    </>
  )
}
