import React, { useState } from 'react'
import World, { EngineCallbacks } from '../../components/World/index'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import EmoteMenu from '@xrengine/client-core/src/common/components/EmoteMenu'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import RecordingApp from '../../components/Recorder/RecordingApp'
import MediaIconsBox from '../../components/MediaIconsBox'

const engineRendererCanvasId = 'engine-renderer-canvas'

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

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <LoadingScreen objectsToLoad={loadingItemCount} />
      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        engineCallbacks={engineCallbacks}
        showTouchpad
      >
        <InteractableModal />
        <RecordingApp />
        <MediaIconsBox />
        <UserMenu />
        <EmoteMenu />
      </World>
    </Layout>
  )
}

export default LocationPage
