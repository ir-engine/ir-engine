import { useHookstate } from '@hookstate/core'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
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
import { defineAction, defineState, dispatchAction, getState, syncStateWithLocalStorage } from '@xrengine/hyperflux'

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

const EditorHelperState = defineState({
  name: 'EditorHelperState',
  initial: () =>
    ({
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
    } as EditorHelperStateType),
  onCreate: () => {
    syncStateWithLocalStorage(EditorHelperState, [
      'isPlayModeEnabled',
      'isFlyModeEnabled',
      'transformMode',
      'transformModeOnCancel',
      'transformSpace',
      'transformPivot',
      'snapMode',
      'translationSnap',
      'rotationSnap',
      'scaleSnap'
    ])
  }
})

function updateHelpers(): void {
  const state = getState(EditorHelperState)
  SceneState.transformGizmo.setTransformMode(state.transformMode.value)
  InfiniteGridHelper.instance.setSize(state.translationSnap.value)
}

export const EditorHelperServiceReceptor = (action): any => {
  const s = getState(EditorHelperState)
  matches(action)
    .when(EditorHelperAction.changedPlayMode.matches, (action) => {
      return s.merge({ isPlayModeEnabled: action.isPlayModeEnabled })
    })
    .when(EditorHelperAction.changedFlyMode.matches, (action) => {
      return s.merge({ isFlyModeEnabled: action.isFlyModeEnabled })
    })
    .when(EditorHelperAction.changedTransformMode.matches, (action) => {
      s.merge({ transformMode: action.mode })
      return s
    })
    .when(EditorHelperAction.changeTransformModeOnCancel.matches, (action) => {
      return s.merge({ transformModeOnCancel: action.mode })
    })
    .when(EditorHelperAction.changedTransformSpaceMode.matches, (action) => {
      s.merge({ transformSpace: action.transformSpace })
      return s
    })
    .when(EditorHelperAction.changedTransformPivotMode.matches, (action) => {
      s.merge({ transformPivot: action.transformPivot })
      return s
    })
    .when(EditorHelperAction.changedSnapMode.matches, (action) => {
      s.merge({ snapMode: action.snapMode })
      return s
    })
    .when(EditorHelperAction.changeTranslationSnap.matches, (action) => {
      s.merge({ translationSnap: action.translationSnap })
      return s
    })
    .when(EditorHelperAction.changeRotationSnap.matches, (action) => {
      s.merge({ rotationSnap: action.rotationSnap })
      return s
    })
    .when(EditorHelperAction.changeScaleSnap.matches, (action) => {
      s.merge({ scaleSnap: action.scaleSnap })
      return s
    })
}

export const accessEditorHelperState = () => getState(EditorHelperState)

export const useEditorHelperState = (() => useHookstate(getState(EditorHelperState))) as typeof accessEditorHelperState

//Action
export class EditorHelperAction {
  static changedPlayMode = defineAction({
    type: 'xre.editor.EditorHelper.PLAY_MODE_CHANGED' as const,
    isPlayModeEnabled: matches.boolean
  })

  static changedFlyMode = defineAction({
    type: 'xre.editor.EditorHelper.FLY_MODE_CHANGED' as const,
    isFlyModeEnabled: matches.boolean
  })

  static changedTransformMode = defineAction({
    type: 'xre.editor.EditorHelper.TRANSFORM_MODE_CHANGED' as const,
    mode: matches.any as Validator<unknown, TransformModeType>
  })

  static changeTransformModeOnCancel = defineAction({
    type: 'xre.editor.EditorHelper.TRANSFORM_MODE_ON_CANCEL_CHANGED' as const,
    mode: matches.any as Validator<unknown, TransformModeType>
  })

  static changedTransformSpaceMode = defineAction({
    type: 'xre.editor.EditorHelper.TRANSFORM_SPACE_CHANGED' as const,
    transformSpace: matches.any as Validator<unknown, TransformSpace>
  })

  static changedTransformPivotMode = defineAction({
    type: 'xre.editor.EditorHelper.TRANSFORM_PIVOT_CHANGED' as const,
    transformPivot: matches.any as Validator<unknown, TransformPivotType>
  })

  static changedSnapMode = defineAction({
    type: 'xre.editor.EditorHelper.SNAP_MODE_CHANGED' as const,
    snapMode: matches.any as Validator<unknown, SnapModeType>
  })

  static changeTranslationSnap = defineAction({
    type: 'xre.editor.EditorHelper.TRANSLATION_SNAP_CHANGED' as const,
    translationSnap: matches.number
  })

  static changeRotationSnap = defineAction({
    type: 'xre.editor.EditorHelper.ROTATION_SNAP_CHANGED' as const,
    rotationSnap: matches.number
  })

  static changeScaleSnap = defineAction({
    type: 'xre.editor.EditorHelper.SCALE_SNAP_CHANGED' as const,
    scaleSnap: matches.number
  })
}
