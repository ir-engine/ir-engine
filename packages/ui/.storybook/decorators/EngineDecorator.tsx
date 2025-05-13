import { ThemeState, useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import * as ECS from '@ir-engine/ecs'
import { HyperFlux } from '@ir-engine/hyperflux'
import '@ir-engine/spatial'
import { destroySpatialEngine, initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import { startTimer } from '@ir-engine/spatial/src/startTimer'

import React, { useEffect, useRef, useState } from 'react'

globalThis.ECS = ECS

const ThemeProvider = () => {
  useThemeProvider()
  useEffect(() => ThemeState.setTheme('dark'), [])
  return null
}

const CanvasEngine = () => {
  const ref = useRef(document.body)
  useEngineCanvas(ref)

  return (
    <>
      <canvas id="engine-renderer-canvas" className="absolute left-0 top-0 z-[-1] h-full w-full"></canvas>
    </>
  )
}

export default function EngineDecorator() {
  const [engineInitialized, setEngineInitialized] = useState(false)

  useEffect(() => {
    if (engineInitialized) return
    ECS.createEngine(HyperFlux.store)
    startTimer()
    setEngineInitialized(true)

    return ECS.destroyEngine
  }, [])

  useEffect(() => {
    if (!engineInitialized) return
    initializeSpatialEngine()

    return destroySpatialEngine
  }, [engineInitialized])

  if (!engineInitialized) return null

  return (
    <>
      <ThemeProvider />
      <CanvasEngine />
    </>
  )
}
