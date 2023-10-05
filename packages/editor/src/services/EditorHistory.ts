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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { Validator, matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  removeSceneEntitiesFromOldJSON,
  updateSceneEntitiesFromJSON,
  updateSceneEntity
} from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import { defineAction, defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { Topic, defineActionQueue, dispatchAction } from '@etherealengine/hyperflux/functions/ActionFunctions'

import {
  ComponentJSONIDMap,
  serializeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { useEffect } from 'react'
import { EditorState } from './EditorServices'
import { SelectionAction } from './SelectionServices'

export const EditorTopic = 'editor' as Topic

export type EditorStateSnapshot = {
  selectedEntities: Array<EntityUUID | string>
  data: SceneData
}

export const EditorHistoryState = defineState({
  name: 'EditorHistoryState',
  initial: () => ({
    index: 0,
    history: [] as EditorStateSnapshot[]
  }),

  cloneCurrentSnapshot: () => {
    const state = getState(EditorHistoryState)
    return JSON.parse(JSON.stringify(state.history[state.index])) as EditorStateSnapshot
  },

  resetHistory: () => {
    const sceneData = getState(SceneState).sceneData!
    getMutableState(EditorHistoryState).set({
      index: 0,
      history: [{ data: migrateSceneData(sceneData), selectedEntities: [] }]
    })
  }
})

const migrateSceneData = (sceneData: SceneData) => {
  const migratedSceneData = JSON.parse(JSON.stringify(sceneData)) as SceneData

  for (const [key, value] of Object.entries(migratedSceneData.scene.entities)) {
    const tempEntity = createEntity()
    for (const comp of Object.values(value.components)) {
      const { name, props } = comp
      const component = ComponentJSONIDMap.get(name)
      if (!component) {
        console.warn(`Component ${name} not found`)
        continue
      }
      setComponent(tempEntity, component, props)
      const data = serializeComponent(tempEntity, component)
      comp.props = data
    }
    removeEntity(tempEntity)
  }

  return JSON.parse(JSON.stringify(migratedSceneData))
}

export class EditorHistoryAction {
  static undo = defineAction({
    type: 'ee.editor.EditorHistory.UNDO' as const,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

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
    selectedEntities: matches.array as Validator<unknown, Array<EntityUUID | string>>,
    data: matches.object as Validator<unknown, SceneData>
  })
}

const applyCurrentSnapshot = () => {
  const state = getState(EditorHistoryState)
  const snapshot = state.history[state.index]

  if (snapshot.data) {
    getMutableState(SceneState).sceneData.ornull!.scene.set(snapshot.data.scene)
    removeSceneEntitiesFromOldJSON()
    updateSceneEntity(snapshot.data.scene.root, snapshot.data.scene.entities[snapshot.data.scene.root])
    updateSceneEntitiesFromJSON(snapshot.data.scene.root)
    dispatchAction(SelectionAction.changedSceneGraph({}))
  }
  // if (snapshot.selectedEntities)
  //   dispatchAction(
  //     SelectionAction.updateSelection({
  //       selectedEntities: snapshot.selectedEntities.map((uuid) => UUIDComponent.entitiesByUUID[uuid] ?? uuid)
  //     })
  //   )
}

const undoQueue = defineActionQueue(EditorHistoryAction.undo.matches)
const redoQueue = defineActionQueue(EditorHistoryAction.redo.matches)
const clearHistoryQueue = defineActionQueue(EditorHistoryAction.clearHistory.matches)
const appendSnapshotQueue = defineActionQueue(EditorHistoryAction.appendSnapshot.matches)
const modifyQueue = defineActionQueue(EditorHistoryAction.createSnapshot.matches)

const execute = () => {
  const state = getMutableState(EditorHistoryState)
  for (const action of undoQueue()) {
    if (state.index.value <= 0) continue
    state.index.set(Math.max(state.index.value - action.count, 0))
    applyCurrentSnapshot()
  }

  for (const action of redoQueue()) {
    if (state.index.value >= state.history.value.length - 1) continue
    state.index.set(Math.min(state.index.value + action.count, state.history.value.length - 1))
    applyCurrentSnapshot()
  }

  for (const action of clearHistoryQueue()) {
    EditorHistoryState.resetHistory()
  }

  for (const action of appendSnapshotQueue()) {
    if (action.$from !== Engine.instance.userID) {
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
    const { data, selectedEntities } = action
    state.history.set([...editorHistory.history.slice(0, state.index.value + 1), { data, selectedEntities }])
    state.index.set(state.index.value + 1)
    getMutableState(EditorState).sceneModified.set(true)
    applyCurrentSnapshot()
  }
}

const reactor = () => {
  const sceneData = useHookstate(getMutableState(SceneState)).sceneData

  useEffect(() => {
    if (getState(EditorHistoryState).history.length || !sceneData.value?.scene) return
    EditorHistoryState.resetHistory()
  }, [sceneData])

  return null
}

export const EditorHistoryReceptorSystem = defineSystem({
  uuid: 'ee.editor.EditorHistoryReceptorSystem',
  execute,
  reactor
})
