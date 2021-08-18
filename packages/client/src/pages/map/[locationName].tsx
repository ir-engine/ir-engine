import World, { EngineCallbacks } from '../../components/World/index'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../../components/Layout/Layout'
import { Chat } from './icons/Chat'
import { CloseChat } from './icons/CloseChat'
import { SendMessage } from './icons/SendMessage'
// import InstanceChat from '../../components/InstanceChat'
import InstanceChat from './MapInstanceChat'
import MapInstanceChatStyle from './MapInstanceChat.module.scss'
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
