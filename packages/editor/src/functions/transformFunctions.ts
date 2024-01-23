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

import {
  SnapMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace,
  TransformSpaceType
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { EditorHelperState } from '../services/EditorHelperState'

export const setTransformMode = (mode: TransformModeType): void => {
  getMutableState(EditorHelperState).transformMode.set(mode)
}

export const toggleSnapMode = (): void => {
  getMutableState(EditorHelperState).gridSnap.set((value) =>
    value === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled
  )
}

export const setTransformPivot = (transformPivot: TransformPivotType) => {
  getMutableState(EditorHelperState).transformPivot.set(transformPivot)
}

export const toggleTransformPivot = () => {
  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(getState(EditorHelperState).transformPivot) + 1) % pivots.length

  getMutableState(EditorHelperState).transformPivot.set(TransformPivot[pivots[nextIndex]])
}

export const setTransformSpace = (transformSpace: TransformSpaceType) => {
  getMutableState(EditorHelperState).transformSpace.set(transformSpace)
}

export const toggleTransformSpace = () => {
  getMutableState(EditorHelperState).transformSpace.set((transformSpace) =>
    transformSpace === TransformSpace.world ? TransformSpace.local : TransformSpace.world
  )
}
