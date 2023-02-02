import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, syncStateWithLocalStorage, useState } from '@xrengine/hyperflux'

import { isMobile } from '../common/functions/isMobile'
import { Engine } from '../ecs/classes/Engine'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { isHeadset } from '../xr/XRState'
import { RenderModes, RenderModesType } from './constants/RenderModes'
import { changeRenderMode } from './functions/changeRenderMode'
import { configureEffectComposer } from './functions/configureEffectComposer'
import { updateShadowMap } from './functions/RenderSettingsFunction'
import { EngineRenderer } from './WebGLRendererSystem'

export const EngineRendererState = defineState({
  name: 'EngineRendererState',
  initial: () => ({
    qualityLevel: isMobile ? 2 : 5, // range from 0 to 5
    automatic: true,
    // usePBR: true,
    usePostProcessing: true,
    useShadows: true,
    debugEnable: false,
    renderMode: RenderModes.SHADOW as RenderModesType,
    nodeHelperVisibility: false,
    gridVisibility: false,
    gridHeight: 0,
    forceBasicMaterials: false
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
    s.qualityLevel.set(action.qualityLevel)
    setQualityLevel(action.qualityLevel)
  }

  static setAutomatic(action: typeof EngineRendererAction.setAutomatic.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.automatic.set(action.automatic)
  }

  static setPostProcessing(action: typeof EngineRendererAction.setPostProcessing.matches._TYPE) {
    if (action.usePostProcessing && isHeadset()) return
    setUsePostProcessing(action.usePostProcessing)
    const s = getState(EngineRendererState)
    s.usePostProcessing.set(action.usePostProcessing)
  }

  static setShadows(action: typeof EngineRendererAction.setShadows.matches._TYPE) {
    if (action.useShadows && isHeadset()) return
    const s = getState(EngineRendererState)
    s.useShadows.set(action.useShadows)
    setUseShadows()
  }

  static setDebug(action: typeof EngineRendererAction.setDebug.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.debugEnable.set(action.debugEnable)
  }

  static changedRenderMode(action: typeof EngineRendererAction.changedRenderMode.matches._TYPE) {
    changeRenderMode(action.renderMode)
    const s = getState(EngineRendererState)
    s.renderMode.set(action.renderMode)
  }

  static changeNodeHelperVisibility(action: typeof EngineRendererAction.changeNodeHelperVisibility.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.nodeHelperVisibility.set(action.visibility)
  }

  static changeGridToolHeight(action: typeof EngineRendererAction.changeGridToolHeight.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.gridHeight.set(action.gridHeight)
  }

  static changeGridToolVisibility(action: typeof EngineRendererAction.changeGridToolVisibility.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.gridVisibility.set(action.visibility)
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
