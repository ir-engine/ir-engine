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

import React, { createRef, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@etherealengine/client-core/src/API'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import waitForClientAuthenticated from '@etherealengine/client-core/src/util/wait-for-client-authenticated'
import { pipeLogs } from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { initializeBrowser } from '@etherealengine/engine/src/initializeBrowser'
import { getMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'

import { initializei18n } from './util'

const initializeLogs = async () => {
  await waitForClientAuthenticated()
  pipeLogs(Engine.instance.api)
}

createEngine(document.getElementById('engine-renderer-canvas') as HTMLCanvasElement)
getMutableState(EngineState).publicPath.set(
  // @ts-ignore
  import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
)
initializei18n()
initializeBrowser()
API.createAPI()
initializeLogs()

export default function ({ children, tailwind = false }): JSX.Element {
  const ref = createRef()
  const { t } = useTranslation()
  return !tailwind ? (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingClient')} />}>{children}</Suspense>
  ) : (
    children
  )
}
