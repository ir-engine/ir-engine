import { MathUtils } from 'three'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { isMobile } from '../common/functions/isMobile'
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

export const EngineRendererState = defineState({
  name: 'EngineRendererState',
  initial: () => ({
    qualityLevel: isMobile ? 2 : 5, // range from 0 to 5
    automatic: isMobile ? false : true,
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

export function restoreEngineRendererData() {
  const promises = [
    ClientStorage.get(RenderSettingKeys.QUALITY_LEVEL).then((v: number) => {
      if (typeof v !== 'undefined')
        dispatchAction(EngineRendererAction.setQualityLevel({ qualityLevel: MathUtils.clamp(v, 0, 5) }))
    }),
    ClientStorage.get(RenderSettingKeys.AUTOMATIC).then((v: boolean) => {
      if (typeof v !== 'undefined') dispatchAction(EngineRendererAction.setAutomatic({ automatic: Boolean(v) }))
    })
  ]

  if (Engine.instance.isEditor) {
    promises.push(
      ClientStorage.get(RenderSettingKeys.PHYSICS_DEBUG_ENABLE).then((v: boolean) => {
        if (typeof v !== 'undefined')
          dispatchAction(EngineRendererAction.setPhysicsDebug({ physicsDebugEnable: Boolean(v) }))
      }),
      ClientStorage.get(RenderSettingKeys.AVATAR_DEBUG_ENABLE).then((v: boolean) => {
        if (typeof v !== 'undefined')
          dispatchAction(EngineRendererAction.setAvatarDebug({ avatarDebugEnable: Boolean(v) }))
      }),
      ClientStorage.get(RenderSettingKeys.RENDER_MODE).then((v: RenderModesType) => {
        if (typeof v !== 'undefined') dispatchAction(EngineRendererAction.changedRenderMode({ renderMode: v }))
      }),
      ClientStorage.get(RenderSettingKeys.NODE_HELPER_ENABLE).then((v: boolean) => {
        if (typeof v !== 'undefined')
          dispatchAction(EngineRendererAction.changeNodeHelperVisibility({ visibility: Boolean(v) }))
      }),
      ClientStorage.get(RenderSettingKeys.GRID_VISIBLE).then((v: boolean) => {
        if (typeof v !== 'undefined')
          dispatchAction(EngineRendererAction.changeGridToolVisibility({ visibility: Boolean(v) }))
      }),
      ClientStorage.get(RenderSettingKeys.GRID_HEIGHT).then((v: number) => {
        if (typeof v !== 'undefined') dispatchAction(EngineRendererAction.changeGridToolHeight({ gridHeight: v }))
      })
    )
  } else {
    promises.push(
      ClientStorage.get(RenderSettingKeys.POST_PROCESSING).then((v: boolean) => {
        if (typeof v !== 'undefined')
          dispatchAction(EngineRendererAction.setPostProcessing({ usePostProcessing: Boolean(v) }))
      }),
      ClientStorage.get(RenderSettingKeys.USE_SHADOWS).then((v: boolean) => {
        if (typeof v !== 'undefined') dispatchAction(EngineRendererAction.setShadows({ useShadows: Boolean(v) }))
      })
    )
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

export class EngineRendererAction {
  static restoreStorageData = defineAction({
    type: 'xre.renderer.RESTORE_ENGINE_RENDERER_STORAGE_DATA' as const,
    state: matches.object as Validator<unknown, EngineRendererStateType>
  })

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

  static setPhysicsDebug = defineAction({
    type: 'xre.renderer.PHYSICS_DEBUG_CHANGED' as const,
    physicsDebugEnable: matches.boolean
  })

  static setAvatarDebug = defineAction({
    type: 'xre.renderer.AVATAR_DEBUG_CHANGED' as const,
    avatarDebugEnable: matches.boolean
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
