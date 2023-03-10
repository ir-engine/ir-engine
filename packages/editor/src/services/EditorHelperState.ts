import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import InfiniteGridHelper from '@etherealengine/engine/src/scene/classes/InfiniteGridHelper'
import { TransformGizmoComponent } from '@etherealengine/engine/src/scene/components/TransformGizmo'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import {
  defineAction,
  defineState,
  getMutableState,
  startReactor,
  syncStateWithLocalStorage
} from '@etherealengine/hyperflux'

import { createTransformGizmo } from '../systems/EditorControlSystem'

export const EditorHelperState = defineState({
  name: 'EditorHelperState',
  initial: () => ({
    isPlayModeEnabled: false,
    isFlyModeEnabled: false,
    transformMode: TransformMode.Translate as TransformModeType,
    transformModeOnCancel: TransformMode.Translate as TransformModeType,
    transformSpace: TransformSpace.World as TransformSpace,
    transformPivot: TransformPivot.Selection as TransformPivotType,
    snapMode: SnapMode.Grid as SnapModeType,
    translationSnap: 0.5,
    rotationSnap: 10,
    scaleSnap: 0.1,
    isGenerateThumbnailsEnabled: true
  }),
  onCreate: () => {
    syncStateWithLocalStorage(EditorHelperState, [
      'isFlyModeEnabled',
      'transformMode',
      'transformModeOnCancel',
      'transformSpace',
      'transformPivot',
      'snapMode',
      'translationSnap',
      'rotationSnap',
      'scaleSnap',
      'isGenerateThumbnailsEnabled'
    ])
    /** @todo move this to EditorHelperServiceSystem when the receptor is moved over */
    startReactor(() => {
      const state = useHookstate(getMutableState(EditorHelperState))

      useEffect(() => {
        InfiniteGridHelper.instance?.setSize(state.translationSnap.value)
      }, [state.translationSnap])

      return null!
    })
  }
})

export const EditorHelperServiceReceptor = (action): any => {
  const s = getMutableState(EditorHelperState)
  matches(action)
    .when(EditorHelperAction.changedPlayMode.matches, (action) => {
      s.isPlayModeEnabled.set(action.isPlayModeEnabled)
    })
    .when(EditorHelperAction.changedFlyMode.matches, (action) => {
      s.isFlyModeEnabled.set(action.isFlyModeEnabled)
    })
    .when(EditorHelperAction.changedTransformMode.matches, (action) => {
      s.transformMode.set(action.mode)
    })
    .when(EditorHelperAction.changeTransformModeOnCancel.matches, (action) => {
      s.transformModeOnCancel.set(action.mode)
    })
    .when(EditorHelperAction.changedTransformSpaceMode.matches, (action) => {
      s.transformSpace.set(action.transformSpace)
    })
    .when(EditorHelperAction.changedTransformPivotMode.matches, (action) => {
      s.transformPivot.set(action.transformPivot)
    })
    .when(EditorHelperAction.changedSnapMode.matches, (action) => {
      s.snapMode.set(action.snapMode)
    })
    .when(EditorHelperAction.changeTranslationSnap.matches, (action) => {
      s.translationSnap.set(action.translationSnap)
    })
    .when(EditorHelperAction.changeRotationSnap.matches, (action) => {
      s.rotationSnap.set(action.rotationSnap)
    })
    .when(EditorHelperAction.changeScaleSnap.matches, (action) => {
      s.scaleSnap.set(action.scaleSnap)
    })
    .when(EditorHelperAction.changedGenerateThumbnails.matches, (action) => {
      s.isGenerateThumbnailsEnabled.set(action.isGenerateThumbnailsEnabled)
    })
}

export const accessEditorHelperState = () => getMutableState(EditorHelperState)

export const useEditorHelperState = (() =>
  useHookstate(getMutableState(EditorHelperState))) as typeof accessEditorHelperState

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

  static changedGenerateThumbnails = defineAction({
    type: 'xre.editor.EditorHelper.GENERATE_THUMBNAILS_CHANGED' as const,
    isGenerateThumbnailsEnabled: matches.boolean
  })
}
