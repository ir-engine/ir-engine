// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  ClientSettingService,
  useClientSettingState
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import { initGA, logPageView } from '@etherealengine/client-core/src/common/analytics'
import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import { defaultAction } from '@etherealengine/client-core/src/common/components/NotificationActions'
import { ProjectService, useProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import InviteToast from '@etherealengine/client-core/src/components/InviteToast'
import { theme } from '@etherealengine/client-core/src/theme'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import GlobalStyle from '@etherealengine/client-core/src/util/GlobalStyle'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { loadWebappInjection } from '@etherealengine/projects/loadWebappInjection'

import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles'

import AdminRouterComp from '../route/admin'

import './styles.scss'

import {
  AdminCoilSettingService,
  useCoilSettingState
} from '@etherealengine/client-core/src/admin/services/Setting/CoilSettingService'
import { API } from '@etherealengine/client-core/src/API'
import ErrorBoundary from '@etherealengine/client-core/src/common/components/ErrorBoundary'
import UIDialog from '@etherealengine/client-core/src/common/components/UIDialog'
import {
  AppThemeServiceReceptor,
  AppThemeState,
  getAppTheme,
  getAppThemeName,
  useAppThemeName
} from '@etherealengine/client-core/src/common/services/AppThemeState'
import {
  NotificationAction,
  NotificationActions
} from '@etherealengine/client-core/src/common/services/NotificationService'
import {
  OEmbedService,
  OEmbedServiceReceptor,
  useOEmbedState
} from '@etherealengine/client-core/src/common/services/OEmbedService'
import Debug from '@etherealengine/client-core/src/components/Debug'
import config from '@etherealengine/common/src/config'
import { getCurrentTheme } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const AdminPage = (): any => {
  const notistackRef = useRef<SnackbarProvider>()
  const authState = useAuthState()
  const selfUser = authState.user
  const clientSettingState = useClientSettingState()
  const coilSettingState = useCoilSettingState()
  const appTheme = useHookstate(getMutableState(AppThemeState))
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
  const oEmbedState = useOEmbedState()
  const pathname = oEmbedState.pathname.value
  const oEmbed = oEmbedState.oEmbed

  const initApp = useCallback(() => {
    initGA()
    logPageView()
  }, [])

  useEffect(() => {
    const receptor = (action): any => {
      // @ts-ignore
      matches(action).when(NotificationAction.notify.matches, (action) => {
        AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.alert, 0.5)
        notistackRef.current?.enqueueSnackbar(action.message, {
          variant: action.options.variant,
          action: NotificationActions[action.options.actionType ?? 'default']
        })
      })
    }
    addActionReceptor(receptor)
    addActionReceptor(OEmbedServiceReceptor)
    addActionReceptor(AppThemeServiceReceptor)

    return () => {
      removeActionReceptor(receptor)
      removeActionReceptor(OEmbedServiceReceptor)
      removeActionReceptor(AppThemeServiceReceptor)
    }
  }, [])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.dataset.theme = getAppThemeName()
      updateTheme()
    }
  }, [selfUser?.user_setting?.value])

  useEffect(initApp, [])

  // useEffect(() => {
  //   chapiWalletPolyfill
  //     .loadOnce()
  //     .then(() => console.log('CHAPI wallet polyfill loaded.'))
  //     .catch((e) => console.error('Error loading polyfill:', e))
  // }, [])

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
  }, [clientThemeSettings, appTheme.customTheme])

  const location = useLocation()
  const oembedLink = `${config.client.serverUrl}/oembed?url=${encodeURIComponent(
    `${config.client.clientUrl}${location.pathname}`
  )}&format=json`

  useEffect(() => {
    if (pathname !== location.pathname) {
      OEmbedService.fetchData(location.pathname, `${config.client.clientUrl}${location.pathname}`)
    }
  }, [location.pathname])

  const updateTheme = () => {
    const currentThemeName = getAppThemeName()
    const theme = getAppTheme()
    if (theme)
      for (let variable of Object.keys(theme)) {
        ;(document.querySelector(`[data-theme=${currentThemeName}]`) as any)?.style.setProperty(
          '--' + variable,
          theme[variable]
        )
      }
  }
  const currentThemeName = useAppThemeName()

  return (
    <>
      <MetaTags>
        {oembedLink && <link href={oembedLink} type="application/json+oembed" rel="alternate" title="Cool Pants" />}
        {oEmbed.value && pathname === location.pathname ? (
          <>
            <title>{oEmbed.value.title}</title>
            <meta name="description" content={oEmbed.value.description} />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={oEmbed.value.query_url} />
            <meta property="og:title" content={oEmbed.value.title} />
            <meta property="og:description" content={oEmbed.value.description} />
            <meta
              property="og:image"
              content={oEmbed.value.url ? oEmbed.value.url : `${oEmbed.value.provider_url}/static/etherealengine.png`}
            />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:domain" content={oEmbed.value.provider_url?.replace('https://', '')} />
            <meta name="twitter:title" content={oEmbed.value.title} />
            <meta name="twitter:description" content={oEmbed.value.description} />
            <meta
              property="twitter:image"
              content={oEmbed.value.url ? oEmbed.value.url : `${oEmbed.value.provider_url}/static/etherealengine.png`}
            />
            <meta name="twitter:url" content={oEmbed.value.query_url} />
          </>
        ) : (
          <>
            <title>{ctitle}</title>
            {description && <meta name="description" content={description} data-rh="true" />}
          </>
        )}

        {paymentPointer && <meta name="monetization" content={paymentPointer} />}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no"
        />
        <meta name="theme-color" content={clientThemeSettings?.[currentThemeName]?.mainBackground || '#FFFFFF'} />
        {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
        {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
      </MetaTags>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            ref={notistackRef as any}
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
            <AdminRouterComp />
            {projectComponents.map((Component, i) => (
              <Component key={i} />
            ))}
          </SnackbarProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

export default AdminPage
