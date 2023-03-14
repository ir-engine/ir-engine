import { defineState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'

import { isMobile } from '../common/functions/isMobile'
import { RenderModes, RenderModesType } from './constants/RenderModes'

export const RendererState = defineState({
  name: 'RendererState',
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
    syncStateWithLocalStorage(RendererState, [
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
