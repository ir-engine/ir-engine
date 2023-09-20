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
import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { EditorHelperAction, EditorHelperState } from '../services/EditorHelperState'

export const setTransformMode = (mode: TransformModeType): void => {
  /*if (mode === TransformMode.Placement || mode === TransformMode.Grab) {
    let stop = false
    const selectedEntities = getState(SelectionState).selectedEntities

    // Dont allow grabbing / placing objects with transform disabled.
    for (const entity of selectedEntities) {
      const isUuid = typeof entity === 'string'
      const node = isUuid ? Engine.instance.scene.getObjectByProperty('uuid', entity) : entity

      if (!isUuid && node) {
        traverseEntityNode(node as Entity, (child) => {
          if (!hasComponent(child, TransformComponent)) stop = true
        })
      }

      if (stop) return
    }
  }

  if (mode !== TransformMode.Placement && mode !== TransformMode.Grab) {
    dispatchAction(EditorHelperAction.changeTransformModeOnCancel({ mode }))
  }

  // EditorHistory.grabCheckPoint = undefined*/

  dispatchAction(EditorHelperAction.changedTransformMode({ mode }))
}

export const toggleSnapMode = (): void => {
  dispatchAction(
    EditorHelperAction.changedSnapMode({
      snapMode: getState(EditorHelperState).snapMode === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled
    })
  )
}

export const setTransformPivot = (transformPivot: TransformPivotType) => {
  dispatchAction(EditorHelperAction.changedTransformPivotMode({ transformPivot }))
}

export const toggleTransformPivot = () => {
  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(getState(EditorHelperState).transformPivot) + 1) % pivots.length

  dispatchAction(EditorHelperAction.changedTransformPivotMode({ transformPivot: TransformPivot[pivots[nextIndex]] }))
}

export const setTransformSpace = (transformSpace: TransformSpaceType) => {
  dispatchAction(EditorHelperAction.changedTransformSpaceMode({ transformSpace }))
}

export const toggleTransformSpace = () => {
  dispatchAction(
    EditorHelperAction.changedTransformSpaceMode({
      transformSpace:
        getState(EditorHelperState).transformSpace === TransformSpace.world
          ? TransformSpace.local
          : TransformSpace.world
    })
  )
}
