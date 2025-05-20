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

import { useEffect } from 'react'

import { EntityUUID, UUIDComponent, entityExists } from '@ir-engine/ecs'
import { LayerID, Layers, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { SelectTagComponent } from '@ir-engine/engine/src/scene/components/SelectTagComponent'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'

export const SelectionState = defineState({
  name: 'SelectionState',
  initial: {
    selectedEntities: [] as EntityUUID[]
  },
  updateSelection: (selectedEntities: EntityUUID[]) => {
    getMutableState(SelectionState).selectedEntities.set(selectedEntities)
  },
  getSelectedEntities: (layer: LayerID = Layers.Authoring) => {
    return getState(SelectionState).selectedEntities.map((entity) => UUIDComponent.getEntityByUUID(entity, layer))
  },

  useSelectedEntities: (layer: LayerID = Layers.Authoring) => {
    return useHookstate(getMutableState(SelectionState).selectedEntities).value.map((entity) =>
      UUIDComponent.getEntityByUUID(entity, layer)
    )
  }
})

const reactor = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)

  useEffect(() => {
    const entities = [...selectedEntities.value].map((entity) =>
      UUIDComponent.getEntityByUUID(entity, Layers.Authoring)
    )
    for (const entity of entities) {
      if (!entityExists(entity)) continue
      setComponent(entity, SelectTagComponent)
    }

    return () => {
      for (const entity of entities) {
        if (!entityExists(entity)) continue
        removeComponent(entity, SelectTagComponent)
      }
    }
  }, [selectedEntities])

  return null
}

export const EditorSelectionReceptorSystem = defineSystem({
  uuid: 'ee.engine.EditorSelectionReceptorSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
