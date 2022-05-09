import { createState, useState } from '@speigg/hookstate'

import { isIOS } from '@xrengine/common/src/utils/isIOS'
import { dispatchAction } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { Engine } from '../ecs/classes/Engine'
import InfiniteGridHelper from '../scene/classes/InfiniteGridHelper'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { RenderModes, RenderModesType } from './constants/RenderModes'
import { RenderSettingKeys } from './EngineRnedererConstants'
import { changeRenderMode } from './functions/changeRenderMode'
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

const state = createState<EngineRendererStateType>({
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

export async function restoreEngineRendererData(): Promise<void> {
  if (typeof window !== 'undefined') {
    const s = {} as EngineRendererStateType

    const promises = [
      ClientStorage.get(RenderSettingKeys.QUALITY_LEVEL).then((v) => {
        if (typeof v !== 'undefined') s.qualityLevel = v as number
        ClientStorage.set(RenderSettingKeys.QUALITY_LEVEL, state.qualityLevel.value)
      }),
      ClientStorage.get(RenderSettingKeys.AUTOMATIC).then((v) => {
        if (typeof v !== 'undefined') s.automatic = v as boolean
        ClientStorage.set(RenderSettingKeys.AUTOMATIC, state.automatic.value)
      }),
      ClientStorage.get(RenderSettingKeys.POST_PROCESSING).then((v) => {
        if (typeof v !== 'undefined') s.usePostProcessing = v as boolean
        ClientStorage.set(RenderSettingKeys.POST_PROCESSING, state.usePostProcessing.value)
      }),
      ClientStorage.get(RenderSettingKeys.USE_SHADOWS).then((v) => {
        if (typeof v !== 'undefined') s.useShadows = v as boolean
        ClientStorage.set(RenderSettingKeys.USE_SHADOWS, state.useShadows.value)
      })
    ]

    if (Engine.instance.isEditor) {
      promises.push(
        ClientStorage.get(RenderSettingKeys.PHYSICS_DEBUG_ENABLE).then((v) => {
          if (typeof v !== 'undefined') s.physicsDebugEnable = v as boolean
          ClientStorage.set(RenderSettingKeys.PHYSICS_DEBUG_ENABLE, state.physicsDebugEnable.value)
        }),
        ClientStorage.get(RenderSettingKeys.AVATAR_DEBUG_ENABLE).then((v) => {
          if (typeof v !== 'undefined') s.avatarDebugEnable = v as boolean
          ClientStorage.set(RenderSettingKeys.AVATAR_DEBUG_ENABLE, state.avatarDebugEnable.value)
        }),
        ClientStorage.get(RenderSettingKeys.RENDER_MODE).then((v) => {
          if (typeof v !== 'undefined') s.renderMode = v as RenderModesType
          ClientStorage.set(RenderSettingKeys.RENDER_MODE, state.renderMode.value)
        }),
        ClientStorage.get(RenderSettingKeys.NODE_HELPER_ENABLE).then((v) => {
          if (typeof v !== 'undefined') s.nodeHelperVisibility = v as boolean
          else ClientStorage.set(RenderSettingKeys.NODE_HELPER_ENABLE, state.nodeHelperVisibility.value)
        }),
        ClientStorage.get(RenderSettingKeys.GRID_VISIBLE).then((v) => {
          if (typeof v !== 'undefined') s.gridVisibility = v as boolean
          else ClientStorage.set(RenderSettingKeys.GRID_VISIBLE, state.gridVisibility.value)
        }),
        ClientStorage.get(RenderSettingKeys.GRID_HEIGHT).then((v) => {
          if (typeof v !== 'undefined') s.gridHeight = v as number
          else ClientStorage.set(RenderSettingKeys.GRID_HEIGHT, state.gridHeight.value)
        })
      )
    }

    await Promise.all(promises)

    dispatchAction(Engine.instance.store, EngineRendererAction.restoreStorageData(s))
  }
}

function updateState(): void {
  setQualityLevel(state.qualityLevel.value)
  setUsePostProcessing(state.usePostProcessing.value)
  setUseShadows(state.useShadows.value)

  dispatchAction(Engine.instance.store, EngineRendererAction.setPhysicsDebug(state.physicsDebugEnable.value))
  dispatchAction(Engine.instance.store, EngineRendererAction.setAvatarDebug(state.avatarDebugEnable.value))

  changeRenderMode(state.renderMode.value)

  if (Engine.instance.isEditor && state.nodeHelperVisibility.value)
    Engine.instance.camera.layers.enable(ObjectLayers.NodeHelper)
  else Engine.instance.camera.layers.disable(ObjectLayers.NodeHelper)

  if (Engine.instance.isEditor) {
    InfiniteGridHelper.instance.setGridHeight(state.gridHeight.value)
    InfiniteGridHelper.instance.visible = state.gridVisibility.value
  }
}

export const useEngineRendererState = () => useState(state) as any as typeof state
export const accessEngineRendererState = () => state

function setQualityLevel(qualityLevel) {
  EngineRenderer.instance.scaleFactor = qualityLevel / EngineRenderer.instance.maxQualityLevel
  EngineRenderer.instance.renderer.setPixelRatio(window.devicePixelRatio * EngineRenderer.instance.scaleFactor)
  EngineRenderer.instance.needsResize = true
}

function setUseShadows(useShadows) {
  if (state.useShadows.value === useShadows) return
  EngineRenderer.instance.renderer.shadowMap.enabled = useShadows
}

function setUsePostProcessing(usePostProcessing) {
  if (state.usePostProcessing.value === usePostProcessing) return
  usePostProcessing = EngineRenderer.instance.supportWebGL2 && usePostProcessing
}

export function EngineRendererReceptor(action: EngineRendererActionType) {
  state.batch((s) => {
    switch (action.type) {
      case 'WEBGL_RENDERER_QUALITY_LEVEL':
        s.merge({ qualityLevel: action.qualityLevel })
        setQualityLevel(action.qualityLevel)
        ClientStorage.set(RenderSettingKeys.QUALITY_LEVEL, action.qualityLevel)
        break
      case 'WEBGL_RENDERER_AUTO':
        s.merge({ automatic: action.automatic })
        ClientStorage.set(RenderSettingKeys.AUTOMATIC, action.automatic)
        break
      // case 'WEBGL_RENDERER_PBR': return s.merge({ usePBR: action.usePBR })
      case 'WEBGL_RENDERER_POSTPROCESSING':
        s.merge({ usePostProcessing: action.usePostProcessing })
        setUsePostProcessing(action.usePostProcessing)
        ClientStorage.set(RenderSettingKeys.POST_PROCESSING, action.usePostProcessing)
        break
      case 'WEBGL_RENDERER_SHADOWS':
        s.merge({ useShadows: action.useShadows })
        setUseShadows(action.useShadows)
        ClientStorage.set(RenderSettingKeys.USE_SHADOWS, action.useShadows)
        break
      case 'PHYSICS_DEBUG_CHANGED':
        s.merge({ physicsDebugEnable: action.physicsDebugEnable })
        ClientStorage.set(RenderSettingKeys.PHYSICS_DEBUG_ENABLE, action.physicsDebugEnable)
        break
      case 'AVATAR_DEBUG_CHANGED':
        s.merge({ avatarDebugEnable: action.avatarDebugEnable })
        ClientStorage.set(RenderSettingKeys.AVATAR_DEBUG_ENABLE, action.avatarDebugEnable)
        break
      case 'RENDER_MODE_CHANGED':
        s.merge({ renderMode: action.renderMode })
        changeRenderMode(action.renderMode)
        ClientStorage.set(RenderSettingKeys.RENDER_MODE, action.renderMode)
        break
      case 'NODE_HELPER_VISIBILITY_CHANGED':
        s.merge({ nodeHelperVisibility: action.visibility })
        ClientStorage.set(RenderSettingKeys.NODE_HELPER_ENABLE, action.visibility)
        break
      case 'GRID_TOOL_HEIGHT_CHANGED':
        s.merge({ gridHeight: action.gridHeight })
        ClientStorage.set(RenderSettingKeys.GRID_HEIGHT, action.gridHeight)
        break
      case 'GRID_TOOL_VISIBILITY_CHANGED':
        s.merge({ gridVisibility: action.visibility })
        ClientStorage.set(RenderSettingKeys.GRID_VISIBLE, action.visibility)
        break
      case 'RESTORE_ENGINE_RENDERER_STORAGE_DATA':
        s.merge(action.state)
        updateState()
    }

    return s
  })
}

export const EngineRendererAction = {
  restoreStorageData: (state: EngineRendererStateType) => {
    return {
      store: 'ENGINE' as const,
      type: 'RESTORE_ENGINE_RENDERER_STORAGE_DATA' as const,
      state
    }
  },
  setQualityLevel: (qualityLevel: number) => {
    return {
      store: 'ENGINE' as const,
      type: 'WEBGL_RENDERER_QUALITY_LEVEL' as const,
      qualityLevel
    }
  },
  setAutomatic: (automatic: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'WEBGL_RENDERER_AUTO' as const,
      automatic
    }
  },
  setPBR: (usePBR: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'WEBGL_RENDERER_PBR' as const,
      usePBR
    }
  },
  setPostProcessing: (usePostProcessing: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'WEBGL_RENDERER_POSTPROCESSING' as const,
      usePostProcessing
    }
  },
  setShadows: (useShadows: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'WEBGL_RENDERER_SHADOWS' as const,
      useShadows
    }
  },
  setPhysicsDebug: (physicsDebugEnable: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'PHYSICS_DEBUG_CHANGED' as const,
      physicsDebugEnable
    }
  },
  setAvatarDebug: (avatarDebugEnable: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'AVATAR_DEBUG_CHANGED' as const,
      avatarDebugEnable
    }
  },
  changedRenderMode: (renderMode: RenderModesType) => {
    return {
      store: 'ENGINE' as const,
      type: 'RENDER_MODE_CHANGED' as const,
      renderMode
    }
  },
  changeNodeHelperVisibility: (visibility: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'NODE_HELPER_VISIBILITY_CHANGED' as const,
      visibility
    }
  },
  changeGridToolHeight: (gridHeight: number) => {
    return {
      store: 'ENGINE' as const,
      type: 'GRID_TOOL_HEIGHT_CHANGED' as const,
      gridHeight
    }
  },
  changeGridToolVisibility: (visibility: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'GRID_TOOL_VISIBILITY_CHANGED' as const,
      visibility
    }
  }
}

export type EngineRendererActionType = ReturnType<typeof EngineRendererAction[keyof typeof EngineRendererAction]>
