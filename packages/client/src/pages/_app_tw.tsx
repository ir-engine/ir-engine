// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  AdminClientSettingsState,
  ClientSettingService
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import {
  AdminCoilSettingService,
  AdminCoilSettingsState
} from '@etherealengine/client-core/src/admin/services/Setting/CoilSettingService'
import { API } from '@etherealengine/client-core/src/API'
import { initGA, logPageView } from '@etherealengine/client-core/src/common/analytics'
import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
// import { defaultAction } from '@etherealengine/client-core/src/common/components/NotificationActions'
import {
  NotificationAction,
  NotificationActions
} from '@etherealengine/client-core/src/common/services/NotificationService'
import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import Debug from '@etherealengine/client-core/src/components/Debug'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import config from '@etherealengine/common/src/config'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'
import { loadWebappInjection } from '@etherealengine/projects/loadWebappInjection'

import EngineTW from '../engine_tw'
import CaptureComp from '../route/capture'
import { ThemeContextProvider } from '../themes/themeContext'

const AppPage = () => {
  const notistackRef = useRef<SnackbarProvider>()
  const authState = useHookstate(getMutableState(AuthState))
  const selfUser = authState.user
  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
  const coilSettingState = useHookstate(getMutableState(AdminCoilSettingsState))
  const paymentPointer = coilSettingState.coil[0]?.paymentPointer?.value
  const [clientSetting] = clientSettingState?.client?.value || []
  const [ctitle, setTitle] = useState<string>(clientSetting?.title || '')
  const [favicon16, setFavicon16] = useState(clientSetting?.favicon16px)
  const [favicon32, setFavicon32] = useState(clientSetting?.favicon32px)
  const [description, setDescription] = useState(clientSetting?.siteDescription)
  const [projectComponents, setProjectComponents] = useState<Array<any>>([])
  const [fetchedProjectComponents, setFetchedProjectComponents] = useState(false)
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

    return () => {
      removeActionReceptor(receptor)
    }
  }, [])

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
    }
    if (clientSettingState?.updateNeeded?.value) ClientSettingService.fetchClientSettings()
  }, [clientSettingState?.updateNeeded?.value])

  return (
    <>
      <div className="w-full h-full container mx-auto overflow-y-scroll pointer-events-auto">
        <CaptureComp />
      </div>
      {projectComponents.map((Component, i) => (
        <Component key={i} />
      ))}
    </>
  )
}

const TailwindPage = () => {
  return (
    <EngineTW>
      <ThemeContextProvider>
        <AppPage />
        <Debug />
      </ThemeContextProvider>
    </EngineTW>
  )
}

export default TailwindPage
