import { t } from 'i18next'
// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
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
import {
  OEmbedService,
  OEmbedServiceReceptor,
  useOEmbedState
} from '@etherealengine/client-core/src/common/services/OEmbedService'
import { ProjectService, useProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import config from '@etherealengine/common/src/config'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'
import { loadWebappInjection } from '@etherealengine/projects/loadWebappInjection'

import CaptureComp from '../route/capture'

import 'tailwindcss/tailwind.css'
import '../index.css'

import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import EngineTW from '../engine_tw'
import { ThemeContextProvider } from './themes/themeContext'

const AppPage = () => {
  const notistackRef = useRef<SnackbarProvider>()
  const authState = useAuthState()
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

    return () => {
      removeActionReceptor(receptor)
      removeActionReceptor(OEmbedServiceReceptor)
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

  const location = useLocation()
  const oembedLink = `${config.client.serverUrl}/oembed?url=${encodeURIComponent(
    `${config.client.clientUrl}${location.pathname}`
  )}&format=json`

  useEffect(() => {
    if (pathname !== location.pathname) {
      OEmbedService.fetchData(location.pathname, `${config.client.clientUrl}${location.pathname}`)
    }
  }, [location.pathname])

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
            <link href="/dist/index.css" rel="stylesheet" />
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
        {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
        {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
      </MetaTags>
      <div className="w-full h-full border-2">
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
    <Suspense fallback={<LoadingCircle message={t('common:loader.starting')} />}>
      <EngineTW>
        <ThemeContextProvider>
          <AppPage />
        </ThemeContextProvider>
      </EngineTW>
    </Suspense>
  )
}

export default TailwindPage
