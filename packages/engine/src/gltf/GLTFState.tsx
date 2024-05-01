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
  ComponentJSONIDMap,
  Entity,
  EntityUUID,
  QueryReactor,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import {
  NO_PROXY,
  NO_PROXY_STEALTH,
  State,
  Topic,
  defineState,
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
import React, { useEffect, useLayoutEffect } from 'react'
import { Matrix4 } from 'three'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'

export const GLTFSourceState = defineState({
  name: 'ee.engine.gltf.GLTFSourceState',
  initial: {} as Record<string, Entity>,

  /**
   * @param source The asset URL for the GLTF file
   * @param uuid Identitifies this GLTF uniquely, either as a location instance or loaded as an asset referenced in another GLTF file
   * @param parentEntity The parent entity to attach the GLTF to
   * @returns
   */
  load: (source: string, uuid: EntityUUID, parentEntity = UndefinedEntity) => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, NameComponent, source.split('/').pop()!)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    const sourceID = `${getComponent(entity, UUIDComponent)}-${source}`
    setComponent(entity, SourceComponent, sourceID)
    setComponent(entity, GLTFComponent, { src: source })
    getMutableState(GLTFSourceState)[sourceID].set(entity)
    return entity
  },

  unload: (entity: Entity) => {
    const sourceID = `${getComponent(entity, UUIDComponent)}-${getComponent(entity, GLTFComponent).src}`
    getMutableState(GLTFSourceState)[sourceID].set(none)
    removeEntity(entity)
  }
})

export const GLTFSnapshotState = defineState({
  name: 'ee.engine.gltf.GLTFSnapshotState',
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
    const snapshotData = gltfState.snapshots[gltfState.index.value].get(NO_PROXY)
    getMutableState(GLTFDocumentState)[props.source].set(snapshotData)
  }, [gltfState.index.value])

  return <QueryReactor Components={[GLTFComponent]} ChildEntityReactor={ChildGLTFReactor} />
}

const ChildGLTFReactor = () => {
  const entity = useEntityContext()

  const source = useComponent(entity, SourceComponent).value
  const gltfDocumentState = useHookstate(getMutableState(GLTFDocumentState)[source])

  const parentUUID = useComponent(entity, UUIDComponent).value

  if (!gltfDocumentState.value) return null

  return <DocumentReactor documentID={source} parentUUID={parentUUID} />
}

export const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  if (!documentState.scenes.value) return null

  const nodes = documentState.scenes![documentState.scene.value!].nodes as State<number[]>

  const document = documentState.get(NO_PROXY)

  return (
    <>
      {nodes.get(NO_PROXY).map((nodeIndex, childIndex) => (
        <NodeReactor
          key={(document.nodes![nodeIndex].extensions![UUIDComponent.jsonID] as EntityUUID) ?? nodeIndex}
          childIndex={childIndex}
          nodeIndex={nodeIndex}
          parentUUID={props.parentUUID}
          documentID={props.documentID}
        />
      ))}
    </>
  )
}

const NodeReactor = (props: { nodeIndex: number; childIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes! as State<GLTF.INode[]>

  const node = nodes[props.nodeIndex]!

  const selfEntity = useHookstate(UndefinedEntity)
  const entity = selfEntity.value

  const parentEntity = UUIDComponent.getEntityByUUID(props.parentUUID)

  useEffect(() => {
    if (!parentEntity) return

    const uuid = (node.extensions.value?.[UUIDComponent.jsonID] as EntityUUID) ?? UUIDComponent.generateUUID()
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    selfEntity.set(entity)
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, SourceComponent, props.documentID)

    // add all extensions for synchronous mount
    if (node.extensions.value) {
      for (const extension in node.extensions.value) {
        const Component = ComponentJSONIDMap.get(extension)
        if (!Component) continue
        setComponent(entity, Component, node.extensions[extension].get(NO_PROXY_STEALTH))
      }
    }

    return () => {
      removeEntity(entity)
    }
  }, [parentEntity])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
  }, [entity, parentEntity])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
  }, [entity, node.name])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, TransformComponent)
    if (!node.matrix.value) return

    const mat4 = new Matrix4().fromArray(node.matrix.value)
    const transform = getComponent(entity, TransformComponent)
    mat4.decompose(transform.position, transform.rotation, transform.scale)
  }, [entity, node.matrix.value])

  if (!entity) return null

  const uuid = getComponent(entity, UUIDComponent)

  return (
    <>
      {/* {node.mesh.value && (
        <MeshReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )} */}
      {node.children.value?.map((nodeIndex, childIndex) => (
        <NodeReactor
          key={nodeIndex}
          nodeIndex={nodeIndex}
          childIndex={childIndex}
          parentUUID={uuid}
          documentID={props.documentID}
        />
      ))}
      {node.extensions.value &&
        Object.keys(node.extensions.get(NO_PROXY)!).map((extension) => (
          <ExtensionReactor
            key={extension}
            entity={entity}
            extension={extension}
            nodeIndex={props.nodeIndex}
            documentID={props.documentID}
          />
        ))}
    </>
  )
}

const ExtensionReactor = (props: { entity: Entity; extension: string; nodeIndex: number; documentID: string }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes! as State<GLTF.INode[]>
  const node = nodes[props.nodeIndex]!

  const extension = node.extensions![props.extension]

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.extension)
    if (!Component) return console.warn('no component found for extension', props.extension)
    setComponent(props.entity, Component, extension.get(NO_PROXY_STEALTH))
  }, [extension])

  return null
}

// const MeshReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
//   const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
//   const nodes = documentState.nodes! as State<GLTF.INode[]>
//   const node = nodes[props.nodeIndex]!

//   const mesh = documentState.meshes![node.mesh.value!] as State<GLTF.IMesh>

//   return (
//     <>
//       {mesh.primitives.value.map((primitive, index) => (
//         <PrimitiveReactor
//           key={index}
//           primitiveIndex={index}
//           nodeIndex={props.nodeIndex}
//           documentID={props.documentID}
//           entity={props.entity}
//         />
//       ))}
//     </>
//   )
// }

// const PrimitiveReactor = (props: { primitiveIndex: number; nodeIndex: number; documentID: string; entity: Entity }) => {
//   const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
//   const nodes = documentState.nodes! as State<GLTF.INode[]>
//   const node = nodes[props.nodeIndex]!

//   const primitive = documentState.meshes![node.mesh.value!].primitives[props.primitiveIndex]

//   useEffect(() => {
//     /** TODO implement all mesh types */
//   }, [primitive])

//   return null
// }

/**
 * TODO figure out how to support extensions that change the behaviour of these reactors
 * - we pretty much have to add a new API for each dependency type, like how the GLTFLoader does
 */
