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
import { NameComponent } from '../../scene/components/NameComponent'
import { SourceComponent } from '../../scene/components/SourceComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { serializeEntity } from '../../scene/functions/serializeWorld'
import {
  EntityJsonType,
  SceneDataType,
  SceneID,
  SceneJsonType,
  SceneMetadataType,
  scenePath
} from '../../schemas/projects/scene.schema'
import { getComponent, getOptionalComponent } from '../functions/ComponentFunctions'
import { PresentationSystemGroup } from '../functions/EngineFunctions'
import { EntityTreeComponent } from '../functions/EntityTree'
import { defineSystem } from '../functions/SystemFunctions'
import { Engine } from './Engine'
import { EngineState } from './EngineState'
import { UndefinedEntity } from './Entity'

export interface SceneSnapshotInterface {
  data: SceneJsonType
  selectedEntities: Array<EntityUUID>
}

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    scenes: {} as Record<
      SceneID,
      {
        metadata: SceneMetadataType
        snapshots: Array<SceneSnapshotInterface>
        index: number
        loadingProgress: number
        entitiesToLoad: Record<
          EntityUUID,
          {
            resources: Record<
              string,
              {
                loadedAmount: number
                totalAmount: number
              }
            >
          }
        >
      }
    >,
    /** @todo replace activeScene with proper multi-scene support */
    activeScene: null as null | SceneID,
    background: null as null | Color | Texture,
    environment: null as null | Texture
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

  getSceneMetadata: (sceneID: SceneID) => {
    const { scenes } = getState(SceneState)
    const scene = scenes[sceneID]
    if (!scene) return null
    return scene.metadata
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

  loadScene: (sceneID: SceneID, sceneData: SceneDataType) => {
    const metadata = {
      name: sceneData.name,
      thumbnailUrl: sceneData.thumbnailUrl,
      project: sceneData.project
    } as SceneMetadataType
    const data = sceneData.scene
    getMutableState(SceneState).scenes[sceneID].set({
      metadata,
      snapshots: [{ data, selectedEntities: [] }],
      index: 0,
      loadingProgress: 0,
      entitiesToLoad: {}
    })
  },

  unloadScene: (sceneID: SceneID) => {
    getMutableState(SceneState).scenes[sceneID].set(none)
    if (getState(SceneState).activeScene === sceneID) {
      getMutableState(SceneState).activeScene.set(null)
    }
  },

  useSceneLoaded: (sceneID: SceneID) => {
    const state = useHookstate(getMutableState(SceneState).scenes[sceneID])
    if (!state?.value) return false

    return state.loadingProgress.value === 100
  },

  getRootEntity: (sceneID?: SceneID) => {
    if (!getState(SceneState).scenes[sceneID ?? getState(SceneState).activeScene!]) return UndefinedEntity
    const scene = getState(SceneState).scenes[sceneID ?? getState(SceneState).activeScene!]
    const currentSnapshot = scene.snapshots[scene.index].data
    return UUIDComponent.entitiesByUUID[currentSnapshot.root]
  },

  // Snapshots
  resetHistory: (sceneID: SceneID) => {
    if (!getState(SceneState).scenes[sceneID]) throw new Error(`Scene ${sceneID} does not exist.`)
    const scene = getState(SceneState).scenes[sceneID]
    const data = scene.snapshots[0].data
    getMutableState(SceneState).scenes[sceneID].set({
      metadata: scene.metadata,
      snapshots: [{ data, selectedEntities: [] }],
      index: 0,
      loadingProgress: 0,
      entitiesToLoad: {}
    })
    SceneState.applyCurrentSnapshot(sceneID)
  },

  setEntityLoadState: (
    sceneID: SceneID,
    entityUUID: EntityUUID,
    resource: string,
    loadedAmount: number,
    totalAmount: number
  ) => {
    const entitiesToLoad = getMutableState(SceneState).scenes[sceneID].entitiesToLoad
    if (!entitiesToLoad.value[entityUUID]) entitiesToLoad[entityUUID].set({ resources: {} })
    entitiesToLoad[entityUUID].resources.merge({
      [resource]: { loadedAmount, totalAmount }
    })
  },

  clearEntityLoadState: (sceneID: SceneID, entityUUID: EntityUUID, resource: string) => {
    const entity = getMutableState(SceneState).scenes[sceneID].entitiesToLoad[entityUUID]
    entity.resources[resource].set(none)
    if (!Object.keys(entity.resources).length) entity.set(none)
  },

  cloneCurrentSnapshot: (sceneID: SceneID) => {
    const state = getState(SceneState).scenes[sceneID]
    return JSON.parse(JSON.stringify({ sceneID, ...state.snapshots[state.index] })) as SceneSnapshotInterface & {
      sceneID: SceneID
    }
  },

  snapshotFromECS: (sceneID: SceneID) => {
    const entities = SourceComponent.entitiesBySource[sceneID] ?? []
    const serializedEntities: [EntityUUID, EntityJsonType][] = entities.map((entity) => {
      const components = serializeEntity(entity)
      const name = getComponent(entity, NameComponent)
      const uuid = getComponent(entity, UUIDComponent)
      const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
      const entityJson: EntityJsonType = {
        name,
        components
      }
      if (parentEntity) {
        entityJson.parent = getComponent(parentEntity, UUIDComponent)
      }
      return [uuid, entityJson]
    })
    let rootEntity = entities[0]
    while (getComponent(rootEntity, SourceComponent) === sceneID) {
      const entityTree = getOptionalComponent(rootEntity, EntityTreeComponent)
      if (!entityTree || entityTree.parentEntity === null) break
      rootEntity = entityTree.parentEntity
    }
    const root = getComponent(rootEntity, UUIDComponent)
    const data: SceneJsonType = {
      entities: {} as Record<EntityUUID, EntityJsonType>,
      root,
      version: 0
    }
    for (const [uuid, entityJson] of serializedEntities) {
      data.entities[uuid] = entityJson
    }
    const snapshot: SceneSnapshotInterface = {
      data,
      selectedEntities: []
    }
    return snapshot
  },

  applyCurrentSnapshot: (sceneID: SceneID) => {
    const state = getState(SceneState).scenes[sceneID]
    const snapshot = state.snapshots[state.index]

    if (snapshot.data) {
      // clone and re-apply the data to ensure that the scene is updated
      getMutableState(SceneState).scenes[sceneID].snapshots[state.index].data.set((data) =>
        JSON.parse(JSON.stringify(data))
      )
    }
    // if (snapshot.selectedEntities)
    //   SelectionState.updateSelection(snapshot.selectedEntities.map((uuid) => UUIDComponent.entitiesByUUID[uuid] ?? uuid))
  }
})

export const SceneServices = {
  setCurrentScene: (sceneID: SceneID) => {
    console.log('setCurrentScene', sceneID)
    Engine.instance.api
      .service(scenePath)
      .get(null, { query: { sceneKey: sceneID } })
      .then((sceneData) => {
        SceneState.loadScene(sceneID, sceneData)
        getMutableState(SceneState).activeScene.set(sceneID)
      })

    return () => {
      SceneState.unloadScene(sceneID)
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
    data: matches.object as Validator<unknown, SceneJsonType>
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
    const scenes = getMutableState(SceneState).scenes
    if (!scenes[action.sceneID]) return
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
