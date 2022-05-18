// prettier-ignore
import './env-config';

import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { createNetworkTransports } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { createEngine, initializeBrowser } from '@xrengine/engine/src/initializeEngine'

import { initialize } from './util'

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
    initializeBrowser()
    createNetworkTransports()
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
