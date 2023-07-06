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

import React, { useEffect } from 'react'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { serializeWorld } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import {
  removeSceneEntitiesFromOldJSON,
  updateSceneEntitiesFromJSON
} from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  receiveActions,
  useHookstate
} from '@etherealengine/hyperflux'
import { defineActionQueue, dispatchAction, Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { SelectionAction, SelectionState } from './SelectionServices'

export const EditorTopic = 'editor' as Topic

export type EditorStateSnapshot = {
  selectedEntities: Array<EntityUUID | string>
  data: SceneData
}

export class EditorHistoryAction {
  /** @deprecated - use EditorHistoryState.undo() */
  static undo = defineAction({
    type: 'ee.editor.EditorHistory.UNDO' as const,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  /** @deprecated - use EditorHistoryState.redo() */
  static redo = defineAction({
    type: 'ee.editor.EditorHistory.REDO' as const,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static clearHistory = defineAction({
    type: 'ee.editor.EditorHistory.CLEAR_HISTORY' as const
  })

  static appendSnapshot = defineAction({
    type: 'ee.editor.EditorHistory.APPEND_SNAPSHOT' as const,
    json: matches.object as Validator<unknown, SceneJson>
    // $topic: EditorTopic,
    // $cache: true
  })

  static createSnapshot = defineAction({
    type: 'ee.editor.EditorHistory.CREATE_SNAPSHOT' as const,
    selectedEntities: matches.array.optional() as Validator<unknown, Array<Entity | string> | undefined>
  })

  // new API
  static setIndex = defineAction({
    type: 'ee.editor.EditorHistory.SET_INDEX' as const,
    index: matches.number
  })
}

export const EditorHistoryState = defineState({
  name: 'EditorHistoryState',

  initial: () => ({
    index: 0,
    history: [] as EditorStateSnapshot[]
  }),

  receptors: [
    [
      EditorHistoryAction.undo,
      (state, action: typeof EditorHistoryAction.undo.matches._TYPE) => {
        if (state.index.value <= 0) return
        state.index.set(Math.max(state.index.value - action.count, 0))
      }
    ],
    [
      EditorHistoryAction.redo,
      (state, action: typeof EditorHistoryAction.redo.matches._TYPE) => {
        if (state.index.value >= state.history.value.length - 1) return
        state.index.set(Math.min(state.index.value + action.count, state.history.value.length - 1))
      }
    ],
    [
      EditorHistoryAction.setIndex,
      (state, action: typeof EditorHistoryAction.setIndex.matches._TYPE) => {
        state.index.set(action.index)
      }
    ]
  ],

  undo: (count = 1) => {
    const state = getState(EditorHistoryState)
    if (state.index <= 0) return
    const index = Math.max(state.index - count, 0)
    dispatchAction(EditorHistoryAction.setIndex({ index }))
  },

  redo: (count = 1) => {
    const state = getState(EditorHistoryState)
    if (state.index >= state.history.length - 1) return
    const index = Math.min(state.index + count, state.history.length - 1)
    dispatchAction(EditorHistoryAction.setIndex({ index }))
  }
})

const applyCurrentSnapshot = () => {
  const state = getState(EditorHistoryState)
  const snapshot = state.history[state.index]
  if (snapshot.data) {
    if (getState(SceneState).sceneData?.scene === snapshot.data.scene) return
    getMutableState(SceneState).sceneData.ornull!.scene.set(snapshot.data.scene)
    removeSceneEntitiesFromOldJSON()
    updateSceneEntitiesFromJSON(snapshot.data.scene.root)
  }
  if (snapshot.selectedEntities)
    dispatchAction(
      SelectionAction.updateSelection({
        selectedEntities: snapshot.selectedEntities.map((uuid) => UUIDComponent.entitiesByUUID[uuid] ?? uuid)
      })
    )
}

const clearHistoryQueue = defineActionQueue(EditorHistoryAction.clearHistory.matches)
const appendSnapshotQueue = defineActionQueue(EditorHistoryAction.appendSnapshot.matches)
const modifyQueue = defineActionQueue(EditorHistoryAction.createSnapshot.matches)

const execute = () => {
  const selectedEntitiesState = getState(SelectionState)

  const state = getMutableState(EditorHistoryState)

  for (const action of clearHistoryQueue()) {
    const selectedEntities = selectedEntitiesState.selectedEntities.map((entity) =>
      typeof entity === 'number' ? getComponent(entity, UUIDComponent) : entity
    ) as Array<EntityUUID | string>
    const data = { scene: serializeWorld(getState(SceneState).sceneEntity) } as any as SceneData
    state.merge({
      index: 0,
      history: [{ data, selectedEntities }]
    })
  }

  for (const action of appendSnapshotQueue()) {
    if (action.$from !== Engine.instance.userId) {
      const json = action.json
      /**
       * deserialize
       */

      // state.history.merge([
      //   {
      //     selectedEntities: [],
      //     json: action.json
      //   }
      // ])
    }
  }

  /** Local only - serialize world then push to CRDT */
  for (const action of modifyQueue()) {
    const editorHistory = getState(EditorHistoryState)
    const data = { scene: serializeWorld(getState(SceneState).sceneEntity) } as any as SceneData
    const selectedEntities = (action.selectedEntities ?? selectedEntitiesState.selectedEntities).map((entity) =>
      typeof entity === 'number' ? getComponent(entity, UUIDComponent) : entity
    ) as Array<EntityUUID | string>
    state.history.set([...editorHistory.history.slice(0, state.index.value + 1), { data, selectedEntities }])
    state.index.set(state.index.value + 1)
  }
}

const reactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(EditorHistoryState))

  useEffect(() => {
    applyCurrentSnapshot()
  }, [state.index])

  return null
}

export const EditorHistoryReceptorSystem = defineSystem({
  uuid: 'ee.editor.EditorHistoryReceptorSystem',
  execute: () => receiveActions(EditorHistoryState),
  reactor
})
