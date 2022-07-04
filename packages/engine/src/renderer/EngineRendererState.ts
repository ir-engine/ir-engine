import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { Engine } from '../ecs/classes/Engine'
import InfiniteGridHelper from '../scene/classes/InfiniteGridHelper'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { updateShadowMapOnSceneLoad } from '../scene/functions/loaders/RenderSettingsFunction'
import { RenderModes, RenderModesType } from './constants/RenderModes'
import { RenderSettingKeys } from './EngineRendererConstants'
import { changeRenderMode } from './functions/changeRenderMode'
import { configureEffectComposer } from './functions/configureEffectComposer'
import { EngineRenderer } from './WebGLRendererSystem'

type EngineRendererStateType = {
  qualityLevel: number
  automatic: boolean
  // usePBR: boolean,
  usePostProcessing: boolean
  useShadows: boolean
  physicsDebugEnable: boolean
  avatarDebugEnable: boolean
  renderMode: RenderModesType
  nodeHelperVisibility: boolean
  gridVisibility: boolean
  gridHeight: number
}

const EngineRendererState = defineState({
  name: 'EngineRendererState',
  initial: () => ({
    qualityLevel: 5,
    automatic: true,
    // usePBR: true,
    usePostProcessing: false,
    useShadows: false,
    physicsDebugEnable: false,
    avatarDebugEnable: false,
    renderMode: RenderModes.SHADOW as RenderModesType,
    nodeHelperVisibility: false,
    gridVisibility: false,
    gridHeight: 0
  })
})

export async function restoreEngineRendererData(): Promise<void> {
  if (typeof window !== 'undefined') {
    const s = {} as EngineRendererStateType

    const promises = [
      ClientStorage.get(RenderSettingKeys.QUALITY_LEVEL).then((v) => {
        if (typeof v !== 'undefined') s.qualityLevel = v as number
      }),
      ClientStorage.get(RenderSettingKeys.AUTOMATIC).then((v) => {
        if (typeof v !== 'undefined') s.automatic = v as boolean
      })
    ]

    if (Engine.instance.isEditor) {
      promises.push(
        ClientStorage.get(RenderSettingKeys.PHYSICS_DEBUG_ENABLE).then((v) => {
          if (typeof v !== 'undefined') s.physicsDebugEnable = v as boolean
        }),
        ClientStorage.get(RenderSettingKeys.AVATAR_DEBUG_ENABLE).then((v) => {
          if (typeof v !== 'undefined') s.avatarDebugEnable = v as boolean
        }),
        ClientStorage.get(RenderSettingKeys.RENDER_MODE).then((v) => {
          if (typeof v !== 'undefined') s.renderMode = v as RenderModesType
        }),
        ClientStorage.get(RenderSettingKeys.NODE_HELPER_ENABLE).then((v) => {
          if (typeof v !== 'undefined') s.nodeHelperVisibility = v as boolean
        }),
        ClientStorage.get(RenderSettingKeys.GRID_VISIBLE).then((v) => {
          if (typeof v !== 'undefined') s.gridVisibility = v as boolean
        }),
        ClientStorage.get(RenderSettingKeys.GRID_HEIGHT).then((v) => {
          if (typeof v !== 'undefined') s.gridHeight = v as number
        })
      )
    } else {
      promises.push(
        ClientStorage.get(RenderSettingKeys.POST_PROCESSING).then((v) => {
          if (typeof v !== 'undefined') s.usePostProcessing = v as boolean
        }),
        ClientStorage.get(RenderSettingKeys.USE_SHADOWS).then((v) => {
          if (typeof v !== 'undefined') s.useShadows = v as boolean
        })
      )
    }

    await Promise.all(promises)

    dispatchAction(EngineRendererAction.restoreStorageData({ state: s }))
  }
}

function updateState(): void {
  const state = getState(EngineRendererState)
  setQualityLevel(state.qualityLevel.value)
  setUsePostProcessing(state.usePostProcessing.value)
  setUseShadows(state.useShadows.value)

  dispatchAction(EngineRendererAction.setPhysicsDebug({ physicsDebugEnable: state.physicsDebugEnable.value }))
  dispatchAction(EngineRendererAction.setAvatarDebug({ avatarDebugEnable: state.avatarDebugEnable.value }))

  if (Engine.instance.isEditor) {
    changeRenderMode(state.renderMode.value)

    if (state.nodeHelperVisibility.value) Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.NodeHelper)
    else Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.NodeHelper)

    InfiniteGridHelper.instance.setGridHeight(state.gridHeight.value)
    InfiniteGridHelper.instance.visible = state.gridVisibility.value
  } else {
    Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.NodeHelper)
  }
}

export const accessEngineRendererState = () => getState(EngineRendererState)
export const useEngineRendererState = () => useState(accessEngineRendererState())

function setQualityLevel(qualityLevel) {
  EngineRenderer.instance.scaleFactor = qualityLevel / EngineRenderer.instance.maxQualityLevel
  EngineRenderer.instance.renderer.setPixelRatio(window.devicePixelRatio * EngineRenderer.instance.scaleFactor)
  EngineRenderer.instance.needsResize = true
}

function setUseShadows(useShadows) {
  if (!Engine.instance.isEditor) updateShadowMapOnSceneLoad(useShadows)
}

function setUsePostProcessing(usePostProcessing) {
  if (getState(EngineRendererState).usePostProcessing.value === usePostProcessing || Engine.instance.isEditor) return
  usePostProcessing = EngineRenderer.instance.supportWebGL2 && usePostProcessing

  configureEffectComposer(!usePostProcessing)
}

export class EngineRendererReceptor {
  static setQualityLevel(action: typeof EngineRendererAction.setQualityLevel.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ qualityLevel: action.qualityLevel })
    setQualityLevel(action.qualityLevel)
    ClientStorage.set(RenderSettingKeys.QUALITY_LEVEL, action.qualityLevel)
  }

  static setAutomatic(action: typeof EngineRendererAction.setAutomatic.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ automatic: action.automatic })
    ClientStorage.set(RenderSettingKeys.AUTOMATIC, action.automatic)
  }

  static setPostProcessing(action: typeof EngineRendererAction.setPostProcessing.matches._TYPE) {
    setUsePostProcessing(action.usePostProcessing)
    const s = getState(EngineRendererState)
    s.merge({ usePostProcessing: action.usePostProcessing })
    ClientStorage.set(RenderSettingKeys.POST_PROCESSING, action.usePostProcessing)
  }

  static setShadows(action: typeof EngineRendererAction.setShadows.matches._TYPE) {
    setUseShadows(action.useShadows)
    const s = getState(EngineRendererState)
    s.merge({ useShadows: action.useShadows })
    ClientStorage.set(RenderSettingKeys.USE_SHADOWS, action.useShadows)
  }

  static setPhysicsDebug(action: typeof EngineRendererAction.setPhysicsDebug.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ physicsDebugEnable: action.physicsDebugEnable })
    ClientStorage.set(RenderSettingKeys.PHYSICS_DEBUG_ENABLE, action.physicsDebugEnable)
  }

  static setAvatarDebug(action: typeof EngineRendererAction.setAvatarDebug.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ avatarDebugEnable: action.avatarDebugEnable })
    ClientStorage.set(RenderSettingKeys.AVATAR_DEBUG_ENABLE, action.avatarDebugEnable)
  }

  static changedRenderMode(action: typeof EngineRendererAction.changedRenderMode.matches._TYPE) {
    changeRenderMode(action.renderMode)
    const s = getState(EngineRendererState)
    s.merge({ renderMode: action.renderMode })
    ClientStorage.set(RenderSettingKeys.RENDER_MODE, action.renderMode)
  }

  static changeNodeHelperVisibility(action: typeof EngineRendererAction.changeNodeHelperVisibility.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ nodeHelperVisibility: action.visibility })
    ClientStorage.set(RenderSettingKeys.NODE_HELPER_ENABLE, action.visibility)
  }

  static changeGridToolHeight(action: typeof EngineRendererAction.changeGridToolHeight.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ gridHeight: action.gridHeight })
    ClientStorage.set(RenderSettingKeys.GRID_HEIGHT, action.gridHeight)
  }

  static changeGridToolVisibility(action: typeof EngineRendererAction.changeGridToolVisibility.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge({ gridVisibility: action.visibility })
    ClientStorage.set(RenderSettingKeys.GRID_VISIBLE, action.visibility)
  }

  static restoreStorageData(action: typeof EngineRendererAction.restoreStorageData.matches._TYPE) {
    const s = getState(EngineRendererState)
    s.merge(action.state)
    updateState()
  }
}

export const EngineRendererAction = {
  restoreStorageData: defineAction({
    type: 'xre.renderer.RESTORE_ENGINE_RENDERER_STORAGE_DATA' as const,
    state: matches.object as Validator<unknown, EngineRendererStateType>
  }),

  setQualityLevel: defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_QUALITY_LEVEL' as const,
    qualityLevel: matches.number
  }),

  setAudio: defineAction({
    type: 'xre.renderer.AUDIO_VOLUME' as const,
    audio: matches.number
  }),

  setMicrophone: defineAction({
    type: 'xre.renderer.MICROPHONE_VOLUME' as const,
    microphone: matches.number
  }),

  setAutomatic: defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_AUTO' as const,
    automatic: matches.boolean
  }),

  setPBR: defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_PBR' as const,
    usePBR: matches.boolean
  }),

  setPostProcessing: defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_POSTPROCESSING' as const,
    usePostProcessing: matches.boolean
  }),

  setShadows: defineAction({
    type: 'xre.renderer.WEBGL_RENDERER_SHADOWS' as const,
    useShadows: matches.boolean
  }),

  setPhysicsDebug: defineAction({
    type: 'xre.renderer.PHYSICS_DEBUG_CHANGED' as const,
    physicsDebugEnable: matches.boolean
  }),

  setAvatarDebug: defineAction({
    type: 'xre.renderer.AVATAR_DEBUG_CHANGED' as const,
    avatarDebugEnable: matches.boolean
  }),

  changedRenderMode: defineAction({
    type: 'xre.renderer.RENDER_MODE_CHANGED' as const,
    renderMode: matches.string as Validator<unknown, RenderModesType>
  }),

  changeNodeHelperVisibility: defineAction({
    type: 'xre.renderer.NODE_HELPER_VISIBILITY_CHANGED' as const,
    visibility: matches.boolean
  }),

  changeGridToolHeight: defineAction({
    type: 'xre.renderer.GRID_TOOL_HEIGHT_CHANGED' as const,
    gridHeight: matches.number
  }),

  changeGridToolVisibility: defineAction({
    type: 'xre.renderer.GRID_TOOL_VISIBILITY_CHANGED' as const,
    visibility: matches.boolean
  })
}
