import World, { EngineCallbacks } from '../../components/World/index'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'
import MapMediaIconsBox from './MapMediaIconsBox'
import MapUserMenu from './MapUserMenu'
import { theme } from './theme'
import LoadingScreen from './loader'

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
    <Layout theme={theme} hideVideo={true} hideFullscreen={true} pageTitle={t('location.locationName.pageTitle')}>
      <LoadingScreen objectsToLoad={loadingItemCount} />
      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        engineCallbacks={engineCallbacks}
      >
        <MapMediaIconsBox />
        <MapUserMenu />
      </World>
    </Layout>
  )
}

export default LocationPage
