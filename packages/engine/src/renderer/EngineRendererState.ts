import { createState, State, useState } from '@hookstate/core'
import { ClientStorage } from '../common/classes/ClientStorage'
import { Engine } from '../ecs/classes/Engine'
import { databasePrefix, RENDERER_SETTINGS } from './EngineRnedererConstants'
import { EngineRenderer } from './WebGLRendererSystem'

const state = createState({
  qualityLevel: 5,
  automatic: true,
  // usePBR: true,
  usePostProcessing: true,
  useShadows: true
})

type StateType = State<typeof state.value>

export const useEngineRendererState = () => useState(state) as any as typeof state
export const accessEngineRendererState = () => state

function setUseAutomatic(s: StateType, automatic: boolean) {
  ClientStorage.set(databasePrefix + RENDERER_SETTINGS.AUTOMATIC, automatic)
  s.merge({ automatic })
}

function setQualityLevel(s: StateType, qualityLevel) {
  EngineRenderer.instance.scaleFactor = qualityLevel / EngineRenderer.instance.maxQualityLevel
  Engine.renderer.setPixelRatio(window.devicePixelRatio * EngineRenderer.instance.scaleFactor)
  EngineRenderer.instance.needsResize = true
  ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR, EngineRenderer.instance.scaleFactor)
  s.merge({ qualityLevel })
}

function setUseShadows(s: StateType, useShadows) {
  if (state.useShadows.value === useShadows) return
  Engine.renderer.shadowMap.enabled = useShadows
  ClientStorage.set(databasePrefix + RENDERER_SETTINGS.USE_SHADOWS, useShadows)
  s.merge({ useShadows })
}

function setUsePostProcessing(s: StateType, usePostProcessing) {
  if (state.usePostProcessing.value === usePostProcessing) return
  usePostProcessing = EngineRenderer.instance.supportWebGL2 && usePostProcessing
  ClientStorage.set(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING, usePostProcessing)
  s.merge({ usePostProcessing })
}

export function EngineRendererReceptor(action: EngineRendererActionType) {
  state.batch((s) => {
    switch (action.type) {
      case 'WEBGL_RENDERER_QUALITY_LEVEL':
        return setQualityLevel(s, action.qualityLevel)
      case 'WEBGL_RENDERER_AUTO':
        return setUseAutomatic(s, action.automatic)
      // case 'WEBGL_RENDERER_PBR': return s.merge({ usePBR: action.usePBR })
      case 'WEBGL_RENDERER_POSTPROCESSING':
        return setUsePostProcessing(s, action.usePostProcessing)
      case 'WEBGL_RENDERER_SHADOWS':
        return setUseShadows(s, action.useShadows)
    }
  })
}

export const EngineRendererAction = {
  setQualityLevel: (qualityLevel: number) => {
    return {
      type: 'WEBGL_RENDERER_QUALITY_LEVEL' as const,
      qualityLevel
    }
  },
  setAutomatic: (automatic: boolean) => {
    return {
      type: 'WEBGL_RENDERER_AUTO' as const,
      automatic
    }
  },
  setPBR: (usePBR: boolean) => {
    return {
      type: 'WEBGL_RENDERER_PBR' as const,
      usePBR
    }
  },
  setPostProcessing: (usePostProcessing: boolean) => {
    return {
      type: 'WEBGL_RENDERER_POSTPROCESSING' as const,
      usePostProcessing
    }
  },
  setShadows: (useShadows: boolean) => {
    return {
      type: 'WEBGL_RENDERER_SHADOWS' as const,
      useShadows
    }
  }
}
export type EngineRendererActionType = ReturnType<typeof EngineRendererAction[keyof typeof EngineRendererAction]>
