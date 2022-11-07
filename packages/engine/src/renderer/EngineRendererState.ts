import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, syncStateWithLocalStorage, useState } from '@xrengine/hyperflux'

import { isHMD, isMobile, isMobileOrHMD } from '../common/functions/isMobile'
import { Engine } from '../ecs/classes/Engine'
import { RenderModes, RenderModesType } from './constants/RenderModes'
import { changeRenderMode } from './functions/changeRenderMode'
import { configureEffectComposer } from './functions/configureEffectComposer'
import { updateShadowMap } from './functions/RenderSettingsFunction'
import { EngineRenderer } from './WebGLRendererSystem'

export const EngineRendererState = defineState({
  name: 'EngineRendererState',
  initial: () => ({
    qualityLevel: isMobile ? 2 : 5, // range from 0 to 5
    automatic: isMobileOrHMD ? false : true,
    // usePBR: true,
    usePostProcessing: isMobileOrHMD ? false : true,
    useShadows: isMobileOrHMD ? false : true,
    debugEnable: false,
    renderMode: RenderModes.SHADOW as RenderModesType,
    nodeHelperVisibility: false,
    gridVisibility: false,
    gridHeight: 0
  }),
  onCreate: (store, state) => {
    syncStateWithLocalStorage(EngineRendererState, [
      'qualityLevel',
      'automatic',
      // 'usePBR',
      'usePostProcessing',
      'useShadows',
      'debugEnable',
      'renderMode',
      'nodeHelperVisibility',
      'gridVisibility',
      'gridHeight'
    ])
  }
})

export const accessEngineRendererState = () => getState(EngineRendererState)
export const useEngineRendererState = () => useState(accessEngineRendererState())

function setQualityLevel(qualityLevel) {
  EngineRenderer.instance.scaleFactor = qualityLevel / EngineRenderer.instance.maxQualityLevel
  EngineRenderer.instance.renderer.setPixelRatio(window.devicePixelRatio * EngineRenderer.instance.scaleFactor)
  EngineRenderer.instance.needsResize = true
}

function setUseShadows() {
  if (!Engine.instance.isEditor) updateShadowMap()
}

function setUsePostProcessing(usePostProcessing) {
  if (getState(EngineRendererState).usePostProcessing.value === usePostProcessing) return
  usePostProcessing = EngineRenderer.instance.supportWebGL2 && usePostProcessing

  configureEffectComposer(!usePostProcessing)
}

export class EngineRendererReceptor {
  static setQualityLevel(action: typeof EngineRendererAction.setQualityLevel.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ qualityLevel: action.qualityLevel })
    setQualityLevel(action.qualityLevel)
  }

  static setAutomatic(action: typeof EngineRendererAction.setAutomatic.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ automatic: action.automatic })
  }

  static setPostProcessing(action: typeof EngineRendererAction.setPostProcessing.matches._TYPE) {
    if (action.usePostProcessing && isHMD) return
    setUsePostProcessing(action.usePostProcessing)
    const s = getState(EngineRendererState)
    s.merge({ usePostProcessing: action.usePostProcessing })
  }

  static setShadows(action: typeof EngineRendererAction.setShadows.matches._TYPE) {
    if (action.useShadows && isHMD) return
    const s = getState(EngineRendererState)
    s.merge({ useShadows: action.useShadows })
    setUseShadows()
  }

  static setDebug(action: typeof EngineRendererAction.setDebug.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ debugEnable: action.debugEnable })
  }

  static changedRenderMode(action: typeof EngineRendererAction.changedRenderMode.matches._TYPE) {
    changeRenderMode(action.renderMode)
    const s = getState(EngineRendererState)
    s.merge({ renderMode: action.renderMode })
  }

  static changeNodeHelperVisibility(action: typeof EngineRendererAction.changeNodeHelperVisibility.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ nodeHelperVisibility: action.visibility })
  }

  static changeGridToolHeight(action: typeof EngineRendererAction.changeGridToolHeight.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ gridHeight: action.gridHeight })
  }

  static changeGridToolVisibility(action: typeof EngineRendererAction.changeGridToolVisibility.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ gridVisibility: action.visibility })
  }
}

export class EngineRendererAction {
  static setQualityLevel = defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_QUALITY_LEVEL' as const,
    qualityLevel: matches.number
  })

  static setAutomatic = defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_AUTO' as const,
    automatic: matches.boolean
  })

  static setPBR = defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_PBR' as const,
    usePBR: matches.boolean
  })

  static setPostProcessing = defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_POSTPROCESSING' as const,
    usePostProcessing: matches.boolean
  })

  static setShadows = defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_SHADOWS' as const,
    useShadows: matches.boolean
  })

  static setDebug = defineAction({
    type: 'xre.renderer.DEBUG_CHANGED' as const,
    debugEnable: matches.boolean
  })

  static changedRenderMode = defineAction({
    type: 'xre.renderer.RENDER_MODE_CHANGED' as const,
    renderMode: matches.string as Validator<unknown, RenderModesType>
  })

  static changeNodeHelperVisibility = defineAction({
    type: 'xre.renderer.NODE_HELPER_VISIBILITY_CHANGED' as const,
    visibility: matches.boolean
  })

  static changeGridToolHeight = defineAction({
    type: 'xre.renderer.GRID_TOOL_HEIGHT_CHANGED' as const,
    gridHeight: matches.number
  })

  static changeGridToolVisibility = defineAction({
    type: 'xre.renderer.GRID_TOOL_VISIBILITY_CHANGED' as const,
    visibility: matches.boolean
  })
}
