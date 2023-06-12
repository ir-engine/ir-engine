// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { useCallback, useEffect, useRef } from 'react'

import {
  AdminClientSettingsState,
  ClientSettingService
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import { initGA, logPageView } from '@etherealengine/client-core/src/common/analytics'
import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import { defaultAction } from '@etherealengine/client-core/src/common/components/NotificationActions'
import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import InviteToast from '@etherealengine/client-core/src/components/InviteToast'
import { theme } from '@etherealengine/client-core/src/theme'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import GlobalStyle from '@etherealengine/client-core/src/util/GlobalStyle'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { loadWebappInjection } from '@etherealengine/projects/loadWebappInjection'

import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles'

import AdminRouterComp from '../route/admin'

import './styles.scss'

import { AdminCoilSettingService } from '@etherealengine/client-core/src/admin/services/Setting/CoilSettingService'
import { API } from '@etherealengine/client-core/src/API'
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
import Debug from '@etherealengine/client-core/src/components/Debug'
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
  const authState = useHookstate(getMutableState(AuthState))
  const selfUser = authState.user
  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
  const appTheme = useHookstate(getMutableState(AppThemeState))
  const [clientSetting] = clientSettingState?.client?.get({ noproxy: true }) || []
  const clientThemeSettings = useHookstate(clientSetting?.themeSettings)
  const projectComponents = useHookstate<Array<any>>([])
  const fetchedProjectComponents = useHookstate(false)
  const projectState = useHookstate(getMutableState(ProjectState))

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
    addActionReceptor(AppThemeServiceReceptor)

    return () => {
      removeActionReceptor(receptor)
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
      if (!fetchedProjectComponents.value) {
        fetchedProjectComponents.set(true)
        API.instance.client
          .service('projects')
          .find()
          .then((projects) => {
            loadWebappInjection(projects).then((result) => {
              projectComponents.set(result)
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
      clientThemeSettings.set(clientSetting?.themeSettings)
    }
    if (clientSettingState?.updateNeeded?.value) ClientSettingService.fetchClientSettings()
  }, [clientSettingState?.updateNeeded?.value])

  useEffect(() => {
    updateTheme()
  }, [clientThemeSettings.value, appTheme.value?.customTheme])

  const updateTheme = () => {
    const currentThemeName = getAppThemeName()
    const theme = getAppTheme()
    if (theme)
      for (const variable of Object.keys(theme)) {
        ;(document.querySelector(`[data-theme=${currentThemeName}]`) as any)?.style.setProperty(
          '--' + variable,
          theme[variable]
        )
      }
  }
  const currentThemeName = useAppThemeName()

  return (
    <>
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
              <Debug />
            </div>
            <AdminRouterComp />
            {projectComponents.get({ noproxy: true }).map((Component, i) => (
              <Component key={i} />
            ))}
          </SnackbarProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

export default AdminPage
