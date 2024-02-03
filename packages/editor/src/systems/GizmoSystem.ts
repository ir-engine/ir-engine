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

import { UndefinedEntity, createEntity, removeEntity } from '@etherealengine/ecs'
import { getComponent, hasComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useHookstate, useState } from '@hookstate/core'
import { useEffect } from 'react'
import { Object3D } from 'three'
import { TransformGizmoControlledComponent } from '../classes/TransformGizmoComponent'
import { SelectionState } from '../services/SelectionServices'

const gizmoQuery = defineQuery([TransformGizmoControlledComponent])

const execute = () => {
  for (const entity of gizmoQuery()) {
    const gizmo = getComponent(entity, TransformGizmoControlledComponent)
    //gizmo.updateMatrixWorld()
  }
}

const reactor = () => {
  const selectionState = useHookstate(getMutableState(SelectionState))
  const sceneQuery = defineQuery([SceneObjectComponent])
  const pivotEntity = useState(UndefinedEntity)

  useEffect(() => {
    const selectedEntities = selectionState.selectedEntities
    if (!selectedEntities.value) return
    const pivotEntityName = 'pivotEntity'
    for (const entity of sceneQuery()) {
      if (!hasComponent(entity, TransformGizmoControlledComponent)) continue
      removeComponent(entity, TransformGizmoControlledComponent)
    }

    if (selectedEntities.length > 1 && pivotEntity.value === UndefinedEntity) {
      const pivotProxy = new Object3D()
      pivotEntity.set(createEntity())
      setComponent(pivotEntity.value, NameComponent, pivotEntityName)
      setComponent(pivotEntity.value, VisibleComponent)
      setComponent(pivotEntity.value, EntityTreeComponent, {
        parentEntity: SceneState.getRootEntity(getState(SceneState).activeScene!)
      })
      addObjectToGroup(pivotEntity.value, pivotProxy)
      setComponent(pivotEntity.value, TransformGizmoControlledComponent)
    } else {
      const lastSelection = selectedEntities[selectedEntities.length - 1].value
      if (!lastSelection) return
      if (!sceneQuery().includes(lastSelection)) return
      setComponent(lastSelection, TransformGizmoControlledComponent)
      if (pivotEntity.value !== UndefinedEntity) {
        removeEntity(pivotEntity.value)

        pivotEntity.set(UndefinedEntity)
      }
    }
  }, [selectionState.selectedEntities])

  useEffect(() => {
    if (selectionState.selectedEntities.length <= 1) return

    /*for (const entity of gizmoQuery()) {
          removeComponent(entity,TransformGizmoComponent)
    }*/

    return () => {}
  }, [selectionState.selectedEntities])

  return null
}

export const GizmoSystem = defineSystem({
  uuid: 'ee.editor.GizmoSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
