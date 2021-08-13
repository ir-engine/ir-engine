import EmoteMenu from '@xrengine/client-core/src/common/components/EmoteMenu'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import MapUserMenu from './MapUserMenu'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'
import World, { EngineCallbacks } from '../../components/World/index'
import MapMediaIconsBox from './MapMediaIconsBox'
// import InstanceChat from '../../components/InstanceChat'
import InstanceChat from './MapInstanceChat'
import MapInstanceChatStyle from './MapInstanceChat.module.scss'
import { CloseChat } from './icons/CloseChat'
import { Chat } from './icons/Chat'
import { SendMessage } from './icons/SendMessage'
import { theme } from './theme'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import UserMenu from '../../../../client-core/src/user/components/UserMenu'

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
        <InstanceChat
          newMessageLabel={'say something...'}
          CloseButton={CloseChat}
          MessageButton={Chat}
          SendButton={SendMessage}
          styles={MapInstanceChatStyle}
        />

        <MapMediaIconsBox />
        <MapUserMenu />
      </World>
    </Layout>
  )
}

export default LocationPage
