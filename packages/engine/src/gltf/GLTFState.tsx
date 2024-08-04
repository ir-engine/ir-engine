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
import {
  BufferGeometry,
  ColorManagement,
  Group,
  LinearSRGBColorSpace,
  LoaderUtils,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3
} from 'three'

import { staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import {
  ComponentJSONIDMap,
  createEntity,
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
  useComponent,
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
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  getAncestorWithComponent
} from '@etherealengine/spatial/src/transform/components/EntityTree'

import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { MaterialInstanceComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { ATTRIBUTES } from '../assets/loaders/gltf/GLTFConstants'
import { EXTENSIONS } from '../assets/loaders/gltf/GLTFExtensions'
import { assignExtrasToUserData } from '../assets/loaders/gltf/GLTFLoaderFunctions'
import { GLTFParserOptions } from '../assets/loaders/gltf/GLTFParser'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { SourceComponent } from '../scene/components/SourceComponent'
import { proxifyParentChildRelationships } from '../scene/functions/loadGLTFModel'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFModifiedState, GLTFNodeState, GLTFSnapshotAction } from './GLTFDocumentState'
import { KHR_DRACO_MESH_COMPRESSION } from './GLTFExtensions'
import { GLTFLoaderFunctions } from './GLTFLoaderFunctions'
import { MaterialDefinitionComponent } from './MaterialDefinitionComponent'
import './MeshExtensionComponents'

export const GLTFAssetState = defineState({
  name: 'ee.engine.gltf.GLTFAssetState',
  initial: {} as Record<string, Entity>, // sceneID => entity

  useScene: (sceneID: string | undefined) => {
    const scene = useGet(staticResourcePath, sceneID).data
    const scenes = useMutableState(GLTFAssetState)
    const sceneKey = scene?.url
    return sceneKey ? scenes[sceneKey].value : null
  },

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
    return JSON.parse(JSON.stringify({ source, data: state.snapshots[state.index] })) as {
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

  const entity = useHookstate(getMutableState(GLTFSourceState)[source]).value
  const parentUUID = useComponent(entity, UUIDComponent).value

  useLayoutEffect(() => {
    // update the modified state
    if (index > 0) getMutableState(GLTFModifiedState)[source].set(true)

    // update the document state
    const data = getState(GLTFSnapshotState)[source].snapshots[index]
    getMutableState(GLTFDocumentState)[source].set(data)

    // update the nodes dictionary
    const nodesDictionary = GLTFNodeState.convertGltfToNodeDictionary(data, source)
    getMutableState(GLTFNodeState)[source].set(nodesDictionary)
  }, [index])

  useLayoutEffect(() => {
    return () => {
      getMutableState(GLTFDocumentState)[source].set(none)
      getMutableState(GLTFNodeState)[source].set(none)
    }
  }, [])

  return <DocumentReactor documentID={source} parentUUID={parentUUID} />
}

export const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const nodeState = useHookstate(getMutableState(GLTFNodeState)[props.documentID])
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  if (!documentState.value || !nodeState.value) return null
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
      {documentState
        .get(NO_PROXY)
        .materials?.map((material, index) => (
          <MaterialEntityReactor
            key={'material-' + index}
            index={index}
            parentUUID={props.parentUUID}
            documentID={props.documentID}
          />
        ))}
    </>
  )
}

const MaterialEntityReactor = (props: { index: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const materials = documentState.materials!

  const materialDef = materials[props.index]!.get(NO_PROXY) as GLTF.IMaterial

  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)

  const entityState = useHookstate(UndefinedEntity)
  const entity = entityState.value

  useEffect(() => {
    const uuid = (props.documentID + '-material-' + props.index) as EntityUUID
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, SourceComponent, props.documentID)

    /** Ensure all base components are added for synchronous mount */
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.index })
    setComponent(entity, NameComponent, materialDef.name ?? 'Material-' + props.index)

    entityState.set(entity)

    return () => {
      //check if entity is in some other document
      if (hasComponent(entity, UUIDComponent)) {
        const uuid = getComponent(entity, UUIDComponent)
        const documents = getState(GLTFDocumentState)
        for (const documentID in documents) {
          const document = documents[documentID]
          if (!document?.materials) continue
          for (const material of document.materials) {
            if (material.extensions?.[UUIDComponent.jsonID] === uuid) return
          }
        }
      }
      removeEntity(entity)
    }
  }, [])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.index })
  }, [entity, parentEntity, props.index])

  useLayoutEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, materialDef.name ?? 'Material-' + props.index)
  }, [entity, materialDef.name])

  if (!entity) return null
  return (
    <>
      <MaterialStateReactor
        index={props.index}
        parentUUID={props.parentUUID}
        documentID={props.documentID}
        entity={entity}
      />
    </>
  )
}

const MaterialStateReactor = (props: { index: number; parentUUID: EntityUUID; documentID: string; entity: Entity }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const entity = props.entity

  const materialDefinition = documentState.materials![props.index]!.get(NO_PROXY) as GLTF.IMaterial

  useLayoutEffect(() => {
    if (!materialDefinition) return
    return () => {
      removeComponent(entity, MaterialDefinitionComponent)
    }
  }, [])

  useLayoutEffect(() => {
    if (!materialDefinition) return
    setComponent(entity, MaterialDefinitionComponent, materialDefinition)
  }, [materialDefinition])

  return (
    <>
      {materialDefinition.extensions &&
        Object.entries(materialDefinition.extensions).map(([id, ext]) => {
          return <MaterialStateExtensionReactor key={id} keyName={id} value={ext} entity={entity} />
        })}
    </>
  )
}

const MaterialStateExtensionReactor = (props: { keyName: string; value: any; entity: Entity }) => {
  const entity = props.entity

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.keyName)
    if (!Component) return console.warn('No component found for extension', props.keyName)
    return () => {
      removeComponent(entity, Component)
    }
  }, [])

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.keyName)
    if (!Component) return console.warn('No component found for extension', props.keyName)
    setComponent(entity, Component, props.value)
  }, [props.keyName, props.value])

  return null
}

const ParentNodeReactor = (props: {
  nodeIndex: number
  childIndex: number
  parentUUID: EntityUUID
  documentID: string
}) => {
  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)
  const physicsWorld = Physics.useWorld(parentEntity)
  if (!parentEntity || !physicsWorld) return null

  return <NodeReactor {...props} />
}

const NodeReactor = (props: { nodeIndex: number; childIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useMutableState(GLTFDocumentState)[props.documentID]
  const nodes = documentState.nodes!

  const node = nodes[props.nodeIndex]! as State<GLTF.INode>

  const parentEntity = UUIDComponent.useEntityByUUID(props.parentUUID)

  const entityState = useHookstate(UndefinedEntity)
  const entity = entityState.value

  useEffect(() => {
    const uuid =
      (node.extensions.value?.[UUIDComponent.jsonID] as EntityUUID) ??
      ((props.documentID + '-' + props.nodeIndex) as EntityUUID)
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

    /** Always set visible extension if this is not an ECS node */
    if (!node.extensions.value?.[UUIDComponent.jsonID]) setComponent(entity, VisibleComponent)

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

    entityState.set(entity)

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
    if (!entity) return

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

  useLayoutEffect(() => {
    if (!entity) return

    if (!node.translation.value) return
    const position = new Vector3().fromArray(node.translation.value)
    setComponent(entity, TransformComponent, { position })
  }, [entity, node.translation])

  useLayoutEffect(() => {
    if (!entity) return

    if (!node.rotation.value) return
    const rotation = new Quaternion().fromArray(node.rotation.value)
    setComponent(entity, TransformComponent, { rotation })
  }, [entity, node.rotation])

  useLayoutEffect(() => {
    if (!entity) return

    if (!node.scale.value) return
    const scale = new Vector3().fromArray(node.scale.value)
    setComponent(entity, TransformComponent, { scale })
  }, [entity, node.scale])

  if (!entity) return null

  return (
    <>
      {typeof node.mesh.get(NO_PROXY) === 'number' && (
        <MeshReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )}
      {typeof node.camera.get(NO_PROXY) === 'number' && (
        <CameraReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )}
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
  const nodes = documentState.nodes!.get(NO_PROXY)!
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
    setComponent(props.entity, Component, extension)
  }, [extension])

  return null
}

const MeshReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  useEffect(() => {
    setComponent(props.entity, VisibleComponent)
  }, [])

  return (
    <>
      {mesh.primitives.map((primitive, index) => (
        <PrimitiveReactor
          key={index}
          primitiveIndex={index}
          nodeIndex={props.nodeIndex}
          documentID={props.documentID}
          entity={props.entity}
        />
      ))}
    </>
  )
}

const CameraReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const camera = documentState.cameras.get(NO_PROXY)![node.camera!] as GLTF.ICamera

  useEffect(() => {
    if (camera.type === 'orthographic' || !camera.perspective)
      return console.warn('Orthographic cameras not supported yet')

    const perspectiveCamera = camera.perspective

    setComponent(props.entity, CameraComponent, {
      fov: MathUtils.radToDeg(perspectiveCamera.yfov),
      aspect: perspectiveCamera.aspectRatio || 1,
      near: perspectiveCamera.znear || 1,
      far: perspectiveCamera.zfar || 2e6
    })
  }, [camera])

  return null
}

const PrimitiveReactor = (props: { primitiveIndex: number; nodeIndex: number; documentID: string; entity: Entity }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])

  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  const primitive = mesh.primitives[props.primitiveIndex] as GLTF.IMeshPrimitive

  const geometry = useHookstate(null as null | BufferGeometry)

  const hasDracoCompression = primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]

  useEffect(() => {
    if (hasDracoCompression) {
      const options = getParserOptions(props.entity)
      KHR_DRACO_MESH_COMPRESSION.decodePrimitive(options, primitive).then((geom) => geometry.set(geom))
    } else {
      geometry.set(new BufferGeometry())
    }

    if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && 'COLOR_0' in primitive.attributes) {
      console.warn(
        `THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`
      )
    }
  }, [primitive.extensions])

  useEffect(() => {
    if (!geometry.value) return

    const mesh = new Mesh(geometry.value as BufferGeometry, new MeshBasicMaterial())
    /** @todo multiple primitive support */
    setComponent(props.entity, MeshComponent, mesh)
    addObjectToGroup(props.entity, mesh)

    assignExtrasToUserData(geometry, primitive as GLTF.IMeshPrimitive)

    GLTFLoaderFunctions.computeBounds(
      documentState.get(NO_PROXY) as GLTF.IGLTF,
      geometry.value as BufferGeometry,
      primitive as GLTF.IMeshPrimitive
    )

    return () => {
      removeComponent(props.entity, MeshComponent)
      removeObjectFromGroup(props.entity, mesh)
    }
  }, [geometry])

  if (!geometry.value) return null

  return (
    <>
      {typeof primitive.extensions === 'object' && (
        <PrimitiveExtensionReactor
          nodeIndex={props.nodeIndex}
          primitiveIndex={props.primitiveIndex}
          documentID={props.documentID}
          entity={props.entity}
        />
      )}
      {typeof primitive.material === 'number' && (
        <MaterialInstanceReactor
          nodeIndex={props.nodeIndex}
          primitiveIndex={props.primitiveIndex}
          documentID={props.documentID}
          entity={props.entity}
        />
      )}
      {!hasDracoCompression &&
        Object.keys(primitive.attributes).map((attribute, index) => (
          <PrimitiveAttributeReactor
            key={attribute}
            geometry={geometry.value as BufferGeometry}
            attribute={attribute}
            primitiveIndex={props.primitiveIndex}
            nodeIndex={props.nodeIndex}
            documentID={props.documentID}
            entity={props.entity}
          />
        ))}
      {!hasDracoCompression && typeof primitive.indices === 'number' && (
        <PrimitiveIndicesAttributeReactor
          geometry={geometry.value as BufferGeometry}
          primitiveIndex={props.primitiveIndex}
          nodeIndex={props.nodeIndex}
          documentID={props.documentID}
          entity={props.entity}
        />
      )}
    </>
  )
}

const PrimitiveExtensionReactor = (props: {
  nodeIndex: number
  primitiveIndex: number
  documentID: string
  entity: Entity
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])

  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  const primitive = mesh.primitives[props.primitiveIndex]

  const extensions = primitive.extensions

  useEffect(() => {
    if (!extensions) return

    for (const extension in extensions) {
      const Component = ComponentJSONIDMap.get(extension)
      if (!Component) continue
      setComponent(props.entity, Component, extensions[extension])
    }
  }, [extensions])

  return null
}

const PrimitiveAttributeReactor = (props: {
  geometry: BufferGeometry
  attribute: string
  primitiveIndex: number
  nodeIndex: number
  documentID: string
  entity: Entity
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])

  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  const primitive = mesh.primitives[props.primitiveIndex]

  const threeAttributeName = ATTRIBUTES[props.attribute] || props.attribute.toLowerCase()
  const attributeAlreadyLoaded = threeAttributeName in props.geometry.attributes

  // Skip attributes already provided by e.g. Draco extension.
  const attribute = attributeAlreadyLoaded ? undefined : primitive.attributes[props.attribute]

  const accessor = GLTFLoaderFunctions.useLoadAccessor(getParserOptions(props.entity), attribute)

  useEffect(() => {
    if (!accessor) return

    props.geometry.setAttribute(threeAttributeName, accessor)
  }, [accessor, props.geometry])

  return null
}

const PrimitiveIndicesAttributeReactor = (props: {
  geometry: BufferGeometry
  primitiveIndex: number
  nodeIndex: number
  documentID: string
  entity: Entity
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])

  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  const primitive = mesh.primitives[props.primitiveIndex]

  const accessor = GLTFLoaderFunctions.useLoadAccessor(getParserOptions(props.entity), primitive.indices!)

  useEffect(() => {
    if (!accessor) return
    props.geometry.setIndex(accessor)
  }, [accessor, props.geometry])

  return null
}

const MaterialInstanceReactor = (props: {
  nodeIndex: number
  documentID: string
  primitiveIndex: number
  entity: Entity
}) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])

  const nodes = documentState.nodes!.get(NO_PROXY)!
  const node = nodes[props.nodeIndex]!

  const mesh = documentState.meshes.get(NO_PROXY)![node.mesh!]

  const primitive = mesh.primitives[props.primitiveIndex]

  const materialUUID = (props.documentID + '-material-' + primitive.material!) as EntityUUID
  const materialEntity = UUIDComponent.useEntityByUUID(materialUUID)

  useEffect(() => {
    if (typeof primitive.material !== 'number' || !materialEntity) return

    setComponent(props.entity, MaterialInstanceComponent)
    getMutableComponent(props.entity, MaterialInstanceComponent).uuid.merge([materialUUID])
  }, [materialEntity, primitive.material])

  return null
}

/**
 * TODO figure out how to support extensions that change the behaviour of these reactors
 * - we pretty much have to add a new API for each dependency type, like how the GLTFLoader does
 */

export const getParserOptions = (entity: Entity) => {
  const gltfEntity = getAncestorWithComponent(entity, GLTFComponent)
  const document = getState(GLTFDocumentState)[getComponent(gltfEntity, SourceComponent)]
  const gltfComponent = getComponent(gltfEntity, GLTFComponent)
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  return {
    document,
    url: gltfComponent.src,
    path: LoaderUtils.extractUrlBase(gltfComponent.src),
    body: gltfComponent.body,
    crossOrigin: gltfLoader.crossOrigin,
    requestHeader: gltfLoader.requestHeader,
    manager: gltfLoader.manager,
    ktx2Loader: gltfLoader.ktx2Loader,
    meshoptDecoder: gltfLoader.meshoptDecoder
  } as GLTFParserOptions
}
