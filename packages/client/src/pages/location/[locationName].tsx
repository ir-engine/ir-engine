import React, { useState } from 'react'
import Scene, { EngineCallbacks } from '../../components/Scene/location'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

const engineRendererCanvasId = 'engine-renderer-canvas'

const engineInitializeOptions: InitializeOptions = {
  publicPath: location.origin,
  networking: {
    schema: {
      transport: SocketWebRTCClientTransport
    } as NetworkSchema
  },
  renderer: {
    canvasId: engineRendererCanvasId
  },
  physics: {
    simulationEnabled: false,
    physxWorker: new Worker('/scripts/loadPhysXClassic.js')
  },
  systems: [
    {
      type: SystemUpdateType.Fixed,
      system: CharacterUISystem,
      after: UISystem
    }
  ]
}

const LocationPage = (props) => {
  const [loadingItemCount, setLoadingItemCount] = useState(99)
  const { t } = useTranslation()

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => setLoadingItemCount(0),
  }

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <LoadingScreen objectsToLoad={loadingItemCount} />
      <Scene
        locationName={props.match.params.locationName}
        history={props.history}
        engineInitializeOptions={engineInitializeOptions}
        showEmoteMenu
        showInteractable
        showRecordingApp
        showTouchpad
        engineCallbacks={engineCallbacks}
      />
    </Layout>
  )
}

export default LocationPage
