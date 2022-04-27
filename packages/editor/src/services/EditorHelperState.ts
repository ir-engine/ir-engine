import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'
import { ClientStorage } from '@xrengine/engine/src/common/classes/ClientStorage'
import InfiniteGridHelper from '@xrengine/engine/src/scene/classes/InfiniteGridHelper'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@xrengine/engine/src/scene/constants/transformConstants'

import { EditorHelperKeys } from '../constants/EditorHelperKeys'
import { SceneState } from '../functions/sceneRenderFunctions'

type EditorHelperStateType = {
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
}

const state = createState<EditorHelperStateType>({
  isPlayModeEnabled: false,
  isFlyModeEnabled: false,
  transformMode: TransformMode.Translate,
  transformModeOnCancel: TransformMode.Translate,
  transformSpace: TransformSpace.World,
  transformPivot: TransformPivot.Selection,
  snapMode: SnapMode.Grid,
  translationSnap: 0.5,
  rotationSnap: 10,
  scaleSnap: 0.1
})

export async function restoreEditorHelperData(): Promise<void> {
  if (typeof window !== 'undefined') {
    const s = {} as EditorHelperStateType

    await Promise.all([
      ClientStorage.get(EditorHelperKeys.TRANSFORM_MODE).then((v) => {
        if (typeof v !== 'undefined') s.transformMode = v as TransformModeType
        else ClientStorage.set(EditorHelperKeys.TRANSFORM_MODE, state.transformMode.value)
      }),
      ClientStorage.get(EditorHelperKeys.TRANSFORM_PIVOT).then((v) => {
        if (typeof v !== 'undefined') s.transformPivot = v as TransformPivotType
        else ClientStorage.set(EditorHelperKeys.TRANSFORM_PIVOT, state.transformPivot.value)
      }),
      ClientStorage.get(EditorHelperKeys.TRANSFORM_SPACE).then((v) => {
        if (typeof v !== 'undefined') s.transformSpace = v as TransformSpace
        else ClientStorage.set(EditorHelperKeys.TRANSFORM_SPACE, state.transformSpace.value)
      }),
      ClientStorage.get(EditorHelperKeys.SNAP_MODE).then((v) => {
        if (typeof v !== 'undefined') s.snapMode = v as SnapModeType
        else ClientStorage.set(EditorHelperKeys.SNAP_MODE, state.snapMode.value)
      }),
      ClientStorage.get(EditorHelperKeys.TRANSLATION_SNAP).then((v) => {
        if (typeof v !== 'undefined') s.translationSnap = v as number
        else ClientStorage.set(EditorHelperKeys.TRANSLATION_SNAP, state.translationSnap.value)
      }),
      ClientStorage.get(EditorHelperKeys.ROTATION_SNAP).then((v) => {
        if (typeof v !== 'undefined') s.rotationSnap = v as number
        else ClientStorage.set(EditorHelperKeys.ROTATION_SNAP, state.rotationSnap.value)
      }),
      ClientStorage.get(EditorHelperKeys.SCALE_SNAP).then((v) => {
        if (typeof v !== 'undefined') s.scaleSnap = v as number
        else ClientStorage.set(EditorHelperKeys.SCALE_SNAP, state.scaleSnap.value)
      })
    ])

    store.dispatch(EditorHelperAction.restoreStorageData(s))
  }
}

function updateHelpers(): void {
  SceneState.transformGizmo.setTransformMode(state.transformMode.value)
  InfiniteGridHelper.instance.setSize(state.translationSnap.value)
}

store.receptors.push((action: EditorHelperActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'PLAY_MODE_CHANGED':
        s.merge({ isPlayModeEnabled: action.isPlayModeEnabled })
        break
      case 'FLY_MODE_CHANGED':
        s.merge({ isFlyModeEnabled: action.isFlyModeEnabled })
        break
      case 'TRANSFORM_MODE_CHANGED':
        s.merge({ transformMode: action.mode })
        ClientStorage.set(EditorHelperKeys.TRANSFORM_MODE, action.mode)
        break
      case 'TRANSFORM_MODE_ON_CANCEL_CHANGED':
        s.merge({ transformModeOnCancel: action.mode })
        break
      case 'TRANSFORM_SPACE_CHANGED':
        s.merge({ transformSpace: action.transformSpace })
        ClientStorage.set(EditorHelperKeys.TRANSFORM_SPACE, action.transformSpace)
        break
      case 'TRANSFORM_PIVOT_CHANGED':
        s.merge({ transformPivot: action.transformPivot })
        ClientStorage.set(EditorHelperKeys.TRANSFORM_PIVOT, action.transformPivot)
        break
      case 'SNAP_MODE_CHANGED':
        s.merge({ snapMode: action.snapMode })
        ClientStorage.set(EditorHelperKeys.SNAP_MODE, action.snapMode)
        break
      case 'TRANSLATION_SNAP_CHANGED':
        s.merge({ translationSnap: action.translationSnap })
        ClientStorage.set(EditorHelperKeys.TRANSLATION_SNAP, action.translationSnap)
        break
      case 'ROTATION_SNAP_CHANGED':
        s.merge({ rotationSnap: action.rotationSnap })
        ClientStorage.set(EditorHelperKeys.ROTATION_SNAP, action.rotationSnap)
        break
      case 'SCALE_SNAP_CHANGED':
        s.merge({ scaleSnap: action.scaleSnap })
        ClientStorage.set(EditorHelperKeys.SCALE_SNAP, action.scaleSnap)
        break
      case 'RESTORE_STORAGE_DATA':
        s.merge(action.state)
        updateHelpers()
    }

    return s
  }, action.type)
})

export const accessEditorHelperState = () => state

export const useEditorHelperState = () => useState(state) as any as typeof state

//Action
export const EditorHelperAction = {
  restoreStorageData: (state: EditorHelperStateType) => {
    return {
      type: 'RESTORE_STORAGE_DATA' as const,
      state
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
  }
}

export type EditorHelperActionType = ReturnType<typeof EditorHelperAction[keyof typeof EditorHelperAction]>
