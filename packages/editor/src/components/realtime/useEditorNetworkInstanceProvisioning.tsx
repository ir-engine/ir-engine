import {
  LocationInstanceConnectionService,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useHookEffect } from '@xrengine/hyperflux'

export const useEditorNetworkInstanceProvisioning = () => {
  const engineState = useEngineState()

  const worldNetworkHostId = Engine.instance.currentWorld.worldNetwork?.hostId
  const instanceConnectionState = useLocationInstanceConnectionState()
  const currentLocationInstanceConnection = instanceConnectionState.instances[worldNetworkHostId!].ornull

  useHookEffect(() => {
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
