import { useEffect } from 'react'

import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState,
  useWorldInstance
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useHookstate } from '@xrengine/hyperflux'

export const useEditorNetworkInstanceProvisioning = () => {
  const engineState = useEngineState()

  const worldNetworkHostId = useHookstate(Engine.instance.currentWorld.hostIds.world).value!
  const currentLocationInstanceConnection = useWorldInstance()

  useEffect(() => {
    if (
      engineState.isEngineInitialized.value &&
      currentLocationInstanceConnection?.value &&
      !currentLocationInstanceConnection.connected.value &&
      currentLocationInstanceConnection.provisioned.value &&
      !currentLocationInstanceConnection.connecting.value
    )
      LocationInstanceConnectionService.connectToServer(worldNetworkHostId)
  }, [
    engineState.isEngineInitialized,
    currentLocationInstanceConnection?.connected,
    currentLocationInstanceConnection?.connecting,
    currentLocationInstanceConnection?.provisioned
  ])
}
