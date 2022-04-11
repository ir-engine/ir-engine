import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@xrengine/engine/src/scene/constants/transformConstants'

import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { changeRenderMode } from '../functions/changeRenderMode'
import { SceneState } from '../functions/sceneRenderFunctions'

type ModeServiceStateType = {
  renderMode: RenderModesType
  isPlayModeEnabled: boolean
  isFlyModeEnabled: boolean
  transformMode: TransformModeType
  transformModeOnCancel: TransformModeType
  transformPivot: TransformPivotType
  transformSpace: TransformSpace
  snapMode: SnapModeType
  translationSnap: number
  rotationSnap: number
  scaleSnap: number
  gridVisibility: boolean
  gridHeight: number
  nodeHelperVisibility: boolean
  physicsHelperVisibility: boolean
}

const state = createState<ModeServiceStateType>({
  renderMode: RenderModes.SHADOW,
  isPlayModeEnabled: false,
  isFlyModeEnabled: false,
  transformMode: TransformMode.Translate,
  transformModeOnCancel: TransformMode.Translate,
  transformSpace: TransformSpace.World,
  transformPivot: TransformPivot.Selection,
  snapMode: SnapMode.Grid,
  translationSnap: 0.5,
  rotationSnap: 10,
  scaleSnap: 0.1,
  gridVisibility: true,
  gridHeight: 0,
  nodeHelperVisibility: true,
  physicsHelperVisibility: true
})

function storeEditorHelperData(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      globalThis.process.env['VITE_EDITOR_LOCAL_STORAGE_KEY'] || 'theoverlay-editor-store-key-v1',
      JSON.stringify(state.value)
    )
  }
}

function restoreEditorHelperData(): ModeServiceStateType | undefined {
  if (typeof window !== 'undefined') {
    const rawState = localStorage.getItem(
      globalThis.process.env['VITE_EDITOR_LOCAL_STORAGE_KEY'] || 'theoverlay-editor-store-key-v1'
    )

    return JSON.parse(rawState ?? '{}') as ModeServiceStateType
  }
}

function updateHelpers(): void {
  SceneState.transformGizmo.setTransformMode(state.transformMode.value)

  SceneState.grid.setSize(state.translationSnap.value)
  SceneState.grid.setGridHeight(state.gridHeight.value)
  SceneState.grid.visible = state.gridVisibility.value

  if (state.nodeHelperVisibility.value) Engine.camera.layers.enable(ObjectLayers.NodeHelper)
  else Engine.camera.layers.disable(ObjectLayers.NodeHelper)

  dispatchLocal(EngineActions.setPhysicsDebug(state.physicsHelperVisibility.value) as any)

  // TODO: Have to wait because postprocessing enter query reconfigures effect composer
  setTimeout(() => {
    changeRenderMode(state.renderMode.value)
  }, 1000)
}

store.receptors.push((action: ModeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'RENDER_MODE_CHANGED':
        s.merge({ renderMode: action.renderMode })
        storeEditorHelperData()
        break
      case 'PLAY_MODE_CHANGED':
        s.merge({ isPlayModeEnabled: action.isPlayModeEnabled })
        break
      case 'FLY_MODE_CHANGED':
        s.merge({ isFlyModeEnabled: action.isFlyModeEnabled })
        break
      case 'TRANSFORM_MODE_CHANGED':
        s.merge({ transformMode: action.mode })
        storeEditorHelperData()
        break
      case 'TRANSFORM_MODE_ON_CANCEL_CHANGED':
        s.merge({ transformModeOnCancel: action.mode })
        storeEditorHelperData()
        break
      case 'TRANSFORM_SPACE_CHANGED':
        s.merge({ transformSpace: action.transformSpace })
        storeEditorHelperData()
        break
      case 'TRANSFORM_PIVOT_CHANGED':
        s.merge({ transformPivot: action.transformPivot })
        storeEditorHelperData()
        break
      case 'SNAP_MODE_CHANGED':
        s.merge({ snapMode: action.snapMode })
        storeEditorHelperData()
        break
      case 'TRANSLATION_SNAP_CHANGED':
        s.merge({ translationSnap: action.translationSnap })
        storeEditorHelperData()
        break
      case 'ROTATION_SNAP_CHANGED':
        s.merge({ rotationSnap: action.rotationSnap })
        storeEditorHelperData()
        break
      case 'SCALE_SNAP_CHANGED':
        s.merge({ scaleSnap: action.scaleSnap })
        storeEditorHelperData()
        break
      case 'GRID_TOOL_HEIGHT_CHANGED':
        s.merge({ gridHeight: action.gridHeight })
        storeEditorHelperData()
        break
      case 'GRID_TOOL_VISIBILITY_CHANGED':
        s.merge({ gridVisibility: action.visibility })
        storeEditorHelperData()
        break
      case 'NODE_HELPER_VISIBILITY_CHANGED':
        s.merge({ nodeHelperVisibility: action.visibility })
        storeEditorHelperData()
        break
      case 'PHYSICS_HELPER_VISIBILITY_CHANGED':
        s.merge({ physicsHelperVisibility: action.visibility })
        storeEditorHelperData()
        break
      case 'RESTORE_STORAGE_DATA':
        s.merge(restoreEditorHelperData() ?? {})
        updateHelpers()
    }

    return s
  }, action.type)
})

export const accessModeState = () => state

export const useModeState = () => useState(state) as any as typeof state

//Service
export const ModeService = {}

//Action
export const ModeAction = {
  restoreStorageData: () => {
    return {
      type: 'RESTORE_STORAGE_DATA' as const
    }
  },
  changedRenderMode: (renderMode: RenderModesType) => {
    return {
      type: 'RENDER_MODE_CHANGED' as const,
      renderMode
    }
  },
  changedPlayMode: (isEnabled: boolean) => {
    return {
      type: 'PLAY_MODE_CHANGED' as const,
      isPlayModeEnabled: isEnabled
    }
  },
  changedFlyMode: (isEnabled: boolean) => {
    return {
      type: 'FLY_MODE_CHANGED' as const,
      isFlyModeEnabled: isEnabled
    }
  },
  changedTransformMode: (mode: TransformModeType) => {
    return {
      type: 'TRANSFORM_MODE_CHANGED' as const,
      mode
    }
  },
  changeTransformModeOnCancel: (mode: TransformModeType) => {
    return {
      type: 'TRANSFORM_MODE_ON_CANCEL_CHANGED' as const,
      mode
    }
  },
  changedTransformSpaceMode: (transformSpace: TransformSpace) => {
    return {
      type: 'TRANSFORM_SPACE_CHANGED' as const,
      transformSpace
    }
  },
  changedTransformPivotMode: (transformPivot: TransformPivotType) => {
    return {
      type: 'TRANSFORM_PIVOT_CHANGED' as const,
      transformPivot
    }
  },
  changedSnapMode: (snapMode: SnapModeType) => {
    return {
      type: 'SNAP_MODE_CHANGED' as const,
      snapMode
    }
  },
  changeTranslationSnap: (translationSnap: number) => {
    return {
      type: 'TRANSLATION_SNAP_CHANGED' as const,
      translationSnap
    }
  },
  changeRotationSnap: (rotationSnap: number) => {
    return {
      type: 'ROTATION_SNAP_CHANGED' as const,
      rotationSnap
    }
  },
  changeScaleSnap: (scaleSnap: number) => {
    return {
      type: 'SCALE_SNAP_CHANGED' as const,
      scaleSnap
    }
  },
  changeGridToolHeight: (gridHeight: number) => {
    return {
      type: 'GRID_TOOL_HEIGHT_CHANGED' as const,
      gridHeight
    }
  },
  changeGridToolVisibility: (visibility: boolean) => {
    return {
      type: 'GRID_TOOL_VISIBILITY_CHANGED' as const,
      visibility
    }
  },
  changeNodeHelperVisibility: (visibility: boolean) => {
    return {
      type: 'NODE_HELPER_VISIBILITY_CHANGED' as const,
      visibility
    }
  },
  changePhysicsHelperVisibility: (visibility: boolean) => {
    return {
      type: 'PHYSICS_HELPER_VISIBILITY_CHANGED' as const,
      visibility
    }
  }
}

export type ModeActionType = ReturnType<typeof ModeAction[keyof typeof ModeAction]>
