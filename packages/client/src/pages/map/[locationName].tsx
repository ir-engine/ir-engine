import { FullscreenExit, ZoomOutMap } from '@material-ui/icons'
import { ThemeProvider } from '@material-ui/styles'
import { Alerts } from '@xrengine/client-core/src/common/components/Alerts'
import { UIDialog } from '@xrengine/client-core/src/common/components/Dialog/Dialog'
import EmoteMenu from '@xrengine/client-core/src/common/components/EmoteMenu'
import NavMenu from '@xrengine/client-core/src/common/components/NavMenu'
import { setUserHasInteracted } from '@xrengine/client-core/src/common/reducers/app/actions'
import { selectAppOnBoardingStep, selectAppState } from '@xrengine/client-core/src/common/reducers/app/selector'
import { Config } from '@xrengine/client-core/src/helper'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { theme } from '@xrengine/client-core/src/theme'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import React, { useCallback, useEffect, useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { Route, Switch, useLocation } from 'react-router-dom'
import { bindActionCreators, Dispatch } from 'redux'
import InstanceChat from '../../components/InstanceChat'
import World, { EngineCallbacks } from '../../components/World'
import JoinParty from './blockparty/JoinParty'
import Chat from './chatmicoff/Chat'
import MicOn from './chatmicon/MicOn'
import Block from './loader/Block'
import Loading from './loader/Loading'
import emoteMenuStyles from './MapEmoteMenu.module.scss'
import instanceChatStyles from './MapInstanceChat.module.scss'
import styles from './MapLayout.module.scss'
import MapMediaIconsBox from './MapMediaIconsBox'
import Mic from './microphone/Mic'
import ProfieEdit from './profileedit/ProfileEdit'
import ProfieEditing from './profileediting/ProfileEditing'
import UserMessage from './user/UserMessage'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

const siteTitle: string = Config.publicRuntimeConfig.siteTitle

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
      type: SystemUpdateType.Fixed,
      system: CharacterUISystem,
      after: UISystem
    }
  ]
}
interface Props {
  match?: any
  appState?: any
  authState?: any
  locationState?: any
  login?: boolean
  history?: any
  children?: any
  setUserHasInteracted?: any
  onBoardingStep?: number
}
const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    locationState: selectLocationState(state),
    onBoardingStep: selectAppOnBoardingStep(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setUserHasInteracted: bindActionCreators(setUserHasInteracted, dispatch)
})

const Layout = (props: Props): any => {
  const [loadingItemCount, setLoadingItemCount] = useState(99)
  const { t } = useTranslation()

  const path = useLocation().pathname
  const { appState, authState, setUserHasInteracted, login, locationState, onBoardingStep } = props
  const userHasInteracted = appState.get('userHasInteracted')
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false)
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const user = authState.get('user')
  const handle = useFullScreenHandle()

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: () => setLoadingItemCount(0)
  }

  const initialClickListener = () => {
    setUserHasInteracted()
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
  }

  useEffect(() => {
    if (userHasInteracted === false) {
      window.addEventListener('click', initialClickListener)
      window.addEventListener('touchend', initialClickListener)
    }
  }, [])

  const reportChange = useCallback((state) => {
    setFullScreenActive(state)
  }, [])

  return (
    <>
      <FullScreen handle={handle} onChange={reportChange}>
        <ThemeProvider theme={theme}>
          <section>
            <Helmet>
              <title>
                {siteTitle} | {t('location.locationName.pageTitle')}
              </title>
            </Helmet>
            <header>{path === '/login' && <NavMenu login={login} />}</header>

            {fullScreenActive ? (
              <button type="button" className={styles.fullScreen} onClick={handle.exit}>
                <FullscreenExit />
              </button>
            ) : (
              <button type="button" className={styles.fullScreen} onClick={handle.enter}>
                <ZoomOutMap />
              </button>
            )}
            <UIDialog />
            <Alerts />
            <LoadingScreen objectsToLoad={loadingItemCount} />
            <World
              locationName={props.match.params.locationName}
              history={props.history}
              engineCallbacks={engineCallbacks}
              showTouchpad
            >
              <MapMediaIconsBox />
              <UserMenu />
              <EmoteMenu styles={emoteMenuStyles} />
            </World>
            <footer>
              {locationState.get('currentLocation')?.get('location')?.id &&
                authState.get('authUser') != null &&
                authState.get('isLoggedIn') === true &&
                user?.instanceId != null &&
                !bottomDrawerOpen && (
                  <InstanceChat styles={instanceChatStyles} setBottomDrawerOpen={setBottomDrawerOpen} />
                )}
            </footer>
          </section>
        </ThemeProvider>
      </FullScreen>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout)
