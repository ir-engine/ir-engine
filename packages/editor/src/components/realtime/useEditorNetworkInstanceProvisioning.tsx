import { useEffect } from 'react'

import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState,
  useWorldInstance
} from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

export const useEditorNetworkInstanceProvisioning = () => {
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
}
