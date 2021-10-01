import EmoteMenu from '@xrengine/client-core/src/common/components/EmoteMenu'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal'
import React, { useState } from 'react'
import World, { EngineCallbacks } from '../../components/World/index'
import { useTranslation } from 'react-i18next'
import InstanceChat from '../../components/InstanceChat'
import Layout from '../../components/Layout/Layout'
import MediaIconsBox from '../../components/MediaIconsBox'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'

const LocationPage = (props) => {
  const [loadingItemCount, setLoadingItemCount] = useState(99)
  const { t } = useTranslation()

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineInitializeOptions: InitializeOptions = {
    systems: [
      // {
      //   injectionPoint: 'FIXED',
      //   system: import('@xrengine/client-core/src/systems/AvatarUISystem')
      // }
    ]
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
        engineInitializeOptions={engineInitializeOptions}
        showTouchpad
      >
        <InteractableModal />
        {/* <RecordingApp /> */}
        <MediaIconsBox />
        <UserMenu />
        <EmoteMenu />
        <InstanceChat />
      </World>
    </Layout>
  )
}

export default LocationPage
