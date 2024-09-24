/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import React, { Suspense, useEffect } from 'react'
import ReactGA from 'react-ga4'
import { useTranslation } from 'react-i18next'

import { API as ClientAPI } from '@ir-engine/client-core/src/API'
import { BrowserRouter, history } from '@ir-engine/client-core/src/common/services/RouterService'
import waitForClientAuthenticated from '@ir-engine/client-core/src/util/wait-for-client-authenticated'
import { API } from '@ir-engine/common'
import { pipeLogs } from '@ir-engine/common/src/logger'
import { createHyperStore, getMutableState } from '@ir-engine/hyperflux'

import MetaTags from '@ir-engine/client-core/src/common/components/MetaTags'
import config from '@ir-engine/common/src/config'
import { clientSettingPath } from '@ir-engine/common/src/schema.type.module'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import TagManager from '@sooro-io/react-gtm-module'
import { initializei18n } from './util'

const authenticate = async () => {
  await waitForClientAuthenticated()
}

const initializeLogs = async () => {
  pipeLogs(API.instance)
}

const initializeGoogleServices = async () => {
  //@ts-ignore
  const clientSettings = await API.instance.service(clientSettingPath).find({})
  const [settings] = clientSettings.data

  // Initialize Google Analytics
  if (settings?.gaMeasurementId) {
    ReactGA.initialize(settings.gaMeasurementId)
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
  }

  if (settings?.gtmContainerId) {
    TagManager.initialize({
      gtmId: settings.gtmContainerId,
      auth: settings?.gtmAuth,
      preview: settings?.gtmPreview
    })
  }
}

//@ts-ignore
const publicDomain = import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
createHyperStore()
initializei18n()
ClientAPI.createAPI()

getMutableState(DomainConfigState).merge({
  publicDomain,
  cloudDomain: config.client.fileServer,
  proxyDomain: config.client.cors.proxyUrl
})

export default function ({ children }): JSX.Element {
  const { t } = useTranslation()

  useEffect(() => {
    authenticate().then(() => {
      initializeLogs()
      initializeGoogleServices()
    })

    const urlSearchParams = new URLSearchParams(window.location.search)
    const redirectUrl = urlSearchParams.get('redirectUrl')
    if (redirectUrl) {
      history.push(redirectUrl)
    }
  }, [])

  const theme = createTheme({})

  return (
    <ThemeProvider theme={theme}>
      <MetaTags>
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;600;800&display=swap"
          rel="stylesheet"
        />
      </MetaTags>
      <BrowserRouter history={history}>
        <Suspense
          fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingClient')} />}
        >
          {children}
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
