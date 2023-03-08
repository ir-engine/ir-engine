import React, { createRef, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@etherealengine/client-core/src/API'
import { FullscreenContainer } from '@etherealengine/client-core/src/components/FullscreenContainer'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { createEngine, initializeBrowser, setupEngineActionSystems } from '@etherealengine/engine/src/initializeEngine'
import { getMutableState } from '@etherealengine/hyperflux'

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
  const ref = createRef()
  const { t } = useTranslation()
  return (
    <FullscreenContainer ref={ref}>
      <Suspense fallback={<LoadingCircle message={t('common:loader.connecting')} />}>{children}</Suspense>
    </FullscreenContainer>
  )
}
