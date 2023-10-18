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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import {
  SnapMode,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'

export const setTransformMode = (mode: TransformModeType): void => {
  if (mode === TransformMode.Placement || mode === TransformMode.Grab) {
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
    getMutableState(EditorHelperState).transformModeOnCancel.set(mode)
  }

  // EditorHistory.grabCheckPoint = undefined

  getMutableState(EditorHelperState).transformMode.set(mode)
}

export const toggleSnapMode = (): void => {
  getMutableState(EditorHelperState).snapMode.set((value) =>
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

export const setTransformSpace = (transformSpace: TransformSpace) => {
  getMutableState(EditorHelperState).transformSpace.set(transformSpace)
}

export const toggleTransformSpace = () => {
  getMutableState(EditorHelperState).transformSpace.set((value) =>
    value === TransformSpace.World ? TransformSpace.Local : TransformSpace.World
  )
}
