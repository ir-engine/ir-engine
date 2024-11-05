/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { GLTF } from '@gltf-transform/core'
import React, { useEffect, useLayoutEffect } from 'react'
import { Group, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import {
  ComponentJSONIDMap,
  createEntity,
  Entity,
  entityExists,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  NO_PROXY,
  NO_PROXY_STEALTH,
  none,
  State,
  Topic,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SourceComponent } from '../scene/components/SourceComponent'
import { proxifyParentChildRelationships } from '../scene/functions/loadGLTFModel'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFModifiedState, GLTFNodeState, GLTFSnapshotAction } from './GLTFDocumentState'

export const GLTFAssetState = defineState({
  name: 'ee.engine.gltf.GLTFAssetState',
  initial: {} as Record<string, Entity>, // sceneID => entity

  loadScene: (sceneURL: string, uuid: string) => {
    const gltfEntity = GLTFSourceState.load(sceneURL, uuid as EntityUUID, getState(EngineState).originEntity)
    getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    setComponent(gltfEntity, SceneComponent)

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(GLTFAssetState)[sceneURL].set(gltfEntity)
    }
  }
})

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
    const obj3d = new Group()
    setComponent(entity, Object3DComponent, obj3d)
    addObjectToGroup(entity, obj3d)
    proxifyParentChildRelationships(obj3d)
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
      // update the snapshot state
      const { data } = action
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (!state.value) {
        state.set({ index: 0, snapshots: [data] })
        return
      }
      state.index.set(state.index.value + 1)
      const snapshots = getState(GLTFSnapshotState)[action.source].snapshots
      // override whatever snapshots have been undone
      state.snapshots.set([...snapshots.splice(0, state.index.value), data])
    }),

    onUndo: GLTFSnapshotAction.undo.receive((action) => {
      // update the snapshot state
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value <= 0) return
      state.index.set(Math.max(state.index.value - action.count, 0))
    }),

    onRedo: GLTFSnapshotAction.redo.receive((action) => {
      // update the snapshot state
      const state = getMutableState(GLTFSnapshotState)[action.source]
      if (state.index.value >= state.snapshots.value.length - 1) return
      state.index.set(Math.min(state.index.value + action.count, state.snapshots.value.length - 1))
    }),

    onClearHistory: GLTFSnapshotAction.clearHistory.receive((action) => {
      // update the snapshot state
      const state = getState(GLTFSnapshotState)[action.source]
      const data = state.snapshots[0]
      getMutableState(GLTFSnapshotState)[action.source].set({
        index: 0,
        snapshots: [data]
      })
    }),

    onUnload: GLTFSnapshotAction.unload.receive((action) => {
      getMutableState(GLTFSnapshotState)[action.source].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(GLTFSnapshotState)
    return (
      <>
        {state.keys.map((source: string) => (
          <ChildGLTFReactor key={source} source={source} />
        ))}
      </>
    )
  },

  useSnapshotIndex(source: string): State<number> | undefined {
    return useMutableState(GLTFSnapshotState)[source]?.index
  },

  isInSnapshot: (source: string | undefined, entity: Entity): boolean => {
    const uuid = getOptionalComponent(entity, UUIDComponent)
    if (!source || !uuid) return false

    const gltf = getState(GLTFSnapshotState)[source]
    if (!gltf) return false

    const snapshot = gltf.snapshots[gltf.index]
    if (!snapshot.nodes) return false

    for (const node of snapshot.nodes) {
      const nodeUUID = node.extensions?.[UUIDComponent.jsonID]
      if (nodeUUID === uuid) return true
    }

    return false
  },

  findTopLevelParent: (entity: Entity): Entity => {
    const source = getOptionalComponent(entity, SourceComponent)
    const uuid = getOptionalComponent(entity, UUIDComponent)
    if (!source || !uuid) return UndefinedEntity

    const gltf = getState(GLTFSnapshotState)[source]
    if (!gltf) return UndefinedEntity

    const snapshot = gltf.snapshots[gltf.index]
    if (!snapshot.nodes) return UndefinedEntity

    let parentUUID: EntityUUID | undefined = uuid
    let currentUUID: EntityUUID = uuid

    const findParent = (uuid: EntityUUID): EntityUUID | undefined => {
      for (let i = 0; i < snapshot.nodes!.length; i++) {
        const node = snapshot.nodes![i]
        if (node.children && node.children.length) {
          for (const child of node.children) {
            const childNode = snapshot.nodes![child]
            const childUUID = childNode.extensions?.[UUIDComponent.jsonID]
            if (childUUID === uuid) {
              return node.extensions?.[UUIDComponent.jsonID] as EntityUUID
            }
          }
        }
      }

      return undefined
    }

    while ((parentUUID = findParent(parentUUID)) && parentUUID) {
      currentUUID = parentUUID
    }

    return UUIDComponent.getEntityByUUID(currentUUID)
  },

  cloneCurrentSnapshot: (source: string) => {
    const state = getState(GLTFSnapshotState)[source]
    return structuredClone({ source, data: state.snapshots[state.index] }) as {
      data: GLTF.IGLTF
      source: string
    }
  },

  injectSnapshot: (srcNode: EntityUUID, srcSnapshotID: string, dstNode: EntityUUID, dstSnapshotID: string) => {
    const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(srcSnapshotID)
    const parentSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(dstSnapshotID)
    //create new node list with the model entity removed
    //remove model entity from scene nodes
    const srcEntity = UUIDComponent.getEntityByUUID(srcNode)
    const srcTransform = getComponent(srcEntity, TransformComponent)
    const childEntities = getComponent(srcEntity, EntityTreeComponent).children
    for (const child of childEntities) {
      const transform = getComponent(child, TransformComponent)
      //apply the model's transform to the children, such that it has the same world transform after the model is removed
      //combine position
      const position = new Vector3().copy(transform.position)
      position.applyQuaternion(srcTransform.rotation)
      position.add(srcTransform.position)
      //combine rotation
      const rotation = new Quaternion().copy(srcTransform.rotation)
      rotation.multiply(transform.rotation)
      //combine scale
      const scale = new Vector3().copy(transform.scale)
      scale.multiply(srcTransform.scale)
      //set new transform on the node in the new snapshot
      const childNode = snapshot.data.nodes?.find(
        (node) => node.extensions?.[UUIDComponent.jsonID] === getComponent(child, UUIDComponent)
      )
      if (!childNode) continue
      childNode.matrix = new Matrix4().compose(position, rotation, scale).toArray()
    }
    const modelIndex = parentSnapshot.data.nodes?.findIndex(
      (node) => node.extensions?.[UUIDComponent.jsonID] === srcNode
    )
    parentSnapshot.data.scenes![0].nodes = parentSnapshot.data.scenes![0].nodes.filter((node) => node !== modelIndex)
    const newNodes = parentSnapshot.data.nodes?.filter((node) => node.extensions?.[UUIDComponent.jsonID] !== srcNode)
    //recalculate child indices
    if (!newNodes) return
    for (const node of newNodes) {
      if (!node.children) continue
      const newChildren: number[] = []
      for (const child of node.children) {
        const childNode = parentSnapshot.data.nodes?.[child]
        const childUUID = childNode?.extensions?.[UUIDComponent.jsonID]
        if (!childUUID) continue
        const childIndex = newNodes.findIndex((node) => node.extensions?.[UUIDComponent.jsonID] === childUUID)
        if (childIndex === -1) continue
        newChildren.push(childIndex)
      }
      node.children = newChildren
    }
    parentSnapshot.data.nodes = newNodes

    const rootIndices = snapshot.data.scenes![0].nodes!
    const roots = rootIndices.map((index) => snapshot.data.nodes?.[index])
    parentSnapshot.data.nodes = [...parentSnapshot.data.nodes!, ...snapshot.data.nodes!]
    const childIndices = roots.map((root) => parentSnapshot.data.nodes!.findIndex((node) => node === root)!)
    const parentNode = parentSnapshot.data.nodes?.find((node) => node.extensions?.[UUIDComponent.jsonID] === dstNode)
    //if the parent is not the root of the gltf document, add the child indices to the parent's children
    if (parentNode) {
      parentNode.children = [...(parentNode.children ?? []), ...childIndices]
    } else {
      //otherwise, add the child indices to the scene's nodes as roots
      parentSnapshot.data.scenes![0].nodes.push(...childIndices)
    }

    //recalculate child indices of newly added nodes
    for (const node of parentSnapshot.data.nodes!) {
      if (!node.children) continue
      //only operate on nodes that are being injected
      if (!snapshot.data.nodes!.includes(node)) continue

      const newChildren: number[] = []
      for (const child of node.children) {
        const childNode = snapshot.data.nodes?.[child]
        const childUUID = childNode?.extensions?.[UUIDComponent.jsonID]
        if (!childUUID) continue
        const newChildIndex = parentSnapshot.data.nodes!.findIndex(
          (node) => node.extensions?.[UUIDComponent.jsonID] === childUUID
        )
        if (newChildIndex === -1) continue
        newChildren.push(newChildIndex)
      }
      node.children = newChildren
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot({ source: dstSnapshotID, data: parentSnapshot.data }))
    dispatchAction(GLTFSnapshotAction.unload({ source: srcSnapshotID }))
  }
})

export const EditorTopic = 'editor' as Topic

const ChildGLTFReactor = (props: { source: string }) => {
  const source = props.source

  const index = useHookstate(getMutableState(GLTFSnapshotState)[source].index).value

  useLayoutEffect(() => {
    return () => {
      getMutableState(GLTFDocumentState)[source].set(none)
      getMutableState(GLTFNodeState)[source].set(none)
    }
  }, [])

  useLayoutEffect(() => {
    // update the modified state
    if (index > 0) getMutableState(GLTFModifiedState)[source].set(true)

    // update the document state
    const data = getState(GLTFSnapshotState)[source].snapshots[index]
    getMutableState(GLTFDocumentState)[source].set(data)

    // update the nodes dictionary
    const nodesDictionary = GLTFNodeState.convertGltfToNodeDictionary(data)
    getMutableState(GLTFNodeState)[source].set(nodesDictionary)
  }, [index])

  const entity = useHookstate(getMutableState(GLTFSourceState)[source]).value
  const parentUUID = useOptionalComponent(entity, UUIDComponent)?.value
  if (!entity || !parentUUID) return null

  return <DocumentReactor documentID={source} parentUUID={parentUUID} />
}

export const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const nodeState = useHookstate(getMutableState(GLTFNodeState)[props.documentID])
  if (!nodeState.value) return null
  return (
    <>
      {Object.entries(nodeState.get(NO_PROXY)).map(([uuid, { nodeIndex, childIndex, parentUUID }]) => (
        <NodeReactor
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

const NodeReactor = (props: { nodeIndex: number; childIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes! // as State<GLTF.INode[]>

  const node = nodes[props.nodeIndex]! as State<GLTF.INode>

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

    if (!hasComponent(entity, Object3DComponent) && !hasComponent(entity, MeshComponent)) {
      const obj3d = new Group()
      obj3d.entity = entity
      addObjectToGroup(entity, obj3d)
      proxifyParentChildRelationships(obj3d)
      setComponent(entity, Object3DComponent, obj3d)
    }

    return entity
  }).value

  useEffect(() => {
    return () => {
      //check if entity is in some other document
      if (hasComponent(entity, UUIDComponent)) {
        const uuid = getComponent(entity, UUIDComponent)
        const documents = getState(GLTFDocumentState)
        for (const documentID in documents) {
          const document = documents[documentID]
          if (!document?.nodes) continue
          for (const node of document.nodes) {
            if (node.extensions?.[UUIDComponent.jsonID] === uuid) return
          }
        }
      }
      removeEntity(entity)
    }
  }, [])

  useLayoutEffect(() => {
    if (!entity || !entityExists(entity)) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
  }, [entity, parentEntity, props.childIndex])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
  }, [entity, node.name])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, TransformComponent)
    if (!node.matrix.value) return

    const mat4 = new Matrix4().fromArray(node.matrix.value)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()
    mat4.decompose(position, rotation, scale)
    setComponent(entity, TransformComponent, { position, rotation, scale })
  }, [entity, node.matrix])

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
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes! // as State<GLTF.INode[]>
  const node = nodes[props.nodeIndex]!
  const extension = node.extensions![props.extension]

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.extension)
    if (!Component) return
    return () => {
      //check if entity is in some other document and has the component
      const uuid = getOptionalComponent(props.entity, UUIDComponent)
      const documents = getState(GLTFDocumentState)
      for (const documentID in documents) {
        const document = documents[documentID]
        if (!document?.nodes) continue
        for (const node of document.nodes) {
          if (node.extensions?.[UUIDComponent.jsonID] === uuid) {
            if (node.extensions?.[props.extension]) return
          }
        }
      }
      removeComponent(props.entity, Component)
    }
  }, [])

  useLayoutEffect(() => {
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
