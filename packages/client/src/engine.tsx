import React, { Suspense, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@xrengine/client-core/src/API'
import { FullscreenContainer } from '@xrengine/client-core/src/components/FullscreenContainer'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { createEngine, initializeBrowser, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'

import { initializei18n } from './util'

createEngine()
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
