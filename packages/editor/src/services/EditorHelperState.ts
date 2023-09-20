/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import { useEffect } from 'react'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import InfiniteGridHelper from '@etherealengine/engine/src/scene/classes/InfiniteGridHelper'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace,
  TransformSpaceType
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import {
  defineAction,
  defineState,
  getMutableState,
  startReactor,
  syncStateWithLocalStorage
} from '@etherealengine/hyperflux'

export const EditorHelperState = defineState({
  name: 'EditorHelperState',
  initial: () => ({
    isPlayModeEnabled: false,
    isFlyModeEnabled: false,
    transformMode: TransformMode.translate as TransformModeType,
    transformModeOnCancel: TransformMode.translate as TransformModeType,
    transformSpace: TransformSpace.world as TransformSpaceType,
    transformPivot: TransformPivot.Selection as TransformPivotType,
    snapMode: SnapMode.Grid as SnapModeType,
    translationSnap: 0.5,
    rotationSnap: 10,
    scaleSnap: 0.1,
    isGenerateThumbnailsEnabled: true
  }),
  onCreate: () => {
    syncStateWithLocalStorage(EditorHelperState, [
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

//Action
export class EditorHelperAction {
  static changedPlayMode = defineAction({
    type: 'ee.editor.EditorHelper.PLAY_MODE_CHANGED' as const,
    isPlayModeEnabled: matches.boolean
  })

  static changedFlyMode = defineAction({
    type: 'ee.editor.EditorHelper.FLY_MODE_CHANGED' as const,
    isFlyModeEnabled: matches.boolean
  })

  static changedTransformMode = defineAction({
    type: 'ee.editor.EditorHelper.TRANSFORM_MODE_CHANGED' as const,
    mode: matches.any as Validator<unknown, TransformModeType>
  })

  static changeTransformModeOnCancel = defineAction({
    type: 'ee.editor.EditorHelper.TRANSFORM_MODE_ON_CANCEL_CHANGED' as const,
    mode: matches.any as Validator<unknown, TransformModeType>
  })

  static changedTransformSpaceMode = defineAction({
    type: 'ee.editor.EditorHelper.TRANSFORM_SPACE_CHANGED' as const,
    transformSpace: matches.any as Validator<unknown, TransformSpace>
  })

  static changedTransformPivotMode = defineAction({
    type: 'ee.editor.EditorHelper.TRANSFORM_PIVOT_CHANGED' as const,
    transformPivot: matches.any as Validator<unknown, TransformPivotType>
  })

  static changedSnapMode = defineAction({
    type: 'ee.editor.EditorHelper.SNAP_MODE_CHANGED' as const,
    snapMode: matches.any as Validator<unknown, SnapModeType>
  })

  static changeTranslationSnap = defineAction({
    type: 'ee.editor.EditorHelper.TRANSLATION_SNAP_CHANGED' as const,
    translationSnap: matches.number
  })

  static changeRotationSnap = defineAction({
    type: 'ee.editor.EditorHelper.ROTATION_SNAP_CHANGED' as const,
    rotationSnap: matches.number
  })

  static changeScaleSnap = defineAction({
    type: 'ee.editor.EditorHelper.SCALE_SNAP_CHANGED' as const,
    scaleSnap: matches.number
  })

  static changedGenerateThumbnails = defineAction({
    type: 'ee.editor.EditorHelper.GENERATE_THUMBNAILS_CHANGED' as const,
    isGenerateThumbnailsEnabled: matches.boolean
  })
}
