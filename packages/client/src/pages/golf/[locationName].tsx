import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { registerGolfBotHooks } from '@xrengine/engine/src/game/templates/Golf/functions/registerGolfBotHooks'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'
import MediaIconsBox from '../../components/MediaIconsBox'
import World, { EngineCallbacks } from '../../components/World'

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
