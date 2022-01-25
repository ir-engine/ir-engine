import { FullscreenExit, Refresh, ZoomOutMap } from '@mui/icons-material'
import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles'
import {
  ClientSettingService,
  useClientSettingState
} from '@xrengine/client-core/src/admin/services/Setting/ClientSettingService'
import { Alerts } from '@xrengine/client-core/src/common/components/Alerts'
import { UIDialog } from '@xrengine/client-core/src/common/components/Dialog/Dialog'
import NavMenu from '@xrengine/client-core/src/common/components/NavMenu'
import UserToast from '@xrengine/client-core/src/common/components/Toast/UserToast'
import { theme as defaultTheme } from '@xrengine/client-core/src/theme'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import React, { Fragment, useCallback, useEffect, useState, Suspense } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { Helmet } from 'react-helmet'
import { useLocation } from 'react-router-dom'
import Me from '../Me'
import PartyVideoWindows from '../PartyVideoWindows'
import styles from './Layout.module.scss'
import Debug from '../Debug'
import InstanceChat from '../InstanceChat'
import MediaIconsBox from '../MediaIconsBox'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'

const TouchGamepad = React.lazy(() => import('@xrengine/client-core/src/common/components/TouchGamepad'))

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

interface Props {
  login?: boolean
  pageTitle: string
  children?: any
  hideVideo?: boolean
  hideFullscreen?: boolean
  theme?: any
}

const Layout = (props: Props): any => {
  const path = useLocation().pathname
  const { pageTitle, children, login } = props
  const authUser = useAuthState().authUser
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const handle = useFullScreenHandle()
  const [ctitle, setTitle] = useState<string>(clientSetting?.title || '')
  const [favicon16, setFavicon16] = useState(clientSetting?.favicon16px)
  const [favicon32, setFavicon32] = useState(clientSetting?.favicon32px)
  const [description, setDescription] = useState(clientSetting?.siteDescription)
  const engineState = useEngineState()

  useEffect(() => {
    !clientSetting && ClientSettingService.fetchClientSettings()
  }, [])

  useEffect(() => {
    if (clientSetting) {
      setTitle(clientSetting?.title)
      setFavicon16(clientSetting?.favicon16px)
      setFavicon32(clientSetting?.favicon32px)
      setDescription(clientSetting?.siteDescription)
    }
  }, [clientSettingState?.updateNeeded?.value])

  const reportChange = useCallback((state) => {
    if (state) {
      setFullScreenActive(state)
    } else {
      setFullScreenActive(state)
    }
  }, [])

  const iOS = (): boolean => {
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    )
  }

  const respawnCallback = (): void => {
    respawnAvatar(useWorld().localClientEntity)
  }

  //info about current mode to conditional render menus
  // TODO: Uncomment alerts when we can fix issues
  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FullScreen handle={handle} onChange={reportChange}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={props.theme ?? defaultTheme}>
            <section>
              <Helmet>
                <title>
                  {ctitle} | {pageTitle}
                </title>
                {description && <meta name="description" content={description}></meta>}
                {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
                {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
              </Helmet>
              <header>
                {path === '/login' && <NavMenu login={login} />}
                {!props.hideVideo && (
                  <>
                    <section className={styles.locationUserMenu}>
                      {authUser?.accessToken?.value != null && authUser.accessToken.value.length > 0 && <Me />}
                      <PartyVideoWindows />
                    </section>
                    <UserToast />
                  </>
                )}
              </header>

              {!iOS() && (
                <>
                  {props.hideFullscreen ? null : fullScreenActive ? (
                    <button type="button" className={styles.fullScreen} onClick={handle.exit}>
                      <FullscreenExit />
                    </button>
                  ) : (
                    <button type="button" className={styles.fullScreen} onClick={handle.enter}>
                      <ZoomOutMap />
                    </button>
                  )}
                </>
              )}

              <button type="button" className={styles.respawn} id="respawn" onClick={respawnCallback}>
                <Refresh />
              </button>

              <Fragment>
                <UIDialog />
                <Alerts />
                {isTouchAvailable ? (
                  <Suspense fallback={<></>}>
                    <TouchGamepad layout="default" />
                  </Suspense>
                ) : null}
                {children}
                {engineState.joinedWorld.value && (
                  <>
                    <Debug />
                    {/* <RecordingApp /> */}
                    <MediaIconsBox />
                    <UserMenu />
                    <InstanceChat />
                  </>
                )}
              </Fragment>
            </section>
          </ThemeProvider>
        </StyledEngineProvider>
      </FullScreen>
    </div>
  )
}

export default Layout
