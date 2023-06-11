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
import { defineAction, defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { defineActionQueue, dispatchAction, Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { SelectionAction, SelectionState } from './SelectionServices'

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
  })
})

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
    selectedEntities: matches.array.optional() as Validator<unknown, Array<Entity | string> | undefined>
  })
}

const applyCurrentSnapshot = () => {
  const state = getState(EditorHistoryState)
  const snapshot = state.history[state.index]
  if (snapshot.data) {
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

const undoQueue = defineActionQueue(EditorHistoryAction.undo.matches)
const redoQueue = defineActionQueue(EditorHistoryAction.redo.matches)
const clearHistoryQueue = defineActionQueue(EditorHistoryAction.clearHistory.matches)
const appendSnapshotQueue = defineActionQueue(EditorHistoryAction.appendSnapshot.matches)
const modifyQueue = defineActionQueue(EditorHistoryAction.createSnapshot.matches)

const execute = () => {
  const selectedEntitiesState = getState(SelectionState)

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

export const EditorHistoryReceptorSystem = defineSystem({
  uuid: 'ee.editor.EditorHistoryReceptorSystem',
  execute
})
