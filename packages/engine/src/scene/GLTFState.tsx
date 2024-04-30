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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineQuery,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { NO_PROXY, Topic, defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import React, { useLayoutEffect } from 'react'
import { MathUtils } from 'three'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import { ModelComponent } from './components/ModelComponent'
import { SourceComponent } from './components/SourceComponent'
import { getModelSceneID } from './functions/loaders/ModelFunctions'

export const GLTFSourceState = defineState({
  name: 'GLTFState',
  initial: {} as Record<string, Entity>,

  load: (source: string, parentEntity = UndefinedEntity) => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, NameComponent, source.split('/').pop()!)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    setComponent(entity, ModelComponent, { src: source })
    const sourceID = getModelSceneID(entity)
    setComponent(entity, SourceComponent, sourceID)
    getMutableState(GLTFSourceState)[sourceID].set(entity)
    return entity
  },

  unload: (entity: Entity) => {
    const sourceID = getModelSceneID(entity)
    getMutableState(GLTFSourceState)[sourceID].set(entity)
    removeEntity(entity)
  }
})

/**@todo rename to GLTFSnapshotState */
export const GLTFSnapshotState = defineState({
  name: 'GLTFSnapshotState',
  initial: {} as Record<
    string,
    {
      snapshots: Array<GLTF.IGLTF>
      index: number
    }
  >,

  receptors: {
    onSnapshot: GLTFSnapshotAction.createSnapshot.receive((action) => {
      const { data } = action
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (!state.value) {
        state.set({ index: 0, snapshots: [data] })
        return
      }
      state.snapshots.set([...state.snapshots.get(NO_PROXY).slice(0, state.index.value + 1), data])
      state.index.set(state.index.value + 1)
    }),

    onUndo: GLTFSnapshotAction.undo.receive((action) => {
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value <= 0) return
      state.index.set(Math.max(state.index.value - action.count, 0))
    }),

    onRedo: GLTFSnapshotAction.redo.receive((action) => {
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value >= state.snapshots.value.length - 1) return
      state.index.set(Math.min(state.index.value + action.count, state.snapshots.value.length - 1))
    }),

    onClearHistory: GLTFSnapshotAction.clearHistory.receive((action) => {
      const state = getState(GLTFSnapshotState)[action.source]
      const data = state.snapshots[0]
      getMutableState(GLTFSnapshotState)[action.source].set({
        index: 0,
        snapshots: [data]
      })
    })
  },

  reactor: () => {
    const state = useHookstate(getMutableState(GLTFSnapshotState))
    return (
      <>
        {state.keys.map((source: string) => (
          <GLTFSnapshotReactor source={source} key={source} />
        ))}
      </>
    )
  },

  useSnapshotIndex(source: string) {
    return useHookstate(getMutableState(GLTFSnapshotState)[source].index)
  },

  // Source Instance => ModelComponent => Source Document
  cloneCurrentSnapshot: (sourceInstance: string) => {
    const modelEntity = getState(GLTFSourceState)[sourceInstance]
    const src = getComponent(modelEntity, ModelComponent).src
    const state = getState(GLTFSnapshotState)[src]
    return JSON.parse(JSON.stringify({ source: src, data: state.snapshots[state.index] })) as {
      data: GLTF.IGLTF
      source: string
    }
  }
})

export const EditorTopic = 'editor' as Topic

const GLTFSnapshotReactor = (props: { source: string }) => {
  const gltfState = useHookstate(getMutableState(GLTFSnapshotState)[props.source])

  useLayoutEffect(() => {
    // update gltf state with the current snapshot
    const snapshotData = gltfState.snapshots[gltfState.index.value].get(NO_PROXY)
    getMutableState(GLTFDocumentState)[props.source].set(snapshotData)
    // force model components to re-load gltf until we have a new loader

    /** re-enable for testing purposes */
    // for (const entity of modelQuery()) {
    //   if (getComponent(entity, ModelComponent).src === props.source) {
    //     /** force reload of the component */
    //     const data = serializeComponent(entity, ModelComponent)
    //     removeComponent(entity, ModelComponent)
    //     setComponent(entity, ModelComponent, data)
    //   }
    // }
  }, [gltfState.index])

  return null
}

const modelQuery = defineQuery([ModelComponent])
