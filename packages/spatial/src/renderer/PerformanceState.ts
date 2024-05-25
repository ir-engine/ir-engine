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
import { Camera, MathUtils, Scene } from 'three'

import { defineSystem, ECSState, PresentationSystemGroup } from '@etherealengine/ecs'
import { profile } from '@etherealengine/ecs/src/Timer'
import { defineState, getMutableState, getState, State, useMutableState } from '@etherealengine/hyperflux'
import { EngineRenderer, RenderSettingsState } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'

import { EngineState } from '../EngineState'
import { RendererState } from './RendererState'

type PerformanceTier = 0 | 1 | 2 | 3 | 4 | 5
type TargetFPS = 30 | 60
const maxPerformanceTier = 5
const maxPerformanceOffset = 12

const tieredSettings = {
  [0]: {
    engine: {
      useShadows: false,
      shadowMapResolution: 0,
      usePostProcessing: false,
      forceBasicMaterials: true,
      updateCSMFrustums: false,
      renderScale: 0.75
    },
    render: { smaaPreset: SMAAPreset.LOW }
  },
  [1]: {
    engine: {
      useShadows: false,
      shadowMapResolution: 0,
      usePostProcessing: false,
      forceBasicMaterials: false,
      updateCSMFrustums: true,
      renderScale: 1
    },
    render: { smaaPreset: SMAAPreset.LOW }
  },
  [2]: {
    engine: {
      useShadows: true,
      shadowMapResolution: 256,
      usePostProcessing: false,
      forceBasicMaterials: false,
      updateCSMFrustums: true,
      renderScale: 1
    },
    render: { smaaPreset: SMAAPreset.LOW }
  },
  [3]: {
    engine: {
      useShadows: true,
      shadowMapResolution: 512,
      usePostProcessing: false,
      forceBasicMaterials: false,
      updateCSMFrustums: true,
      renderScale: 1
    },
    render: { smaaPreset: SMAAPreset.MEDIUM }
  },
  [4]: {
    engine: {
      useShadows: true,
      shadowMapResolution: 1024,
      usePostProcessing: true,
      forceBasicMaterials: false,
      updateCSMFrustums: true,
      renderScale: 1
    },
    render: { smaaPreset: SMAAPreset.HIGH }
  },
  [5]: {
    engine: {
      useShadows: true,
      shadowMapResolution: 2048,
      usePostProcessing: true,
      forceBasicMaterials: false,
      updateCSMFrustums: true,
      renderScale: 1
    },
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

const createExponentialMovingAverage = (timePeriods: number, startingMean: number): ExponentialMovingAverage => {
  return {
    mean: startingMean,
    multiplier: 2 / (timePeriods + 1)
  }
}

const updateExponentialMovingAverage = (average: State<ExponentialMovingAverage>, newValue: number) => {
  const multiplier = average.multiplier.value
  const prev = average.mean.value
  const ema = newValue * multiplier + prev * (1 - multiplier)
  average.mean.set(ema)
}

export const PerformanceState = defineState({
  name: 'PerformanceState',

  initial: () => ({
    isMobileGPU: false,
    gpuTier: 3 as PerformanceTier,
    cpuTier: 3 as PerformanceTier,

    supportWebGL2: true,
    targetFPS: 60 as TargetFPS,

    gpu: 'unknown',
    device: 'unknown',

    maxTextureSize: 0,
    max3DTextureSize: 0,
    maxBufferSize: 0,
    maxIndices: 0,
    maxVerticies: 0,

    renderContext: null! as WebGL2RenderingContext,

    // The lower the performance the higher the offset
    gpuPerformanceOffset: 0,
    cpuPerformanceOffset: 0,

    averageFrameTime: createExponentialMovingAverage(180, (1 / 60) * 1000),
    averageRenderTime: createExponentialMovingAverage(180, (1 / 60) * 1000),
    averageSystemTime: createExponentialMovingAverage(180, (1 / 60) * 1000),

    performanceSmoothingTime: 3000 as const,
    isSmoothing: false
  }),

  reactor: () => {
    const performanceState = useMutableState(PerformanceState)
    const renderSettings = useMutableState(RenderSettingsState)
    const engineSettings = useMutableState(RendererState)
    const isEditing = getState(EngineState).isEditing

    const recreateEMA = () => {
      const targetFPS = performanceState.targetFPS.value
      const timePeriods = targetFPS * 3
      const startingMean = (1 / targetFPS) * 1000
      performanceState.merge({
        averageFrameTime: createExponentialMovingAverage(timePeriods, startingMean),
        averageRenderTime: createExponentialMovingAverage(timePeriods, startingMean),
        averageSystemTime: createExponentialMovingAverage(timePeriods, startingMean)
      })
    }

    useEffect(() => {
      recreateEMA()
    }, [performanceState.targetFPS])

    useEffect(() => {
      if (isEditing) return

      const performanceTier = performanceState.gpuTier.value
      const settings = tieredSettings[performanceTier]
      engineSettings.merge(settings.engine)
      renderSettings.merge(settings.render)
    }, [performanceState.gpuTier])

    useEffect(() => {
      performanceState.isSmoothing.set(true)
      recreateEMA()
      setTimeout(() => {
        performanceState.isSmoothing.set(false)
      }, performanceState.performanceSmoothingTime.value)
    }, [performanceState.gpuPerformanceOffset, performanceState.cpuPerformanceOffset])
  }
})

export const PerformanceSystem = defineSystem({
  uuid: 'ee.engine.PerformanceSystem',
  insert: { after: PresentationSystemGroup },

  execute: () => {
    if (getState(EngineState).isEditing || !getState(RendererState).automatic) return

    const performanceState = getMutableState(PerformanceState)
    const ecsState = getState(ECSState)

    updateExponentialMovingAverage(performanceState.averageSystemTime, ecsState.lastSystemExecutionDuration)
    updateExponentialMovingAverage(performanceState.averageFrameTime, ecsState.deltaSeconds * 1000)

    if (performanceState.isSmoothing.value) return

    const { averageFrameTime, averageRenderTime, averageSystemTime, targetFPS } = performanceState.value

    const maxDelta = 1000 / (targetFPS / 2 - 2)
    const minDelta = 1000 / (targetFPS - 5)

    const frameMean = averageFrameTime.mean
    const renderMean = averageRenderTime.mean
    const systemMean = averageSystemTime.mean

    // Frame time is below target
    if (frameMean > maxDelta) {
      const maxRatio = 2.5
      const gpuRatio = frameMean / renderMean
      const systemRatio = frameMean / systemMean

      // Check if we are GPU bound
      if (gpuRatio < maxRatio) {
        decrementGPUPerformance()
        // Check if we are system bound
      } else if (systemRatio < maxRatio) {
        decrementCPUPerformance()
        // We are CPU bound by something other than systems
      } else {
        decrementCPUPerformance()
      }
    } else if (frameMean < minDelta) {
      incrementGPUPerformance()
      incrementCPUPerformance()
    }
  }
})

let checkingRenderTime = false
/**
 * API to get GPU timings, with fallback if WebGL extension is not available (Not available on WebGL1 devices and Safari)
 * Will only run if not already running and the number of elapsed seconds since it last ran is greater than timeBeforeCheck
 *
 * @param renderer EngineRenderer
 * @returns Function to call after you call your render function
 */
const profileGPURender = (): (() => void) => {
  if (checkingRenderTime) return () => {}

  checkingRenderTime = true
  return timeRenderFrameGPU((renderTime) => {
    checkingRenderTime = false
    const performanceState = getMutableState(PerformanceState)
    updateExponentialMovingAverage(performanceState.averageRenderTime, renderTime)
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
    updatePerformanceState(
      tierState,
      MathUtils.clamp(tier, 0, maxPerformanceTier),
      offsetState,
      MathUtils.clamp(offset, 0, maxPerformanceOffset)
    )
  },
  debounceTime,
  { trailing: true, maxWait: debounceTime * 2 }
)

const incrementGPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.gpuTier,
    performanceState.gpuTier.value + 1,
    performanceState.gpuPerformanceOffset,
    performanceState.gpuPerformanceOffset.value - 1
  )
}

const decrementGPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.gpuTier,
    performanceState.gpuTier.value - 1,
    performanceState.gpuPerformanceOffset,
    performanceState.gpuPerformanceOffset.value + 1
  )
}

const incrementCPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.cpuTier,
    performanceState.cpuTier.value + 1,
    performanceState.cpuPerformanceOffset,
    performanceState.cpuPerformanceOffset.value - 1
  )
}

const decrementCPUPerformance = () => {
  const performanceState = getMutableState(PerformanceState)
  updateStateTierAndOffset(
    performanceState.cpuTier,
    performanceState.cpuTier.value - 1,
    performanceState.cpuPerformanceOffset,
    performanceState.cpuPerformanceOffset.value + 1
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
  performanceState.isMobileGPU.set(!!gpuTier.isMobile)
  if (gpuTier.gpu) performanceState.gpu.set(gpuTier.gpu)
  if (gpuTier.device) performanceState.device.set(gpuTier.device)

  const gl = renderer.renderContext as WebGL2RenderingContext
  performanceState.supportWebGL2.set(renderer.supportWebGL2)
  performanceState.renderContext.set(gl)
  const max3DTextureSize = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)
  performanceState.merge({
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

  if (gpuTier.isMobile) {
    performanceState.targetFPS.set(30)
    tier = Math.max(tier - 2, 0)
  }

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
