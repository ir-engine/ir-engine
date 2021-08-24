import World, { EngineCallbacks } from '../../components/World/index'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'
import MapMediaIconsBox from './MapMediaIconsBox'
import MapUserMenu from './MapUserMenu'
import { theme } from './theme'
import LoadingScreen from './loader'
import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { TouchInputs } from '@xrengine/engine/src/input/enums/InputEnums'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'

import UserProfile from './UserProfile'
const LocationPage = (props) => {
  const [loadingItemCount, setLoadingItemCount] = useState(99)
  const { t } = useTranslation()
  const [isUserProfileOpen, setShowUserProfile] = useState(true)

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => setLoadingItemCount(0),
    onEngineInitialized: () => AvatarInputSchema.inputMap.set(TouchInputs.Touch, BaseInput.PRIMARY)
  }

  return (
    <Layout theme={theme} hideVideo={true} hideFullscreen={true} pageTitle={t('location.locationName.pageTitle')}>
      <UserProfile isUserProfileShowing={isUserProfileOpen} showHideProfile={setShowUserProfile} />
      <LoadingScreen objectsToLoad={loadingItemCount} />

      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        engineCallbacks={engineCallbacks}
      >
        <MapMediaIconsBox />
        <MapUserMenu showHideProfile={setShowUserProfile} />
      </World>
    </Layout>
  )
}

export default LocationPage
