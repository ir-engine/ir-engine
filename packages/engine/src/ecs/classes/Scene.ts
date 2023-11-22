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

import { Color, Texture } from 'three'

import {
  NO_PROXY,
  Topic,
  defineAction,
  defineActionQueue,
  defineState,
  getMutableState,
  getState,
  none,
  useHookstate
} from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { useEffect } from 'react'
import { Validator, matches } from '../../common/functions/MatchesUtils'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { SceneDataType, SceneID, SceneJsonType, scenePath } from '../../schemas/projects/scene.schema'
import { PresentationSystemGroup } from '../functions/EngineFunctions'
import { defineSystem } from '../functions/SystemFunctions'
import { Engine } from './Engine'
import { EngineState } from './EngineState'
import { UndefinedEntity } from './Entity'

export interface SceneSnapshotInterface {
  data: SceneDataType
  selectedEntities: Array<EntityUUID>
}

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    scenes: {} as Record<
      SceneID,
      {
        snapshots: Array<SceneSnapshotInterface>
        index: number
      }
    >,
    /** @todo replace activeScene with proper multi-scene support */
    activeScene: null as null | SceneID,
    background: null as null | Color | Texture
  }),

  getCurrentScene: () => {
    const activeScene = getState(SceneState).activeScene
    if (!activeScene) return null
    return SceneState.getScene(activeScene)!
  },

  getMutableCurrentScene: () => {
    const activeSceneID = getState(SceneState).activeScene
    if (!activeSceneID) return null
    return SceneState.getMutableScene(activeSceneID)!
  },

  getScene: (sceneID: SceneID) => {
    const { scenes } = getState(SceneState)
    const scene = scenes[sceneID]
    if (!scene) return null
    return scene.snapshots[scene.index].data
  },

  getMutableScene: (sceneID: SceneID) => {
    const { scenes } = getMutableState(SceneState)
    const scene = scenes[sceneID]
    return scene.snapshots[scene.index.value].data
  },

  useScene: (sceneID: SceneID) => {
    const { scenes } = getMutableState(SceneState)
    const snapshots = useHookstate(scenes[sceneID].snapshots)
    const index = useHookstate(scenes[sceneID].index)
    return snapshots[index.value].data
  },

  loadScene: (sceneID: SceneID, data: SceneDataType) => {
    getMutableState(SceneState).scenes[sceneID].set({ snapshots: [{ data, selectedEntities: [] }], index: 0 })
    getMutableState(SceneState).activeScene.set(sceneID)
  },

  unloadScene: (sceneID: SceneID) => {
    getMutableState(SceneState).scenes[sceneID].set(none)
    if (getState(SceneState).activeScene === sceneID) {
      getMutableState(SceneState).activeScene.set(null)
    }
  },

  getRootEntity: (sceneID?: SceneID) => {
    if (!getState(SceneState).scenes[sceneID ?? getState(SceneState).activeScene!]) return UndefinedEntity
    const scene = getState(SceneState).scenes[sceneID ?? getState(SceneState).activeScene!]
    const currentSnapshot = scene.snapshots[scene.index].data
    return UUIDComponent.entitiesByUUID[currentSnapshot.scene.root]
  },

  // Snapshots
  resetHistory: (sceneID: SceneID) => {
    if (!getState(SceneState).scenes[sceneID]) throw new Error(`Scene ${sceneID} does not exist.`)
    const data = getState(SceneState).scenes[sceneID].snapshots[0].data
    getMutableState(SceneState).scenes[sceneID].set({
      index: 0,
      snapshots: [{ data, selectedEntities: [] }]
    })
    SceneState.applyCurrentSnapshot(sceneID)
  },

  cloneCurrentSnapshot: (sceneID: SceneID) => {
    const state = getState(SceneState).scenes[sceneID]
    return JSON.parse(JSON.stringify({ sceneID, ...state.snapshots[state.index] })) as SceneSnapshotInterface & {
      sceneID: SceneID
    }
  },

  applyCurrentSnapshot: (sceneID: SceneID) => {
    const state = getState(SceneState).scenes[sceneID]
    const snapshot = state.snapshots[state.index]

    if (snapshot.data) {
      getMutableState(EngineState).merge({
        sceneLoading: true
      })
    }
    // if (snapshot.selectedEntities)
    //   SelectionState.updateSelection(snapshot.selectedEntities.map((uuid) => UUIDComponent.entitiesByUUID[uuid] ?? uuid))
  }
})

export const SceneServices = {
  setCurrentScene: (projectName: string, sceneName: string) => {
    Engine.instance.api
      .service(scenePath)
      .get(null, { query: { project: projectName, name: sceneName } })
      .then((sceneData) => {
        SceneState.loadScene(`${projectName}/${sceneName}` as SceneID, sceneData)
      })

    return () => {
      SceneState.unloadScene(`${projectName}/${sceneName}` as SceneID)
    }
  }
}

export class SceneSnapshotAction {
  static undo = defineAction({
    type: 'ee.scene.snapshot.UNDO' as const,
    sceneID: matches.string as Validator<unknown, SceneID>,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static redo = defineAction({
    type: 'ee.scene.snapshot.REDO' as const,
    sceneID: matches.string as Validator<unknown, SceneID>,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static clearHistory = defineAction({
    type: 'ee.scene.snapshot.CLEAR_HISTORY' as const,
    sceneID: matches.string as Validator<unknown, SceneID>
  })

  static appendSnapshot = defineAction({
    type: 'ee.scene.snapshot.APPEND_SNAPSHOT' as const,
    sceneID: matches.string as Validator<unknown, SceneID>,
    json: matches.object as Validator<unknown, SceneJsonType>
    // $topic: EditorTopic,
    // $cache: true
  })

  static createSnapshot = defineAction({
    type: 'ee.scene.snapshot.CREATE_SNAPSHOT' as const,
    sceneID: matches.string as Validator<unknown, SceneID>,
    selectedEntities: matches.array as Validator<unknown, Array<EntityUUID>>,
    data: matches.object as Validator<unknown, SceneDataType>
  })
}

export const EditorTopic = 'editor' as Topic

const undoQueue = defineActionQueue(SceneSnapshotAction.undo.matches)
const redoQueue = defineActionQueue(SceneSnapshotAction.redo.matches)
const clearHistoryQueue = defineActionQueue(SceneSnapshotAction.clearHistory.matches)
const modifyQueue = defineActionQueue(SceneSnapshotAction.createSnapshot.matches)

const execute = () => {
  const isEditing = getState(EngineState).isEditing

  for (const action of undoQueue()) {
    if (!isEditing) return
    const state = getMutableState(SceneState).scenes[action.sceneID]
    if (state.index.value <= 0) continue
    state.index.set(Math.max(state.index.value - action.count, 0))
    SceneState.applyCurrentSnapshot(action.sceneID)
  }

  for (const action of redoQueue()) {
    if (!isEditing) return
    const state = getMutableState(SceneState).scenes[action.sceneID]
    if (state.index.value >= state.snapshots.value.length - 1) continue
    state.index.set(Math.min(state.index.value + action.count, state.snapshots.value.length - 1))
    SceneState.applyCurrentSnapshot(action.sceneID)
  }

  for (const action of clearHistoryQueue()) {
    if (!isEditing) return
    SceneState.resetHistory(action.sceneID)
  }

  for (const action of modifyQueue()) {
    if (!isEditing) return
    const state = getMutableState(SceneState).scenes[action.sceneID]
    const { data, selectedEntities } = action
    state.snapshots.set([...state.snapshots.get(NO_PROXY).slice(0, state.index.value + 1), { data, selectedEntities }])
    state.index.set(state.index.value + 1)
    // getMutableState(EditorState).sceneModified.set(true)
    SceneState.applyCurrentSnapshot(action.sceneID)
  }
}

const reactor = () => {
  const activeScene = useHookstate(getMutableState(SceneState).activeScene)

  useEffect(() => {
    if (!activeScene.value || getState(SceneState).scenes[activeScene.value].snapshots.length) return
    SceneState.resetHistory(activeScene.value)
  }, [activeScene])

  return null
}

export const SceneSnapshotSystem = defineSystem({
  uuid: 'ee.scene.SceneSnapshotSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
