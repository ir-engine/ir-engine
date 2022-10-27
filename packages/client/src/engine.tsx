import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@xrengine/client-core/src/API'
import { FullscreenContainer } from '@xrengine/client-core/src/components/FullscreenContainer'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createEngine, initializeBrowser, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'

import { initializei18n } from './util'

createEngine()
Engine.instance.publicPath = process.env.BASE_URL === '/client/' ? location.origin : process.env.BASE_URL!.slice(0, -1) // remove trailing '/'
initializei18n()
setupEngineActionSystems()
initializeBrowser()
API.createAPI()

const AppPage = React.lazy(() => import('./pages/_app'))

export default function () {
  const ref = React.createRef()
  const { t } = useTranslation()
  return (
    <FullscreenContainer ref={ref}>
      <Suspense fallback={<LoadingCircle message={t('common:loader:connecting')} />}>
        <AppPage />
      </Suspense>
    </FullscreenContainer>
  )
}
