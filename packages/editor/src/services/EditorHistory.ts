import { SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SystemDefintion } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { serializeWorld } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import { updateSceneFromJSON } from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import { defineAction, defineState, getMutableState, NO_PROXY } from '@etherealengine/hyperflux'
import {
  createActionQueue,
  dispatchAction,
  removeActionQueue,
  Topic
} from '@etherealengine/hyperflux/functions/ActionFunctions'

import { SelectionAction, SelectionState } from './SelectionServices'

export const EditorTopic = 'editor' as Topic

export type EditorStateSnapshot = {
  selectedEntities?: Array<Entity | string>
  data?: SceneData
}

export const EditorHistoryState = defineState({
  name: 'EditorHistoryState',
  initial: () => ({
    index: 0,
    includeSelection: false,
    history: [] as EditorStateSnapshot[]
  })
})

export default function EditorHistoryReceptor(): SystemDefintion {
  const state = getMutableState(EditorHistoryState)

  const selectedEntitiesState = getMutableState(SelectionState)

  const applyCurrentSnapshot = () => {
    const snapshot = state.history[state.index.value].get(NO_PROXY)
    console.log('Applying snapshot', state.index.value, snapshot)
    if (snapshot.data) updateSceneFromJSON(snapshot.data)
    if (snapshot.selectedEntities)
      dispatchAction(SelectionAction.updateSelection({ selectedEntities: snapshot.selectedEntities }))
  }

  const undoQueue = createActionQueue(EditorHistoryAction.undo.matches)
  const redoQueue = createActionQueue(EditorHistoryAction.redo.matches)
  const clearHistoryQueue = createActionQueue(EditorHistoryAction.clearHistory.matches)
  const appendSnapshotQueue = createActionQueue(EditorHistoryAction.appendSnapshot.matches)
  const modifyQueue = createActionQueue(EditorHistoryAction.createSnapshot.matches)

  const execute = () => {
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
      state.merge({
        index: 0,
        history: [{ data: { scene: serializeWorld(Engine.instance.currentScene.sceneEntity) } as any as SceneData }]
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
      if (action.modify) {
        const data = { scene: serializeWorld(Engine.instance.currentScene.sceneEntity) } as any as SceneData
        state.history.set([...state.history.get(NO_PROXY).slice(0, state.index.value + 1), { data }])
        state.index.set(state.index.value + 1)
      } else if (state.includeSelection.value) {
        const selectedEntities =
          action.selectedEntities ?? selectedEntitiesState.selectedEntities.get({ noproxy: true })
        state.history.set([...state.history.get(NO_PROXY).slice(0, state.index.value + 1), { selectedEntities }])
        state.index.set(state.index.value + 1)
      }
    }
  }

  const cleanup = async () => {
    removeActionQueue(undoQueue)
    removeActionQueue(redoQueue)
    removeActionQueue(clearHistoryQueue)
    removeActionQueue(appendSnapshotQueue)
    removeActionQueue(modifyQueue)
  }

  return { execute, cleanup }
}

export const EditorHistoryService = {}

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
    selectedEntities: matches.array.optional() as Validator<unknown, Array<Entity | string> | undefined>,
    modify: matches.boolean.optional()
  })
}
