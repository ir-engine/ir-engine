import React, { useState } from 'react'
import World, { EngineCallbacks } from '../../components/World'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import MediaIconsBox from '../../components/MediaIconsBox'
import { GolfSystem } from '@xrengine/engine/src/game/templates/Golf/GolfSystem'
import { GameManagerSystem } from '@xrengine/engine/src/game/systems/GameManagerSystem'
import { registerGolfBotHooks } from '@xrengine/engine/src/game/templates/Golf/functions/registerGolfBotHooks'

const engineRendererCanvasId = 'engine-renderer-canvas'

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
      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        engineCallbacks={engineCallbacks}
      >
        <UserMenu />
        <MediaIconsBox />
      </World>
    </Layout>
  )
}

export default LocationPage
