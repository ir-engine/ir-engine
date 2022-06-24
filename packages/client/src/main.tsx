// prettier-ignore
import './env-config';

import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { API } from '@xrengine/client-core/src/API'
import { FullscreenContainer } from '@xrengine/client-core/src/components/FullscreenContainer'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { createEngine, initializeBrowser, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'

import { initializei18n } from './util'

/**
 * Performance benchmark logging
 */

// const log = console.log
// console.log = (...args) => log(`${Math.round(performance.now()/100) / 10}s`, ...args)

// const info = console.info
// console.info = (...args) => info(`${Math.round(performance.now()/100) / 10}s`, ...args)

// const warn = console.warn
// console.warn = (...args) => warn(`${Math.round(performance.now()/100) / 10}s`, ...args)

// const error = console.error
// console.error = (...args) => error(`${Math.round(performance.now()/100) / 10}s`, ...args)

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
    setupEngineActionSystems()
    initializeBrowser()
    API.createAPI()
  }, [])

  return (
    <Suspense fallback={<LoadingCircle />}>
      <FullscreenContainer>
        <canvas id={engineRendererCanvasId} style={canvasStyle} />
        <AppPage />
      </FullscreenContainer>
    </Suspense>
  )
}

initializei18n()
ReactDOM.render(<Main />, document.getElementById('root'))
