import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { createRef, useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { BrowserRouter, useLocation } from 'react-router-dom'

import {
  ClientSettingService,
  useClientSettingState
} from '@xrengine/client-core/src/admin/services/Setting/ClientSettingService'
import { initGA, logPageView } from '@xrengine/client-core/src/common/components/analytics'
import { defaultAction } from '@xrengine/client-core/src/common/components/NotificationActions'
import { ProjectService, useProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import InviteToast from '@xrengine/client-core/src/components/InviteToast'
import { theme } from '@xrengine/client-core/src/theme'
import { AuthState, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import GlobalStyle from '@xrengine/client-core/src/util/GlobalStyle'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { loadWebappInjection } from '@xrengine/projects/loadWebappInjection'

import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles'

import RouterComp from '../route/public'

import './styles.scss'

import {
  AdminCoilSettingService,
  useCoilSettingState
} from '@xrengine/client-core/src/admin/services/Setting/CoilSettingService'
import { API } from '@xrengine/client-core/src/API'
import UIDialog from '@xrengine/client-core/src/common/components/Dialog'
import { NotificationAction, NotificationActions } from '@xrengine/client-core/src/common/services/NotificationService'
import Debug from '@xrengine/client-core/src/components/Debug'
import { clientHost, serverHost } from '@xrengine/common/src/config'
import { getCurrentTheme } from '@xrengine/common/src/constants/DefaultThemeSettings'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const App = (): any => {
  const notistackRef = createRef<SnackbarProvider>()
  const authState = useAuthState()
  const selfUser = authState.user
  const clientSettingState = useClientSettingState()
  const coilSettingState = useCoilSettingState()
  const paymentPointer = coilSettingState.coil[0]?.paymentPointer?.value
  const [clientSetting] = clientSettingState?.client?.value || []
  const [ctitle, setTitle] = useState<string>(clientSetting?.title || '')
  const [favicon16, setFavicon16] = useState(clientSetting?.favicon16px)
  const [favicon32, setFavicon32] = useState(clientSetting?.favicon32px)
  const [description, setDescription] = useState(clientSetting?.siteDescription)
  const [clientThemeSettings, setClientThemeSettings] = useState(clientSetting?.themeSettings)
  const [projectComponents, setProjectComponents] = useState<Array<any>>([])
  const [fetchedProjectComponents, setFetchedProjectComponents] = useState(false)
  const projectState = useProjectState()

  const initApp = useCallback(() => {
    if (process.env && process.env.NODE_CONFIG) {
      ;(window as any).env = process.env.NODE_CONFIG
    } else {
      ;(window as any).env = (window as any).env ?? ''
    }
    initGA()
    logPageView()
  }, [])

  useEffect(() => {
    const receptor = (action): any => {
      matches(action).when(NotificationAction.notify.matches, (action) => {
        AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.alert, 0.5)
        notistackRef.current?.enqueueSnackbar(action.message, {
          variant: action.options.variant,
          action: NotificationActions[action.options.actionType ?? 'default']
        })
      })
    }
    addActionReceptor(receptor)

    return () => {
      removeActionReceptor(receptor)
    }
  }, [notistackRef])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = getCurrentTheme(selfUser?.user_setting?.value?.themeModes)
      updateTheme()
    }
  }, [selfUser?.user_setting?.value])

  useEffect(initApp, [])

  useEffect(() => {
    chapiWalletPolyfill
      .loadOnce()
      .then(() => console.log('CHAPI wallet polyfill loaded.'))
      .catch((e) => console.error('Error loading polyfill:', e))
  }, [])

  useEffect(() => {
    if (selfUser?.id.value && projectState.updateNeeded.value) {
      ProjectService.fetchProjects()
      if (!fetchedProjectComponents) {
        setFetchedProjectComponents(true)
        API.instance.client
          .service('projects')
          .find()
          .then((projects) => {
            loadWebappInjection(projects).then((result) => {
              setProjectComponents(result)
            })
          })
      }
    }
  }, [selfUser, projectState.updateNeeded.value])

  useEffect(() => {
    Engine.instance.userId = selfUser.id.value
  }, [selfUser.id])

  useEffect(() => {
    authState.isLoggedIn.value && AdminCoilSettingService.fetchCoil()
  }, [authState.isLoggedIn])

  useEffect(() => {
    if (clientSetting) {
      setTitle(clientSetting?.title)
      setFavicon16(clientSetting?.favicon16px)
      setFavicon32(clientSetting?.favicon32px)
      setDescription(clientSetting?.siteDescription)
      setClientThemeSettings(clientSetting?.themeSettings)
    }
    if (clientSettingState?.updateNeeded?.value) ClientSettingService.fetchClientSettings()
  }, [clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    updateTheme()
  }, [clientThemeSettings])

  const currentTheme = getCurrentTheme(selfUser?.user_setting?.value?.themeModes)

  const location = useLocation()
  const oembedLink = `${serverHost}/oembed?url=${encodeURIComponent(`${clientHost}${location.pathname}`)}&format=json`

  const updateTheme = () => {
    if (clientThemeSettings) {
      if (clientThemeSettings?.[currentTheme]) {
        for (let variable of Object.keys(clientThemeSettings[currentTheme])) {
          ;(document.querySelector(`[data-theme=${currentTheme}]`) as any)?.style.setProperty(
            '--' + variable,
            clientThemeSettings[currentTheme][variable]
          )
        }
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>{ctitle}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no"
        />
        <meta name="theme-color" content={clientThemeSettings?.[currentTheme]?.mainBackground || '#FFFFFF'} />
        {description && <meta name="description" content={description}></meta>}
        {paymentPointer && <meta name="monetization" content={paymentPointer} />}
        {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
        {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
        {oembedLink && <link href={oembedLink} type="application/json+oembed" rel="alternate" title="Cool Pants" />}
      </Helmet>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            ref={notistackRef}
            maxSnack={7}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            action={defaultAction}
          >
            <GlobalStyle />
            <div style={{ pointerEvents: 'auto' }}>
              <InviteToast />
              <UIDialog />
              <Debug />
            </div>
            <RouterComp />
            {projectComponents.map((Component, i) => (
              <Component key={i} />
            ))}
          </SnackbarProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

const AppPage = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default AppPage
