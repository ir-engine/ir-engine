/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

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
