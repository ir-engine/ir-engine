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

import { EntityUUID, UUIDComponent, createEntity, removeEntity } from '@etherealengine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import {
  NO_PROXY,
  Topic,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate
} from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import React, { useLayoutEffect } from 'react'
import matches, { Validator } from 'ts-matches'
import { GLTFDocumentState, GLTFSnapshotAction } from '../gltf/GLTFDocumentState'
import { GLTFSnapshotState } from '../gltf/GLTFState'
import { SourceComponent } from './components/SourceComponent'
import { entityJSONToGLTFNode } from './functions/GLTFConversion'
import { migrateDirectionalLightUseInCSM } from './functions/migrateDirectionalLightUseInCSM'
import { migrateOldColliders } from './functions/migrateOldColliders'
import { migrateOldComponentJSONIDs } from './functions/migrateOldComponentJSONIDs'
import { migrateSceneSettings } from './functions/migrateSceneSettings'
import { serializeEntity } from './functions/serializeWorld'
import { EntityJsonType, SceneJSONDataType, SceneJsonType } from './types/SceneTypes'

export interface SceneSnapshotInterface {
  data: SceneJsonType
}

/** @deprecated - will be removed in favour of comprehensive loading via GLTF */
export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    scenes: {} as Record<string, SceneJSONDataType>
  }),

  getScene: (sceneID: string) => {
    return getState(SceneState).scenes[sceneID]
  },

  useScene: (sceneID: string) => {
    return useHookstate(getMutableState(SceneState).scenes[sceneID]).scene
  },

  loadScene: (sceneID: string, sceneData: SceneJSONDataType) => {
    const data: SceneJsonType = sceneData.scene

    migrateOldComponentJSONIDs(data)
    migrateSceneSettings(data)
    for (const [uuid, entityJson] of Object.entries(data.entities)) {
      migrateOldColliders(entityJson)
    }
    migrateDirectionalLightUseInCSM(data)

    getMutableState(SceneState).scenes[sceneID].set(sceneData)

    dispatchAction(SceneSnapshotAction.createSnapshot({ sceneID, data }))

    if (!UUIDComponent.getEntityByUUID(data.root)) {
      return createRootEntity(sceneID, data)
    }
  },
  injectScene: (modelEntity: Entity, data: Record<EntityUUID, EntityJsonType>) => {
    //get model UUID and parent UUID
    const modelUUID = getComponent(modelEntity, UUIDComponent)
    const parentEntity = getComponent(modelEntity, EntityTreeComponent)?.parentEntity
    if (!parentEntity) return
    const parentUUID = getComponent(parentEntity, UUIDComponent)
    //get the sceneID from the parent entity
    const sceneID = getComponent(parentEntity, SourceComponent)
    if (!sceneID) return
    // //get snapshot from the sceneID
    if (!getState(SceneSnapshotState)[sceneID]) {
      const parentGLTFSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
      //remove the model entity from the snapshot, if it exists
      const modelIndex = parentGLTFSnapshot.data.nodes?.findIndex(
        (n) => n.extensions?.[UUIDComponent.jsonID] === modelUUID
      )
      if (typeof modelIndex === 'number' && modelIndex >= 0) {
        parentGLTFSnapshot.data.nodes?.splice(modelIndex, 1)
      }
      //set current entity as child of parentGLTFSnapshot
      const nodes: Record<EntityUUID, GLTF.INode> = {}
      for (const [uuid, entityJson] of Object.entries(data)) {
        const entityUUID = uuid as EntityUUID
        if (entityUUID === modelUUID) continue
        const node = entityJSONToGLTFNode(entityJson, entityUUID)
        nodes[entityUUID] = node
      }
      parentGLTFSnapshot.data.nodes = [...parentGLTFSnapshot.data.nodes!, ...Object.values(nodes)]
      //transfer parent-child relationships
      for (const [uuid, entityJson] of Object.entries(data)) {
        const entityUUID = uuid as EntityUUID
        if (entityUUID === modelUUID) continue
        const thisParentUUID = entityJson.parent === modelUUID ? parentUUID : entityJson.parent
        const parentNode = parentGLTFSnapshot.data.nodes?.find(
          (n) => n.extensions?.[UUIDComponent.jsonID] === thisParentUUID
        ) as GLTF.INode
        const childIndex = parentGLTFSnapshot.data.nodes?.findIndex(
          (n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID
        )
        if (!parentNode) continue
        if (parentNode.children && !parentNode.children.includes(childIndex)) {
          parentNode.children.push(childIndex)
        } else {
          parentNode.children = [childIndex]
        }
      }
      console.log(getState(GLTFDocumentState))
      dispatchAction(GLTFSnapshotAction.createSnapshot(parentGLTFSnapshot))
    } else {
      const snapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)
      //remove the model entity from the snapshot, if it exists
      delete snapshot.data.entities[modelUUID]
      //add new data as child of the parent entity
      for (const [uuid, entityJson] of Object.entries(data)) {
        if (entityJson.parent === parentUUID) {
          entityJson.parent = parentUUID
        }
      }
      snapshot.data.entities = { ...snapshot.data.entities, ...data }
      //create a new snapshot
      dispatchAction(SceneSnapshotAction.createSnapshot(snapshot))
    }
  },
  unloadScene: (sceneID: string, remove = true) => {
    const sceneData = getState(SceneState).scenes[sceneID]
    if (!sceneData) return
    getMutableState(SceneState).scenes[sceneID].set(none)
    if (!remove) return
    const root = sceneData.scene.root
    const rootEntity = UUIDComponent.getEntityByUUID(root)
    removeEntity(rootEntity)
  },

  getRootEntity: (sceneID: string) => {
    if (!getState(SceneState).scenes[sceneID]) return UndefinedEntity
    const scene = getState(SceneState).scenes[sceneID].scene
    return UUIDComponent.getEntityByUUID(scene.root)
  }
})

/** @deprecated - will be removed in favour of comprehensive loading via GLTF */
export class SceneSnapshotAction {
  static createSnapshot = defineAction({
    type: 'ee.scene.snapshot.CREATE_SNAPSHOT' as const,
    sceneID: matches.string as Validator<unknown, string>,
    // selectedEntities: matches.array as Validator<unknown, Array<EntityUUID>>,
    data: matches.object as Validator<unknown, SceneJsonType>
  })

  static undo = defineAction({
    type: 'ee.scene.snapshot.UNDO' as const,
    sceneID: matches.string as Validator<unknown, string>,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static redo = defineAction({
    type: 'ee.scene.snapshot.REDO' as const,
    sceneID: matches.string as Validator<unknown, string>,
    count: matches.number
    // $topic: EditorTopic,
    // $cache: true
  })

  static clearHistory = defineAction({
    type: 'ee.scene.snapshot.CLEAR_HISTORY' as const,
    sceneID: matches.string as Validator<unknown, string>
  })
}

/** @deprecated - will be removed in favour of comprehensive loading via GLTF */
export const SceneSnapshotState = defineState({
  name: 'SceneSnapshotState',
  initial: {} as Record<
    string,
    {
      snapshots: Array<SceneSnapshotInterface>
      index: number
    }
  >,

  receptors: {
    onSnapshot: SceneSnapshotAction.createSnapshot.receive((action) => {
      const { data } = action
      const state = getMutableState(SceneSnapshotState)[action.sceneID]
      if (!state.value) {
        state.set({
          index: 0,
          snapshots: [{ data }]
        })
        return
      }
      state.snapshots.set([...state.snapshots.get(NO_PROXY).slice(0, state.index.value + 1), { data }])
      state.index.set(state.index.value + 1)
    }),

    onUndo: SceneSnapshotAction.undo.receive((action) => {
      const state = getMutableState(SceneSnapshotState)[action.sceneID]
      if (state.index.value <= 0) return
      state.index.set(Math.max(state.index.value - action.count, 0))
    }),

    onRedo: SceneSnapshotAction.redo.receive((action) => {
      const state = getMutableState(SceneSnapshotState)[action.sceneID]
      if (state.index.value >= state.snapshots.value.length - 1) return
      state.index.set(Math.min(state.index.value + action.count, state.snapshots.value.length - 1))
    }),

    onClearHistory: SceneSnapshotAction.clearHistory.receive((action) => {
      const state = getMutableState(SceneSnapshotState)[action.sceneID]
      const data = state.snapshots[0].data.get(NO_PROXY)
      getMutableState(SceneSnapshotState)[action.sceneID].set({
        index: 0,
        snapshots: [{ data }]
      })
    })
  },

  reactor: () => {
    const state = useHookstate(getMutableState(SceneSnapshotState))
    return (
      <>
        {state.keys.map((sceneID: string) => (
          <SceneSnapshotReactor sceneID={sceneID} key={sceneID} />
        ))}
      </>
    )
  },

  useSnapshotIndex(sceneID: string) {
    return useHookstate(getMutableState(SceneSnapshotState)[sceneID].index)
  },

  cloneCurrentSnapshot: (sceneID: string) => {
    const state = getState(SceneSnapshotState)[sceneID]
    return JSON.parse(JSON.stringify({ sceneID, ...state.snapshots[state.index] })) as SceneSnapshotInterface & {
      sceneID: string
    }
  },

  /** @todo reserved for future use */
  snapshotFromECS: (sceneID: string) => {
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
      data
    }
    return snapshot
  }
})

export const EditorTopic = 'editor' as Topic

const SceneSnapshotReactor = (props: { sceneID: string }) => {
  const sceneState = useHookstate(getMutableState(SceneSnapshotState)[props.sceneID])

  useLayoutEffect(() => {
    if (!sceneState.index.value) return
    // update scene state with the current snapshot
    getMutableState(SceneState).scenes[props.sceneID].scene.set(
      sceneState.snapshots[sceneState.index.value].data.get(NO_PROXY)
    )
  }, [sceneState.index])

  return null
}

const createRootEntity = (sceneID: string, sceneData: SceneJsonType) => {
  const entityState = sceneData.entities[sceneData.root]
  const entity = createEntity()
  setComponent(entity, UUIDComponent, sceneData.root)
  setComponent(entity, NameComponent, entityState.name)
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, SourceComponent, sceneID)
  setComponent(entity, TransformComponent)
  /** We don't want a parent here, because we want whatever loaded the scene to have the responsibility of determining where this scene is renderer */
  setComponent(entity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  return entity
}
