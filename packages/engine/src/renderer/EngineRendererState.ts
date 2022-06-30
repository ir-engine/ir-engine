import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { Engine } from '../ecs/classes/Engine'
import InfiniteGridHelper from '../scene/classes/InfiniteGridHelper'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { updateShadowMapOnSceneLoad } from '../scene/functions/loaders/RenderSettingsFunction'
import { RenderModes, RenderModesType } from './constants/RenderModes'
import { RenderSettingKeys } from './EngineRnedererConstants'
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

export function EngineRendererReceptor(action) {
  getState(EngineRendererState).batch((s) => {
    matches(action)
      .when(EngineRendererAction.setQualityLevel.matches, (action) => {
        s.merge({ qualityLevel: action.qualityLevel })
        setQualityLevel(action.qualityLevel)
        ClientStorage.set(RenderSettingKeys.QUALITY_LEVEL, action.qualityLevel)
      })
      .when(EngineRendererAction.setAutomatic.matches, (action) => {
        s.merge({ automatic: action.automatic })
        ClientStorage.set(RenderSettingKeys.AUTOMATIC, action.automatic)
      })
      .when(EngineRendererAction.setPostProcessing.matches, (action) => {
        setUsePostProcessing(action.usePostProcessing)
        s.merge({ usePostProcessing: action.usePostProcessing })
        ClientStorage.set(RenderSettingKeys.POST_PROCESSING, action.usePostProcessing)
      })
      .when(EngineRendererAction.setShadows.matches, (action) => {
        setUseShadows(action.useShadows)
        s.merge({ useShadows: action.useShadows })
        ClientStorage.set(RenderSettingKeys.USE_SHADOWS, action.useShadows)
      })
      .when(EngineRendererAction.setPhysicsDebug.matches, (action) => {
        s.merge({ physicsDebugEnable: action.physicsDebugEnable })
        ClientStorage.set(RenderSettingKeys.PHYSICS_DEBUG_ENABLE, action.physicsDebugEnable)
      })
      .when(EngineRendererAction.setAvatarDebug.matches, (action) => {
        s.merge({ avatarDebugEnable: action.avatarDebugEnable })
        ClientStorage.set(RenderSettingKeys.AVATAR_DEBUG_ENABLE, action.avatarDebugEnable)
      })
      .when(EngineRendererAction.changedRenderMode.matches, (action) => {
        changeRenderMode(action.renderMode)
        s.merge({ renderMode: action.renderMode })
        ClientStorage.set(RenderSettingKeys.RENDER_MODE, action.renderMode)
      })
      .when(EngineRendererAction.changeNodeHelperVisibility.matches, (action) => {
        s.merge({ nodeHelperVisibility: action.visibility })
        ClientStorage.set(RenderSettingKeys.NODE_HELPER_ENABLE, action.visibility)
      })
      .when(EngineRendererAction.changeGridToolHeight.matches, (action) => {
        s.merge({ gridHeight: action.gridHeight })
        ClientStorage.set(RenderSettingKeys.GRID_HEIGHT, action.gridHeight)
      })
      .when(EngineRendererAction.changeGridToolVisibility.matches, (action) => {
        s.merge({ gridVisibility: action.visibility })
        ClientStorage.set(RenderSettingKeys.GRID_VISIBLE, action.visibility)
      })
      .when(EngineRendererAction.restoreStorageData.matches, (action) => {
        s.merge(action.state)
        updateState()
      })
    // .when(EngineRendererAction.setPBR.matches, (action) => {
    //   return s.merge({ usePBR: action.usePBR })
    // })
  })
}

export class EngineRendererAction {
  static restoreStorageData = defineAction({
    type: 'RESTORE_ENGINE_RENDERER_STORAGE_DATA' as const,
    state: matches.object as Validator<unknown, EngineRendererStateType>
  })

  static setQualityLevel = defineAction({
    type: 'WEBGL_RENDERER_QUALITY_LEVEL' as const,
    qualityLevel: matches.number
  })

  static setAudio = defineAction({
    type: 'AUDIO_VOLUME' as const,
    audio: matches.number
  })

  static setMicrophone = defineAction({
    type: 'MICROPHONE_VOLUME' as const,
    microphone: matches.number
  })

  static setAutomatic = defineAction({
    type: 'WEBGL_RENDERER_AUTO' as const,
    automatic: matches.boolean
  })

  static setPBR = defineAction({
    type: 'WEBGL_RENDERER_PBR' as const,
    usePBR: matches.boolean
  })

  static setPostProcessing = defineAction({
    type: 'WEBGL_RENDERER_POSTPROCESSING' as const,
    usePostProcessing: matches.boolean
  })

  static setShadows = defineAction({
    type: 'WEBGL_RENDERER_SHADOWS' as const,
    useShadows: matches.boolean
  })

  static setPhysicsDebug = defineAction({
    type: 'PHYSICS_DEBUG_CHANGED' as const,
    physicsDebugEnable: matches.boolean
  })

  static setAvatarDebug = defineAction({
    type: 'AVATAR_DEBUG_CHANGED' as const,
    avatarDebugEnable: matches.boolean
  })

  static changedRenderMode = defineAction({
    type: 'RENDER_MODE_CHANGED' as const,
    renderMode: matches.string as Validator<unknown, RenderModesType>
  })

  static changeNodeHelperVisibility = defineAction({
    type: 'NODE_HELPER_VISIBILITY_CHANGED' as const,
    visibility: matches.boolean
  })

  static changeGridToolHeight = defineAction({
    type: 'GRID_TOOL_HEIGHT_CHANGED' as const,
    gridHeight: matches.number
  })

  static changeGridToolVisibility = defineAction({
    type: 'GRID_TOOL_VISIBILITY_CHANGED' as const,
    visibility: matches.boolean
  })
}
