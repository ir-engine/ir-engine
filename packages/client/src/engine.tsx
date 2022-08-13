import React, { Suspense, useEffect } from 'react'

import { API } from '@xrengine/client-core/src/API'
import { FullscreenContainer } from '@xrengine/client-core/src/components/FullscreenContainer'
import { createEngine, initializeBrowser, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'

import { initializei18n } from './util'

const AppPage = React.lazy(() => import('./pages/_app'))

const canvasStyle = {
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'fixed',
  WebkitUserSelect: 'none',
  pointerEvents: 'auto',
  userSelect: 'none'
} as React.CSSProperties
const engineRendererCanvasId = 'engine-renderer-canvas'

export default function () {
  useEffect(() => {
    createEngine()
    initializei18n()
    setupEngineActionSystems()
    initializeBrowser()
    API.createAPI()
  }, [])

  return (
    <FullscreenContainer>
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
      <AppPage />
    </FullscreenContainer>
  )
}
