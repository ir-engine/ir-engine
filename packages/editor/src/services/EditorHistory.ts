import { Object3D } from 'three'

import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { ComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SystemDefintion } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'
import { createActionQueue, removeActionQueue, Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

import { SelectionState } from './SelectionServices'

export const EditorTopic = 'editor' as Topic

export type EditorStateSnapshot = {
  selectedEntities: Array<Entity | string>
  json?: SceneJson
}

export const EditorHistoryState = defineState({
  name: 'EditorHistoryState',
  initial: () => ({
    history: [] as EditorStateSnapshot[]
  })
})

export default function EditorHistoryReceptor(world: World): SystemDefintion {
  const state = getState(EditorHistoryState)

  const selectedEntitiesState = getState(SelectionState)

  const undoQueue = createActionQueue(EditorHistoryAction.undo.matches)
  const redoQueue = createActionQueue(EditorHistoryAction.redo.matches)
  const appendSnapshotQueue = createActionQueue(EditorHistoryAction.append.matches)
  const createSnapshotQueue = createActionQueue(EditorHistoryAction.create.matches)

  const execute = () => {
    for (const action of undoQueue()) {
    }

    for (const action of redoQueue()) {
    }

    for (const action of appendSnapshotQueue()) {
      state.history.merge([
        {
          selectedEntities: action.selectedEntities,
          json: action.json
        }
      ])
    }

    if (createSnapshotQueue().length) {
      const selectedEntities = selectedEntitiesState.selectedEntities.get({ noproxy: true })
      const json = serializeWorld(world.entityTree.rootNode)
      state.history.merge([{ selectedEntities, json }])
    }
  }

  const cleanup = async () => {
    removeActionQueue(undoQueue)
    removeActionQueue(redoQueue)
    removeActionQueue(appendSnapshotQueue)
    removeActionQueue(createSnapshotQueue)
  }

  return { execute, cleanup }
}

export const EditorHistoryService = {}

export class EditorHistoryAction {
  static undo = defineAction({
    type: 'xre.editor.EditorHistory.UNDO' as const,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static redo = defineAction({
    type: 'xre.editor.EditorHistory.REDO' as const,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static append = defineAction({
    type: 'xre.editor.EditorHistory.APPEND_SNAPSHOT' as const,
    json: matches.object as Validator<unknown, SceneJson>,
    selectedEntities: matches.array as Validator<unknown, Array<Entity | string>>
    // $topic: EditorTopic,
    // $cache: true
  })

  static create = defineAction({
    type: 'xre.editor.EditorHistory.CREATE_SNAPSHOT' as const
  })
}
