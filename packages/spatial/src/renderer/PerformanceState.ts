/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { GetGPUTier, getGPUTier } from 'detect-gpu'
import { debounce } from 'lodash'
import { SMAAPreset } from 'postprocessing'
import { useEffect } from 'react'
import { Camera, Scene } from 'three'

import { ECSState } from '@etherealengine/ecs'
import { profile } from '@etherealengine/ecs/src/Timer'
import { defineState, getMutableState, getState, State, useMutableState } from '@etherealengine/hyperflux'
import { EngineRenderer, RenderSettingsState } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'

import { EngineState } from '../EngineState'
import { RendererState } from './RendererState'

type PerformanceTier = 0 | 1 | 2 | 3 | 4 | 5

const tieredSettings = {
  [0]: {
    engine: { useShadows: false, shadowMapResolution: 0, usePostProcessing: false, forceBasicMaterials: true },
    render: { smaaPreset: SMAAPreset.LOW }
  },
  [1]: {
    engine: { useShadows: false, shadowMapResolution: 0, usePostProcessing: false, forceBasicMaterials: false },
    render: { smaaPreset: SMAAPreset.LOW }
  },
  [2]: {
    engine: { useShadows: true, shadowMapResolution: 256, usePostProcessing: false, forceBasicMaterials: false },
    render: { smaaPreset: SMAAPreset.LOW }
  },
  [3]: {
    engine: { useShadows: true, shadowMapResolution: 512, usePostProcessing: false, forceBasicMaterials: false },
    render: { smaaPreset: SMAAPreset.MEDIUM }
  },
  [4]: {
    engine: { useShadows: true, shadowMapResolution: 1024, usePostProcessing: true, forceBasicMaterials: false },
    render: { smaaPreset: SMAAPreset.HIGH }
  },
  [5]: {
    engine: { useShadows: true, shadowMapResolution: 2048, usePostProcessing: true, forceBasicMaterials: false },
    render: { smaaPreset: SMAAPreset.ULTRA }
  }
} as {
  [key in PerformanceTier]: {
    engine: Partial<typeof RendererState._TYPE>
    render: Partial<typeof RenderSettingsState._TYPE>
  }
}

type ExponentialMovingAverage = {
  mean: number
  multiplier: number
}

const createExponentialMovingAverage = (timePeriods = 10, startingMean = 16): ExponentialMovingAverage => {
  return {
    mean: startingMean,
    multiplier: 2 / (timePeriods + 1)
  }
}

const updateExponentialMovingAverage = (average: State<ExponentialMovingAverage>, newValue: number) => {
  const meanIncrement = average.multiplier.value * (newValue - average.mean.value)
  const newMean = average.mean.value + meanIncrement
  average.mean.set(newMean)
}

export const PerformanceState = defineState({
  name: 'PerformanceState',
  initial: () => ({
    isMobileGPU: false as boolean | undefined,
    gpuTier: 3 as PerformanceTier,
    cpuTier: 3 as PerformanceTier,

    supportWebGL2: true,
    renderContext: null! as WebGL2RenderingContext,

    // The lower the performance the higher the offset
    gpuPerformanceOffset: 0,
    cpuPerformanceOffset: 0,

    // Render timings and constants
    // 180 = 3 * 60 = 3 seconds @ 60fps
    // 35 = 28fps
    // 18 = 55fps
    averageRenderTime: createExponentialMovingAverage(180 as const),
    maxRenderTime: 35 as const,
    minRenderTime: 18 as const,

    // System timings and constants
    averageSystemTime: createExponentialMovingAverage(180 as const),
    maxSystemTime: 35 as const,
    minSystemTime: 18 as const,

    gpu: 'unknown',
    device: 'unknown',
    budgets: {
      maxTextureSize: 0,
      max3DTextureSize: 0,
      maxBufferSize: 0,
      maxIndices: 0,
      maxVerticies: 0
    }
  }),
  reactor: () => {
    const performanceState = useMutableState(PerformanceState)
    const renderSettings = useMutableState(RenderSettingsState)
    const engineSettings = useMutableState(RendererState)
    const ecsState = useMutableState(ECSState)
    const isEditing = getState(EngineState).isEditing

    useEffect(() => {
      if (isEditing) return

      const performanceTier = performanceState.gpuTier.value
      const settings = tieredSettings[performanceTier]
      engineSettings.merge(settings.engine)
      renderSettings.merge(settings.render)
    }, [performanceState.gpuTier])

    useEffect(() => {
      if (isEditing) return

      const { averageRenderTime, maxRenderTime, minRenderTime, averageSystemTime, maxSystemTime, minSystemTime } =
        performanceState.value

      const renderMean = averageRenderTime.mean
      if (renderMean > maxRenderTime) {
        decrementGPUPerformance()
      } else if (renderMean < minRenderTime) {
        incrementGPUPerformance()
      }

      const systemMean = averageSystemTime.mean
      if (systemMean > maxSystemTime) {
        decrementGPUPerformance()
      } else if (renderMean < minSystemTime) {
        incrementGPUPerformance()
      }
    }, [performanceState.averageRenderTime])

    useEffect(() => {
      if (isEditing) return

      const lastDuration = ecsState.lastSystemExecutionDuration.value
      updateExponentialMovingAverage(performanceState.averageSystemTime, lastDuration)
    }, [ecsState.lastSystemExecutionDuration])
  }
})

const timeBeforeCheck = 3
let timeAccum = 0
let checkingRenderTime = false
/**
 * API to get GPU timings, with fallback if WebGL extension is not available (Not available on WebGL1 devices and Safari)
 * Will only run if not already running and the number of elapsed seconds since it last ran is greater than timeBeforeCheck
 *
 * @param renderer EngineRenderer
 * @param dt delta time
 * @returns Function to call after you call your render function
 */
const profileGPURender = (dt: number): (() => void) => {
  timeAccum += dt
  if (checkingRenderTime || timeAccum < timeBeforeCheck) return () => {}
  checkingRenderTime = true

  return timeRenderFrameGPU((renderTime) => {
    checkingRenderTime = false
    timeAccum = 0
    const performanceState = getMutableState(PerformanceState)
    updateExponentialMovingAverage(performanceState.averageRenderTime, Math.min(renderTime, 50))
  })
}

// Magic number to mimic GPU overhead on fallback timing
const fallbackMod = 10
const timeRenderFrameGPU = (callback: (number) => void = () => {}): (() => void) => {
  const fallback = () => {
    const end = profile()
    return () => {
      callback(end() * fallbackMod)
    }
  }

  const { renderContext, supportWebGL2 } = getState(PerformanceState)
  if (renderContext && supportWebGL2) {
    const gl = renderContext
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2')

    if (ext) {
      const startQuery = gl.createQuery()
      const endQuery = gl.createQuery()

      if (startQuery && endQuery) {
        ext.queryCounterEXT(startQuery, ext.TIMESTAMP_EXT)

        return () => {
          ext.queryCounterEXT(endQuery, ext.TIMESTAMP_EXT)

          requestAnimationFrame(function poll() {
            const available = gl.getQueryParameter(endQuery!, gl.QUERY_RESULT_AVAILABLE)
            const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT)

            if (available && !disjoint) {
              // Gets times in nanoseconds
              const timeStart = gl.getQueryParameter(startQuery!, gl.QUERY_RESULT)
              const timeEnd = gl.getQueryParameter(endQuery!, gl.QUERY_RESULT)
              const renderTime = (timeEnd - timeStart) * 0.000001
              callback(renderTime)
            } else if (disjoint) {
              console.warn('WebGL GPU timing disjointed')
            }

            if (available || disjoint) {
              gl.deleteQuery(startQuery)
              gl.deleteQuery(endQuery)
              checkingRenderTime = false
              timeAccum = 0
            } else {
              requestAnimationFrame(poll)
            }
          })
        }
      } else return fallback()
    } else return fallback()
  } else return fallback()
}

/**
 *
 * Debug function to get the GPU timings of a scene
 *
 * @param renderer EngineRenderer
 * @param scene Scene
 * @param camera Camera
 * @param onFinished Callback with the render time as a parameter
 */
const timeRender = (renderer: EngineRenderer, scene: Scene, camera: Camera, onFinished: (ms: number) => void) => {
  const end = timeRenderFrameGPU((renderTime) => {
    onFinished(renderTime)
  })
  renderer.renderer.render(scene, camera)
  end()

  scene.remove(camera)
}

const updatePerformanceState = (tierState: State<number>, tier: number, offsetState: State<number>, offset: number) => {
  if (tier !== tierState.value) {
    tierState.set(tier)
  }
  if (offset !== offsetState.value) {
    offsetState.set(offset)
  }
}

const debounceTime = 1000
const updateStateTierAndOffset = debounce(
  (tierState: State<number>, tier: number, offsetState: State<number>, offset: number) => {
    updatePerformanceState(tierState, tier, offsetState, offset)
  },
  debounceTime,
  { trailing: true, maxWait: debounceTime * 2 }
)

const incrementGPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.gpuTier,
    Math.min(performanceState.gpuTier.value + 1, 5),
    performanceState.gpuPerformanceOffset,
    Math.max(performanceState.gpuPerformanceOffset.value - 1, 0)
  )
}

const maxOffset = 12
const decrementGPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.gpuTier,
    Math.max(performanceState.gpuTier.value - 1, 0),
    performanceState.gpuPerformanceOffset,
    Math.min(performanceState.gpuPerformanceOffset.value + 1, maxOffset)
  )
}

const incrementCPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.cpuTier,
    Math.min(performanceState.cpuTier.value + 1, 5),
    performanceState.cpuPerformanceOffset,
    Math.max(performanceState.cpuPerformanceOffset.value - 1, 0)
  )
}

const decrementCPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.cpuTier,
    Math.max(performanceState.cpuTier.value - 1, 0),
    performanceState.cpuPerformanceOffset,
    Math.min(performanceState.cpuPerformanceOffset.value + 1, maxOffset)
  )
}

const buildPerformanceState = async (
  renderer: EngineRenderer,
  onFinished: () => void,
  override?: GetGPUTier['override']
) => {
  const performanceState = getMutableState(PerformanceState)
  const gpuTier = await getGPUTier({
    glContext: renderer.renderContext,
    desktopTiers: [0, 15, 30, 60, 120, 240],
    //Mobile is harder to determine, most phones lock benchmark rendering at 60fps
    mobileTiers: [0, 15, 30, 45, 60, 75],
    override
  })
  let tier = gpuTier.tier
  performanceState.isMobileGPU.set(gpuTier.isMobile)
  if (gpuTier.gpu) performanceState.gpu.set(gpuTier.gpu)
  if (gpuTier.device) performanceState.device.set(gpuTier.device)

  const gl = renderer.renderContext as WebGL2RenderingContext
  performanceState.supportWebGL2.set(renderer.supportWebGL2)
  performanceState.renderContext.set(gl)
  const max3DTextureSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)
  performanceState.budgets.set({
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    max3DTextureSize: max3DTextureSize,
    maxBufferSize:
      window.screen.availWidth *
      window.screen.availHeight *
      window.devicePixelRatio *
      window.devicePixelRatio *
      gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
    maxIndices: gl.getParameter(gl.MAX_ELEMENTS_INDICES) * 2,
    maxVerticies: gl.getParameter(gl.MAX_ELEMENTS_VERTICES) * 2
  })

  if (gpuTier.isMobile) tier = Math.max(tier - 2, 0)

  performanceState.gpuTier.set(tier as PerformanceTier)
  onFinished()
}

export const PerformanceManager = {
  buildPerformanceState,
  profileGPURender,
  incrementGPUPerformance,
  decrementGPUPerformance,
  incrementCPUPerformance,
  decrementCPUPerformance
}
