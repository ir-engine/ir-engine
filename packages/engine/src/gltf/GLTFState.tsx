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

import { GLTF } from '@gltf-transform/core'
import React, { useEffect, useLayoutEffect } from 'react'
import { Group, Matrix4, Quaternion, Vector3 } from 'three'

import config from '@etherealengine/common/src/config'
import { assetPath } from '@etherealengine/common/src/schema.type.module'
import {
  ComponentJSONIDMap,
  createEntity,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@etherealengine/ecs'
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
} from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { useGet } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { NodeID, NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import { SourceComponent, SourceID } from '@etherealengine/spatial/src/transform/components/SourceComponent'
import { ModelComponent } from '../scene/components/ModelComponent'
import { getModelSceneID } from '../scene/functions/loaders/ModelFunctions'
import { proxifyParentChildRelationships } from '../scene/functions/loadGLTFModel'
import { GLTFCallbackState } from './GLTFCallbackState'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFModifiedState, GLTFNodeState, GLTFSnapshotAction } from './GLTFDocumentState'

export const GLTFAssetState = defineState({
  name: 'ee.engine.gltf.GLTFAssetState',
  initial: {} as Record<string, Entity>, // sceneID => entity

  useScene: (sceneID: string | undefined) => {
    const scene = useGet(assetPath, sceneID).data
    const scenes = useMutableState(GLTFAssetState)
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
   * @param src The asset URL for the GLTF file
   * @param uuid Identitifies this GLTF uniquely, either as a location instance or loaded as an asset referenced in another GLTF file
   * @param parentEntity The parent entity to attach the GLTF to
   * @returns
   */
  load: (src: string, uuid = src as EntityUUID, parentEntity = UndefinedEntity) => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, NameComponent, src.split('/').pop()!)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, NodeIDComponent, src as any as NodeID)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    const sourceID = `${getComponent(entity, UUIDComponent)}-${src}` as SourceID
    setComponent(entity, SourceComponent, sourceID)
    setComponent(entity, GLTFComponent, { src: src })
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
        <DocumentReactor />
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
  },

  copyNodesFromFile: (filePath: string, targetEntityUUID: EntityUUID) => {
    GLTFCallbackState.add(filePath, (entity: Entity) => {
      GLTFSnapshotState.moveChildrenToParent(entity, targetEntityUUID)
    })
  },

  moveChildrenToParent: (entity: Entity, targetEntityUUID: EntityUUID) => {
    const sourceEntityUUID = getComponent(entity, UUIDComponent)
    const sourceID = hasComponent(entity, ModelComponent)
      ? getModelSceneID(entity)
      : getComponent(entity, SourceComponent)
    const targetEntity = UUIDComponent.getEntityByUUID(targetEntityUUID)
    const destinationEntityUUID = getComponent(targetEntity, UUIDComponent)
    const destinationSourceID = getComponent(targetEntity, SourceComponent)
    GLTFSnapshotState.copyNodes(sourceEntityUUID, sourceID, destinationEntityUUID, destinationSourceID)
    dispatchAction(GLTFSnapshotAction.unload({ source: sourceID }))
  },

  copyNodes: (
    sourceEntityUUID: EntityUUID,
    sourceID: SourceID,
    destinationEntityUUID: EntityUUID,
    destinationSourceID: SourceID
  ) => {
    if (!getState(GLTFSnapshotState)[sourceID]) return console.warn('sourceID not found in snapshot state')
    if (!getState(GLTFSnapshotState)[destinationSourceID])
      return console.warn('destinationSourceID not found in snapshot state')

    const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(sourceID)
    const parentSnapshot = GLTFSnapshotState.cloneCurrentSnapshot(destinationSourceID)
    //create new node list with the model entity removed
    //remove model entity from scene nodes
    const srcEntity = UUIDComponent.getEntityByUUID(sourceEntityUUID)
    const srcNodeID = getComponent(srcEntity, NodeIDComponent)
    const srcTransform = getOptionalComponent(srcEntity, TransformComponent)
    if (srcTransform) {
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
          (node) => node.extensions?.[NodeIDComponent.jsonID] === getComponent(child, NodeIDComponent)
        )
        if (!childNode) continue
        childNode.matrix = new Matrix4().compose(position, rotation, scale).toArray()
      }
    }
    // Get index of current parent node
    const modelIndex = parentSnapshot.data.nodes?.findIndex(
      (node) => node.extensions?.[NodeIDComponent.jsonID] === srcNodeID
    )
    // Remove model entity from parent scene
    parentSnapshot.data.scenes![0].nodes = parentSnapshot.data.scenes![0].nodes.filter((node) => node !== modelIndex)
    const newNodes = parentSnapshot.data.nodes?.filter(
      (node) => node.extensions?.[NodeIDComponent.jsonID] !== srcNodeID
    )
    // recalculate child indices
    if (!newNodes) return
    for (const node of newNodes) {
      if (!node.children) continue
      const newChildren: number[] = []
      for (const child of node.children) {
        const childNode = parentSnapshot.data.nodes?.[child]
        const childUUID = childNode?.extensions?.[NodeIDComponent.jsonID]
        if (!childUUID) continue
        const childIndex = newNodes.findIndex((node) => node.extensions?.[NodeIDComponent.jsonID] === childUUID)
        if (childIndex === -1) continue
        newChildren.push(childIndex)
      }
      node.children = newChildren
    }
    parentSnapshot.data.nodes = newNodes

    // Get get the destination node
    const dstEntity = UUIDComponent.getEntityByUUID(destinationEntityUUID)
    const dstNodeID = getComponent(dstEntity, NodeIDComponent)

    // Add the nodes to the new parent node
    const rootIndices = snapshot.data.scenes![0].nodes!
    const roots = rootIndices.map((index) => snapshot.data.nodes?.[index])
    parentSnapshot.data.nodes = [...parentSnapshot.data.nodes!, ...snapshot.data.nodes!]
    const childIndices = roots.map((root) => parentSnapshot.data.nodes!.findIndex((node) => node === root)!)
    const parentNode = parentSnapshot.data.nodes?.find(
      (node) => node.extensions?.[NodeIDComponent.jsonID] === dstNodeID
    )
    // If the parent is not the root of the gltf document, add the child indices to the parent's children
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
        const childUUID = childNode?.extensions?.[NodeIDComponent.jsonID]
        if (!childUUID) continue
        const newChildIndex = parentSnapshot.data.nodes!.findIndex(
          (node) => node.extensions?.[NodeIDComponent.jsonID] === childUUID
        )
        if (newChildIndex === -1) continue
        newChildren.push(newChildIndex)
      }
      node.children = newChildren
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot({ source: destinationSourceID, data: parentSnapshot.data }))
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

    const entity = getState(GLTFSourceState)[source]
    const parentUUID = getComponent(entity, UUIDComponent)

    // update the nodes dictionary
    const nodesDictionary = GLTFNodeState.convertGltfToNodeDictionary(parentUUID, data)
    getMutableState(GLTFNodeState)[source].set(nodesDictionary)
  }, [index])

  return null
}

export const DocumentReactor = () => {
  const nodeState = useHookstate(getMutableState(GLTFNodeState))
  const scenes = Object.entries(nodeState.get(NO_PROXY)) as [
    SourceID,
    Record<string, { nodeIndex: number; childIndex: number; parentUUID: EntityUUID }>
  ][]
  const nodes = scenes
    .map(([source, nodes]) => {
      const entries = Object.entries(nodes)
      return entries.map(([uuid, { nodeIndex, childIndex, parentUUID }]) => ({
        uuid,
        source,
        nodeIndex,
        childIndex,
        parentUUID
      }))
    })
    .flat()
  return (
    <>
      {nodes.map((node) => (
        <ParentNodeReactor
          key={node.uuid}
          childIndex={node.childIndex}
          nodeIndex={node.nodeIndex}
          parentUUID={node.parentUUID}
          documentID={node.source}
        />
      ))}
    </>
  )
}

const ParentNodeReactor = (props: {
  nodeIndex: number
  childIndex: number
  parentUUID: EntityUUID
  documentID: SourceID
}) => {
  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)
  if (!parentEntity) return null

  return <NodeReactor {...props} />
}

const NodeReactor = (props: {
  nodeIndex: number
  childIndex: number
  parentUUID: EntityUUID
  documentID: SourceID
}) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes! // as State<GLTF.INode[]>

  const node = nodes[props.nodeIndex]! as State<GLTF.INode>

  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)

  const entity = useHookstate(() => {
    const nodeID = node.extensions.value?.[NodeIDComponent.jsonID] as NodeID
    const rootEntity = getState(GLTFSourceState)[props.documentID]
    const rootEntityUUID = getComponent(rootEntity, UUIDComponent)
    const uuid = `${rootEntityUUID}-${nodeID}` as EntityUUID
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)
    setComponent(entity, NodeIDComponent, nodeID)

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
      removeEntity(entity)
    }
  }, [])

  useLayoutEffect(() => {
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
  }, [entity, parentEntity, props.childIndex])

  useLayoutEffect(() => {
    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
  }, [entity, node.name])

  useLayoutEffect(() => {
    setComponent(entity, TransformComponent)
    if (!node.matrix.value) return

    const mat4 = new Matrix4().fromArray(node.matrix.value)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()
    mat4.decompose(position, rotation, scale)
    setComponent(entity, TransformComponent, { position, rotation, scale })
  }, [entity, node.matrix])

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
