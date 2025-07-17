/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { Entity, UndefinedEntity } from '@ir-engine/ecs'
import { defineState, getMutableState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace,
  TransformSpaceType
} from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { useEffect } from 'react'
import { EditorMode, EditorModeType } from '../constants/EditorModeTypes'
import { VolumeVisibility } from '../functions/gizmos/studioIconGizmoHelper'

export const PlacementMode = {
  DRAG: 0,
  CLICK: 1
} as const

export type PlacementModeType = (typeof PlacementMode)[keyof typeof PlacementMode]

export const EditorHelperState = defineState({
  name: 'EditorHelperState',
  initial: () => ({
    editorMode: EditorMode.Simple as EditorModeType,
    transformMode: TransformMode.translate as TransformModeType,
    transformSpace: TransformSpace.local as TransformSpaceType,
    transformPivot: TransformPivot.FirstSelected as TransformPivotType,
    transformGizmoEntity: UndefinedEntity as Entity,
    gridSnap: SnapMode.Disabled as SnapModeType,
    translationSnap: 0.5,
    rotationSnap: 10,
    scaleSnap: 0.1,
    placementMode: PlacementMode.DRAG as PlacementModeType,
    gizmoEnabled: true,
    gridVisibility: false,
    gridHeight: 0,
    showGlbChildren: true,
    volumeVisibility: 'Auto' as keyof typeof VolumeVisibility,
    editorIconMaxSize: 0.5,
    editorIconMinSize: 0.4
  }),
  extension: syncStateWithLocalStorage([
    'snapMode',
    'translationSnap',
    'rotationSnap',
    'scaleSnap',
    'gridVisibility',
    'gridHeight'
  ]),
  reactor: () => {
    const [showGlbChildrenFlag] = useFeatureFlags([FeatureFlags.Studio.UI.Hierarchy.ShowGlbChildren])

    useEffect(() => {
      const showGlbChildren = getMutableState(EditorHelperState).showGlbChildren
      if (typeof showGlbChildrenFlag !== 'undefined') {
        showGlbChildren.set(showGlbChildrenFlag)
      }
    }, [showGlbChildrenFlag])

    return null
  }
})
