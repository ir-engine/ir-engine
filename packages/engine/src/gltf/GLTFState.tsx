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

import config from '@etherealengine/common/src/config'
import { assetPath } from '@etherealengine/common/src/schema.type.module'
import {
  ComponentJSONIDMap,
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  getComponent,
  getMutableComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent
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
import { useGet } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import React, { useEffect, useLayoutEffect } from 'react'
import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFModifiedState, GLTFNodeState, GLTFSnapshotAction } from './GLTFDocumentState'

export const GLTFAssetState = defineState({
  name: 'ee.engine.gltf.GLTFAssetState',
  initial: {} as Record<string, Entity>, // sceneID => entity

  useScene: (sceneID: string | undefined) => {
    const scene = useGet(assetPath, sceneID).data
    const scenes = useHookstate(getMutableState(GLTFAssetState))
    const assetURL = scene?.assetURL
    return assetURL ? scenes[assetURL].value : null
  },

  loadScene: (sceneURL: string, uuid: string) => {
    const source = fileServer + '/' + sceneURL
    const gltfEntity = GLTFSourceState.load(source, uuid as EntityUUID)
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }
})

const fileServer = config.client.fileServer

export const GLTFSourceState = defineState({
  name: 'ee.engine.gltf.GLTFSourceState',
  initial: {} as Record<string, Entity>,

  /**
   * @param source The asset URL for the GLTF file
   * @param uuid Identitifies this GLTF uniquely, either as a location instance or loaded as an asset referenced in another GLTF file
   * @param parentEntity The parent entity to attach the GLTF to
   * @returns
   */
  load: (source: string, uuid = MathUtils.generateUUID() as EntityUUID, parentEntity = UndefinedEntity) => {
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

const updateGLTFStates = (source: string, data: GLTF.IGLTF) => {
  // update the document state
  getMutableState(GLTFDocumentState)[source].set(data)

  // update the nodes dictionary
  const nodesDictionary = GLTFNodeState.convertGltfToNodeDictionary(data)
  getMutableState(GLTFNodeState)[source].set(nodesDictionary)
}

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
      // update the snapshot state
      const { data } = action
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (!state.value) {
        state.set({ index: 0, snapshots: [data] })
        updateGLTFStates(action.source, data)
        return
      }
      state.index.set(state.index.value + 1)
      state.snapshots.set([...state.snapshots.get(NO_PROXY).slice(0, state.index.value + 1), data])
      updateGLTFStates(action.source, data)
    }),

    onUndo: GLTFSnapshotAction.undo.receive((action) => {
      // update the snapshot state
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value <= 0) return
      state.index.set(Math.max(state.index.value - action.count, 0))
      const snapshotData = getState(GLTFSnapshotState)[action.source].snapshots[state.index.value]
      updateGLTFStates(action.source, snapshotData)
    }),

    onRedo: GLTFSnapshotAction.redo.receive((action) => {
      // update the snapshot state
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value >= state.snapshots.value.length - 1) return
      state.index.set(Math.min(state.index.value + action.count, state.snapshots.value.length - 1))
      const snapshotData = getState(GLTFSnapshotState)[action.source].snapshots[state.index.value]
      updateGLTFStates(action.source, snapshotData)
    }),

    onClearHistory: GLTFSnapshotAction.clearHistory.receive((action) => {
      // update the snapshot state
      const state = getState(GLTFSnapshotState)[action.source]
      const data = state.snapshots[0]
      getMutableState(GLTFSnapshotState)[action.source].set({
        index: 0,
        snapshots: [data]
      })
      updateGLTFStates(action.source, data)
    }),

    onUnload: GLTFSnapshotAction.unload.receive((action) => {
      getMutableState(GLTFSnapshotState)[action.source].set(none)
      getMutableState(GLTFDocumentState)[action.source].set(none)
      getMutableState(GLTFNodeState)[action.source].set(none)
    })
  },

  reactor: () => {
    const state = useHookstate(getMutableState(GLTFSnapshotState))
    return (
      <>
        {state.keys.map((source: string) => (
          <ChildGLTFReactor key={source} source={source} />
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

const ChildGLTFReactor = (props: { source: string }) => {
  const source = props.source

  const entity = useHookstate(getMutableState(GLTFSourceState)[source]).value
  const parentUUID = useComponent(entity, UUIDComponent).value

  const index = useHookstate(getMutableState(GLTFSnapshotState)[props.source].index).value

  useLayoutEffect(() => {
    if (index > 0) getMutableState(GLTFModifiedState)[props.source].set(true)
  }, [index])

  const gltfDocumentState = useHookstate(getMutableState(GLTFDocumentState)[source])

  if (!gltfDocumentState.value) return null

  return <DocumentReactor documentID={source} parentUUID={parentUUID} />
}

export const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const nodeState = useHookstate(getMutableState(GLTFNodeState)[props.documentID])
  if (!nodeState.value) return null
  return (
    <>
      {Object.entries(nodeState.get(NO_PROXY)).map(([uuid, { nodeIndex, childIndex, parentUUID }]) => (
        <ParentNodeReactor
          key={uuid}
          childIndex={childIndex}
          nodeIndex={nodeIndex}
          parentUUID={parentUUID ?? props.parentUUID}
          documentID={props.documentID}
        />
      ))}
    </>
  )
}

const ParentNodeReactor = (props: {
  nodeIndex: number
  childIndex: number
  parentUUID: EntityUUID
  documentID: string
}) => {
  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)
  if (!parentEntity) return null

  return <NodeReactor {...props} />
}

const NodeReactor = (props: { nodeIndex: number; childIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes! as State<GLTF.INode[]>

  const node = nodes[props.nodeIndex]!

  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)

  const entity = useHookstate(() => {
    const uuid = node.extensions.value?.[UUIDComponent.jsonID] as EntityUUID
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, SourceComponent, props.documentID)

    /** Ensure all base components are added for synchronous mount */
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
    setComponent(entity, TransformComponent)

    if (node.matrix.value) {
      const mat4 = new Matrix4().fromArray(node.matrix.value)
      const position = new Vector3()
      const rotation = new Quaternion()
      const scale = new Vector3()
      mat4.decompose(position, rotation, scale)
      setComponent(entity, TransformComponent, { position, rotation, scale })
    }

    // add all extensions for synchronous mount
    if (node.extensions.value) {
      for (const extension in node.extensions.value) {
        const Component = ComponentJSONIDMap.get(extension)
        if (!Component) continue
        setComponent(entity, Component, node.extensions[extension].get(NO_PROXY_STEALTH))
      }
    }

    return entity
  }).value

  useEffect(() => {
    return () => {
      removeEntity(entity)
    }
  }, [])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
  }, [entity, parentEntity, props.childIndex])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
  }, [entity, node.name])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, TransformComponent)
    if (!node.matrix.value) return

    const mat4 = new Matrix4().fromArray(node.matrix.value)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()
    mat4.decompose(position, rotation, scale)
    setComponent(entity, TransformComponent, { position, rotation, scale })
  }, [entity, node.matrix.value])

  if (!entity) return null

  return (
    <>
      {/* {node.mesh.value && (
        <MeshReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )} */}
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
    if (!Component) return
    return () => {
      removeComponent(props.entity, Component)
    }
  }, [])

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
