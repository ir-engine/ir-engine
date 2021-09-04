import EmoteMenu from '@xrengine/client-core/src/common/components/EmoteMenu'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { AvatarUISystem } from '@xrengine/client-core/src/systems/AvatarUISystem'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { XRUISystem } from '@xrengine/engine/src/xrui/systems/XRUISystem'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DefaultNetworkSchema } from '@xrengine/engine/src/networking/templates/DefaultNetworkSchema'
import Layout from '../../components/Layout/Layout'
import MediaIconsBox from '../../components/MediaIconsBox'
import World, { EngineCallbacks } from '../../components/World'

const engineRendererCanvasId = 'engine-renderer-canvas'

const engineInitializeOptions: InitializeOptions = {
  publicPath: location.origin,
  renderer: {
    canvasId: engineRendererCanvasId
  },
  physics: {
    simulationEnabled: false
  },
  systems: [
    {
      type: SystemUpdateType.Fixed,
      system: AvatarUISystem,
      after: XRUISystem
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
    onSceneLoaded: () => setLoadingItemCount(0)
  }

  // Disable networking if no location is provided
  if (!props.match.params.locationName) {
    engineInitializeOptions.networking = { schema: DefaultNetworkSchema }
  }

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <LoadingScreen objectsToLoad={loadingItemCount} />
      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        engineInitializeOptions={engineInitializeOptions}
        engineCallbacks={engineCallbacks}
        showTouchpad
      >
        <InteractableModal />
        {/* <RecordingApp /> */}
        <MediaIconsBox />
        <UserMenu />
        <EmoteMenu />
      </World>
    </Layout>
  )
}

export default LocationPage
