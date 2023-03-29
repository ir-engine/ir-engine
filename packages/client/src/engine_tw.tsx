import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@etherealengine/client-core/src/API'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { createEngine, initializeBrowser, setupEngineActionSystems } from '@etherealengine/engine/src/initializeEngine'
import { getMutableState } from '@etherealengine/hyperflux'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import { initializei18n } from './util'

createEngine()
getMutableState(EngineState).publicPath.set(
  // @ts-ignore
  import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
)
initializei18n()
setupEngineActionSystems()
initializeBrowser()
API.createAPI()

export default function ({ children }) {
  const { t } = useTranslation()
  return <Suspense fallback={<LoadingCircle message={t('common:loader.connecting')} />}>{children}</Suspense>
}
