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
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import {
  NO_PROXY,
  Topic,
  Validator,
  defineAction,
  defineState,
  getMutableState,
  getState,
  matches,
  useHookstate
} from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import React, { useLayoutEffect } from 'react'
import { MathUtils } from 'three'
import { ModelComponent } from './components/ModelComponent'
import { SourceComponent } from './components/SourceComponent'
import { getModelSceneID } from './functions/loaders/ModelFunctions'

export const GLTFSourceState = defineState({
  name: 'GLTFState',
  initial: {} as Record<
    string,
    {
      entity: Entity
    }
  >,

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
    getMutableState(GLTFSourceState)[source].set({ entity })
    return entity
  },

  unload: (source: string, entity: Entity) => {
    removeEntity(entity)
  }
})

export const GLTFDocumentState = defineState({
  name: 'GLTFDocumentState',
  initial: {} as Record<string, GLTF.IGLTF>
})

export class GLTFSnapshotAction {
  static createSnapshot = defineAction({
    type: 'ee.gltf.snapshot.CREATE_SNAPSHOT' as const,
    source: matches.string as Validator<unknown, string>,
    data: matches.object as Validator<unknown, GLTF.IGLTF>
  })

  static undo = defineAction({
    type: 'ee.gltf.snapshot.UNDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static redo = defineAction({
    type: 'ee.gltf.snapshot.REDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static clearHistory = defineAction({
    type: 'ee.gltf.snapshot.CLEAR_HISTORY' as const,
    source: matches.string as Validator<unknown, string>
  })
}

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

  cloneCurrentSnapshot: (source: string) => {
    const state = getState(GLTFSnapshotState)[source]
    return JSON.parse(JSON.stringify({ source, data: state.snapshots[state.index] })) as {
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
    getMutableState(GLTFDocumentState)[props.source].set(gltfState.snapshots[gltfState.index.value].get(NO_PROXY))
  }, [gltfState.index])

  return null
}
