/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@etherealengine/client-core/src/API'
import { BrowserRouter, history } from '@etherealengine/client-core/src/common/services/RouterService'
import waitForClientAuthenticated from '@etherealengine/client-core/src/util/wait-for-client-authenticated'
import { pipeLogs } from '@etherealengine/common/src/logger'
import { Engine, createEngine } from '@etherealengine/ecs/src/Engine'
import { getMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { startTimer } from '@etherealengine/spatial/src/startTimer'

import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import { initializei18n } from './util'

const initializeLogs = async () => {
  await waitForClientAuthenticated()
  pipeLogs(Engine.instance.api)
}

createEngine()
startTimer()
getMutableState(EngineState).publicPath.set(
  // @ts-ignore
  import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
)
initializei18n()
API.createAPI()
initializeLogs()

export default function ({ children }): JSX.Element {
  const { t } = useTranslation()

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const redirectUrl = urlSearchParams.get('redirectUrl')
    if (redirectUrl) {
      history.push(redirectUrl)
    }
  }, [])

  return (
    <>
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
    </>
  )
}
