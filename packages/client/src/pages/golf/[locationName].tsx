import React, { useState } from 'react'
// import Scene from '../../components/Golf/golfLocation'
import Scene, { EngineCallbacks } from '../../components/Scene/location'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { GolfSystem } from '@xrengine/engine/src/game/templates/Golf/GolfSystem'
import { GameManagerSystem } from '@xrengine/engine/src/game/systems/GameManagerSystem'
import { AnimationSystem } from '@xrengine/engine/src/avatar/AnimationSystem'
import { registerGolfBotHooks } from '@xrengine/engine/src/game/templates/Golf/functions/registerGolfBotHooks'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'

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
      system: GolfSystem,
      after: GameManagerSystem
    },
    {
      remove: AnimationSystem
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
    onSuccess: registerGolfBotHooks
  }

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <LoadingScreen objectsToLoad={loadingItemCount} />
      <Scene
        locationName={props.match.params.locationName}
        history={props.history}
        engineInitializeOptions={engineInitializeOptions}
        engineCallbacks={engineCallbacks}
      />
    </Layout>
  )
}

export default LocationPage
