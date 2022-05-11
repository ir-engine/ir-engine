// prettier-ignore
import './env-config';

import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { createEngine, initializeBrowser } from '@xrengine/engine/src/initializeEngine'

import { initialize } from './util'

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

const Main = () => {
  useEffect(() => {
    createEngine()
    initializeBrowser()
  }, [])

  return (
    <Suspense fallback={<LoadingCircle />}>
      <canvas id={engineRendererCanvasId} style={canvasStyle} />
      <AppPage />
    </Suspense>
  )
}

initialize()
  // then load the app
  .then((_) => {
    ReactDOM.render(<Main />, document.getElementById('root'))
  })
