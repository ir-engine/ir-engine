import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, syncStateWithLocalStorage, useState } from '@xrengine/hyperflux'

import { isMobile } from '../common/functions/isMobile'
import { RenderModes, RenderModesType } from './constants/RenderModes'

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
